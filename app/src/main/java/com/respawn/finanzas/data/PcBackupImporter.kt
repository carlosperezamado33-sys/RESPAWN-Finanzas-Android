package com.respawn.finanzas.data

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant
import java.util.UUID

data class ImportSummary(
    val backupVersion: Int,
    val debts: Int,
    val trashedDebts: Int,
    val payments: Int,
    val notes: Int,
    val documents: Int,
    val skippedDocuments: Int,
    val importedTheme: String?
)

class PcBackupImporter(
    private val context: Context,
    private val dbHelper: RespawnDbHelper
) {
    fun import(uri: Uri): ImportSummary {
        val text = context.contentResolver.openInputStream(uri)
            ?.bufferedReader()
            ?.use { it.readText() }
            ?: error("Non se puido ler o backup.")

        val root = JSONObject(text)
        require(root.optString("app") == "RESPAWN_DEBEDAS") {
            "O ficheiro non é un backup RESPAWN compatible."
        }

        val version = root.optInt("version", 0)
        val active = root.optJSONArray("debts") ?: JSONArray()
        val trash = root.optJSONArray("trash") ?: JSONArray()
        val notes = root.optJSONArray("generalNotes") ?: JSONArray()
        val files = root.optJSONArray("files") ?: JSONArray()
        val settings = root.optJSONObject("settings")
        val importedTheme = settings?.optString("theme")
            ?.takeIf { it == "obsidian" || it == "ivory" }

        val importDir = File(
            context.filesDir,
            "attachments_import_${System.currentTimeMillis()}"
        ).apply { mkdirs() }

        val stagedDocs = mutableListOf<StagedDocument>()
        var skippedDocs = 0

        for (i in 0 until files.length()) {
            val item = files.optJSONObject(i) ?: continue
            val dataUrl = item.optString("dataURL")
            if (!dataUrl.startsWith("data:") || !dataUrl.contains(",")) {
                skippedDocs++
                continue
            }

            runCatching {
                val comma = dataUrl.indexOf(',')
                val header = dataUrl.substring(0, comma)
                val payload = dataUrl.substring(comma + 1)
                require(header.contains(";base64"))

                val bytes = Base64.decode(payload, Base64.DEFAULT)
                val id = item.optString("id").ifBlank {
                    UUID.randomUUID().toString()
                }
                val originalName = item.optString("name", "documento.pdf")
                val safeName = originalName.replace(
                    Regex("""[^\p{L}\p{N}._ -]"""),
                    "_"
                )
                val file = File(importDir, "${id.takeLast(8)}_$safeName")
                file.writeBytes(bytes)

                stagedDocs += StagedDocument(
                    id = id,
                    ownerId = item.optString("debtId"),
                    name = originalName,
                    mime = item.optString("type", "application/pdf"),
                    size = if (item.has("size")) item.optLong("size")
                    else bytes.size.toLong(),
                    addedAt = parseTime(item.optString("addedAt")),
                    path = file.absolutePath
                )
            }.onFailure {
                skippedDocs++
            }
        }

        val db = dbHelper.writableDatabase
        var paymentCount = 0

        db.beginTransaction()
        try {
            db.delete("documents", null, null)
            db.delete("payments", null, null)
            db.delete("general_notes", null, null)
            db.delete("debts", null, null)

            fun insertDebtArray(array: JSONArray, trashed: Boolean) {
                for (i in 0 until array.length()) {
                    val d = array.optJSONObject(i) ?: continue
                    val id = d.optString("id").ifBlank {
                        UUID.randomUUID().toString()
                    }

                    val values = ContentValues().apply {
                        put("id", id)
                        put("name", d.optString("name", "Sen nome"))
                        put("amount_cents", moneyToCents(d.opt("amount")))
                        put("category", d.optString("category", "Débeda actual"))
                        put("type", d.optString("type", "Outro"))
                        put("paid", if (d.optBoolean("paid", false)) 1 else 0)
                        put("created_at", parseTime(d.optString("createdAt")))

                        val closed = d.optString("closedAt")
                        if (closed.isBlank()) putNull("closed_at")
                        else put("closed_at", parseTime(closed))

                        put("priority", d.optString("priority", "Normal"))
                        put("due_date", d.optString("dueDate", ""))
                        put("apr", d.optDouble("apr", 0.0))
                        put("next_action", d.optString("nextAction", ""))
                        put(
                            "legal_status",
                            d.optString(
                                "legalStatus",
                                if (d.optBoolean("paid")) "Saldada"
                                else "Por verificar"
                            )
                        )
                        put("extra_json", d.toString())
                        put("trashed", if (trashed) 1 else 0)
                    }
                    db.insertOrThrow("debts", null, values)

                    val payments = d.optJSONArray("payments") ?: JSONArray()
                    for (pIndex in 0 until payments.length()) {
                        val p = payments.optJSONObject(pIndex) ?: continue
                        val paymentValues = ContentValues().apply {
                            put(
                                "id",
                                p.optString("id").ifBlank {
                                    UUID.randomUUID().toString()
                                }
                            )
                            put("debt_id", id)
                            put("amount_cents", moneyToCents(p.opt("amount")))
                            put("date", p.optString("date", ""))
                            put("note", p.optString("note", ""))
                        }
                        db.insertOrThrow("payments", null, paymentValues)
                        paymentCount++
                    }
                }
            }

            insertDebtArray(active, false)
            insertDebtArray(trash, true)

            for (i in 0 until notes.length()) {
                val n = notes.optJSONObject(i) ?: continue
                val values = ContentValues().apply {
                    put(
                        "id",
                        n.optString("id").ifBlank {
                            UUID.randomUUID().toString()
                        }
                    )
                    put("title", n.optString("title", "Sen título"))
                    put("category", n.optString("category", "Nota xeral"))
                    put("tag", n.optString("tag", ""))
                    put("body", n.optString("body", ""))
                    put("archived", if (n.optBoolean("archived", false)) 1 else 0)
                    put("created_at", parseTime(n.optString("createdAt")))
                    put("updated_at", parseTime(n.optString("updatedAt")))
                    put("extra_json", n.toString())
                }
                db.insertOrThrow("general_notes", null, values)
            }

            stagedDocs.forEach { doc ->
                val values = ContentValues().apply {
                    put("id", doc.id)
                    put("owner_id", doc.ownerId)
                    put("name", doc.name)
                    put("mime_type", doc.mime)
                    put("size_bytes", doc.size)
                    put("added_at", doc.addedAt)
                    put("local_path", doc.path)
                }
                db.insertOrThrow("documents", null, values)
            }

            db.setTransactionSuccessful()
        } catch (t: Throwable) {
            importDir.deleteRecursively()
            throw t
        } finally {
            db.endTransaction()
        }

        // Só despois do commit eliminamos importacións documentais anteriores.
        context.filesDir.listFiles()
            ?.filter {
                it.isDirectory &&
                    it.name.startsWith("attachments_import_") &&
                    it != importDir
            }
            ?.forEach { it.deleteRecursively() }

        importedTheme?.let {
            context.getSharedPreferences(
                "respawn_settings",
                Context.MODE_PRIVATE
            ).edit().putString("theme", it).apply()
        }

        return ImportSummary(
            backupVersion = version,
            debts = active.length(),
            trashedDebts = trash.length(),
            payments = paymentCount,
            notes = notes.length(),
            documents = stagedDocs.size,
            skippedDocuments = skippedDocs,
            importedTheme = importedTheme
        )
    }

    private fun moneyToCents(value: Any?): Long {
        val text = when (value) {
            null, JSONObject.NULL -> "0"
            else -> value.toString()
        }

        return BigDecimal(text)
            .movePointRight(2)
            .setScale(0, RoundingMode.HALF_UP)
            .longValueExact()
    }

    private fun parseTime(value: String): Long {
        if (value.isBlank()) return System.currentTimeMillis()
        return runCatching {
            Instant.parse(value).toEpochMilli()
        }.getOrElse {
            System.currentTimeMillis()
        }
    }

    private data class StagedDocument(
        val id: String,
        val ownerId: String,
        val name: String,
        val mime: String,
        val size: Long,
        val addedAt: Long,
        val path: String
    )
}
