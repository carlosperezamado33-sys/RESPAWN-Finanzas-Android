package com.respawn.finanzas.data

import android.content.Context
import android.net.Uri
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest
import java.security.SecureRandom
import java.time.Instant
import java.util.UUID
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

class BackupService(
    private val context: Context,
    private val db: RespawnDbHelper,
    private val repository: RespawnRepository
) {
    suspend fun createFullJsonFile(): File {
        val state = db.loadState()
        val root = StateCodec.toJson(state)
        root.put("files", packDocuments(db.listDocuments()))
        val file = exportFile("RESPAWN_BACKUP_COMPLETO_${StateCodec.todayKey()}.json")
        file.writeText(root.toString(2), Charsets.UTF_8)
        repository.markExternalBackupClean()
        return file
    }

    suspend fun createEncryptedFile(password: String): File {
        require(password.length >= 8) { "Usa un contrasinal de polo menos 8 caracteres." }
        val state = db.loadState()
        val root = StateCodec.toJson(state).apply {
            put("files", packDocuments(db.listDocuments()))
        }
        val plain = root.toString().toByteArray(Charsets.UTF_8)
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        val iv = ByteArray(12).also { SecureRandom().nextBytes(it) }
        val key = deriveKey(password, salt)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(128, iv))
        val encrypted = cipher.doFinal(plain)

        val envelope = JSONObject().apply {
            put("format", "RESPAWN_ENCRYPTED")
            put("version", 1)
            put("kdf", "PBKDF2-SHA256")
            put("iterations", 250000)
            put("cipher", "AES-256-GCM")
            put("salt", Base64.encodeToString(salt, Base64.NO_WRAP))
            put("iv", Base64.encodeToString(iv, Base64.NO_WRAP))
            put("data", Base64.encodeToString(encrypted, Base64.NO_WRAP))
        }

        val file = exportFile("RESPAWN_CIFRADO_${StateCodec.todayKey()}.respawn")
        file.writeText(envelope.toString(), Charsets.UTF_8)
        repository.markExternalBackupClean()
        return file
    }

    suspend fun createArchiveZip(reportService: ReportService): File {
        val state = db.loadState()
        val docs = db.listDocuments()
        val backupRoot = StateCodec.toJson(state).apply {
            put("files", packDocuments(docs))
        }
        val file = exportFile("RESPAWN_ARCHIVE_${StateCodec.todayKey()}.zip")
        ZipOutputStream(file.outputStream().buffered()).use { zip ->
            addBytes(zip, "RESPAWN_BACKUP_COMPLETO.json", backupRoot.toString(2).toByteArray())
            addBytes(zip, "informes/INFORME_GLOBAL.txt", reportService.globalReportText(state).toByteArray())
            (state.debts + state.trash).forEach { d ->
                val prefix = if (d.trashedAt.isNotBlank()) "PAPELEIRA_" else ""
                addBytes(
                    zip,
                    "dossiers/${prefix}${safeName(d.name)}_${d.id.takeLast(6)}.txt",
                    reportService.dossierText(d).toByteArray()
                )
            }
            docs.forEach { doc ->
                val source = File(doc.localPath)
                if (source.exists()) {
                    val ownerFolder = when {
                        doc.ownerId.startsWith("GLOBAL:") ->
                            "fontes/${safeName(doc.ownerId.removePrefix("GLOBAL:"))}"
                        doc.ownerId.startsWith("NOTE:") -> {
                            val noteId = doc.ownerId.removePrefix("NOTE:")
                            val note = state.generalNotes.firstOrNull { it.id == noteId }
                            "caderno/${safeName(note?.title ?: "nota")}"
                        }
                        else -> {
                            val debt = (state.debts + state.trash).firstOrNull { it.id == doc.ownerId }
                            "documentos/${if (debt?.trashedAt?.isNotBlank() == true) "PAPELEIRA_" else ""}${safeName(debt?.name ?: "sen_propietario")}"
                        }
                    }
                    zip.putNextEntry(ZipEntry("$ownerFolder/${safeName(doc.name)}"))
                    source.inputStream().use { it.copyTo(zip) }
                    zip.closeEntry()
                }
            }
        }
        repository.markExternalBackupClean()
        return file
    }

    suspend fun restorePlain(uri: Uri): BackupSummary {
        val text = context.contentResolver.openInputStream(uri)
            ?.bufferedReader()?.use { it.readText() }
            ?: error("Non se puido ler o backup.")
        return restoreRoot(JSONObject(text))
    }

    suspend fun restoreEncrypted(uri: Uri, password: String): BackupSummary {
        val text = context.contentResolver.openInputStream(uri)
            ?.bufferedReader()?.use { it.readText() }
            ?: error("Non se puido ler o backup cifrado.")
        val env = JSONObject(text)
        require(env.optString("format") == "RESPAWN_ENCRYPTED") {
            "O ficheiro non é un backup cifrado RESPAWN."
        }
        val salt = Base64.decode(env.getString("salt"), Base64.DEFAULT)
        val iv = Base64.decode(env.getString("iv"), Base64.DEFAULT)
        val data = Base64.decode(env.getString("data"), Base64.DEFAULT)
        val key = deriveKey(password, salt)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
        val plain = cipher.doFinal(data)
        return restoreRoot(JSONObject(String(plain, Charsets.UTF_8)))
    }

    private suspend fun restoreRoot(root: JSONObject): BackupSummary {
        require(root.optString("app") == "RESPAWN_DEBEDAS") {
            "O ficheiro non é un backup RESPAWN compatible."
        }
        val state = StateCodec.fromJson(root)
        val files = root.optJSONArray("files") ?: JSONArray()
        val importDir = File(
            context.filesDir,
            "documents_restore_${System.currentTimeMillis()}"
        ).apply { mkdirs() }

        val staged = mutableListOf<DocumentRecord>()
        var skipped = 0
        for (i in 0 until files.length()) {
            val item = files.optJSONObject(i) ?: continue
            val dataUrl = item.optString("dataURL")
            if (!dataUrl.startsWith("data:") || !dataUrl.contains(",")) {
                skipped++
                continue
            }
            runCatching {
                val comma = dataUrl.indexOf(',')
                val header = dataUrl.substring(0, comma)
                require(header.contains(";base64"))
                val payload = dataUrl.substring(comma + 1)
                val bytes = Base64.decode(payload, Base64.DEFAULT)
                val id = item.optString("id").ifBlank { UUID.randomUUID().toString() }
                val original = item.optString("name", "documento.pdf")
                val safe = original.replace(Regex("""[^\p{L}\p{N}._ -]"""), "_")
                val target = File(importDir, "${id.takeLast(8)}_$safe")
                target.writeBytes(bytes)
                staged += DocumentRecord(
                    id = id,
                    ownerId = item.optString("debtId"),
                    name = original,
                    mimeType = item.optString("type", "application/pdf"),
                    sizeBytes = if (item.has("size")) item.optLong("size") else bytes.size.toLong(),
                    addedAt = parseTime(item.optString("addedAt")),
                    localPath = target.absolutePath
                )
            }.onFailure { skipped++ }
        }

        val oldDocs = db.listDocuments()
        try {
            repository.replaceFromBackup(state, staged)
        } catch (t: Throwable) {
            importDir.deleteRecursively()
            throw t
        }
        oldDocs.forEach { runCatching { File(it.localPath).delete() } }
        context.filesDir.listFiles()
            ?.filter {
                it.isDirectory &&
                    (it.name.startsWith("attachments_import_") ||
                     it.name.startsWith("documents_restore_")) &&
                    it != importDir
            }
            ?.forEach { it.deleteRecursively() }

        val activeArray = root.optJSONArray("debts") ?: JSONArray()
        val trashArray = root.optJSONArray("trash") ?: JSONArray()
        val paymentCount = state.debts.sumOf { it.payments.size } +
            state.trash.sumOf { it.payments.size }

        return BackupSummary(
            version = root.optInt("version", 0),
            debts = activeArray.length(),
            trashedDebts = trashArray.length(),
            payments = paymentCount,
            notes = state.generalNotes.size,
            documents = staged.size,
            skippedDocuments = skipped,
            importedTheme = state.settings.theme.takeIf { it in listOf("obsidian", "ivory") }
        )
    }

    private fun packDocuments(docs: List<DocumentRecord>): JSONArray {
        val arr = JSONArray()
        docs.forEach { doc ->
            val f = File(doc.localPath)
            if (!f.exists()) return@forEach
            val base64 = Base64.encodeToString(f.readBytes(), Base64.NO_WRAP)
            arr.put(JSONObject().apply {
                put("id", doc.id)
                put("debtId", doc.ownerId)
                put("name", doc.name)
                put("type", doc.mimeType)
                put("size", doc.sizeBytes)
                put("addedAt", Instant.ofEpochMilli(doc.addedAt).toString())
                put("dataURL", "data:${doc.mimeType};base64,$base64")
            })
        }
        return arr
    }

    private fun deriveKey(password: String, salt: ByteArray): SecretKeySpec {
        val spec = PBEKeySpec(password.toCharArray(), salt, 250000, 256)
        val bytes = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
            .generateSecret(spec).encoded
        return SecretKeySpec(bytes, "AES")
    }

    private fun exportFile(name: String): File =
        File(context.cacheDir, "respawn_exports").apply { mkdirs() }
            .resolve(name).also { if (it.exists()) it.delete() }

    private fun addBytes(zip: ZipOutputStream, name: String, bytes: ByteArray) {
        zip.putNextEntry(ZipEntry(name))
        zip.write(bytes)
        zip.closeEntry()
    }

    private fun safeName(value: String): String =
        value.replace(Regex("""[^\p{L}\p{N}._-]+"""), "_").trim('_').take(90)
            .ifBlank { "item" }

    private fun parseTime(value: String): Long =
        runCatching { Instant.parse(value).toEpochMilli() }
            .getOrElse { System.currentTimeMillis() }
}

object LockSecurity {
    fun create(password: String): Pair<String, String> {
        require(password.length >= 6) { "Usa polo menos 6 caracteres." }
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        val hash = digest(password, salt)
        return Base64.encodeToString(salt, Base64.NO_WRAP) to
            Base64.encodeToString(hash, Base64.NO_WRAP)
    }

    fun verify(password: String, saltB64: String, hashB64: String): Boolean {
        if (saltB64.isBlank() || hashB64.isBlank()) return false
        val salt = Base64.decode(saltB64, Base64.DEFAULT)
        val expected = Base64.decode(hashB64, Base64.DEFAULT)
        return MessageDigest.isEqual(expected, digest(password, salt))
    }

    private fun digest(password: String, salt: ByteArray): ByteArray {
        val md = MessageDigest.getInstance("SHA-256")
        md.update(salt)
        return md.digest(password.toByteArray(Charsets.UTF_8))
    }
}
