package com.respawn.finanzas.data

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import org.json.JSONArray
import org.json.JSONObject

class RespawnDbHelper(private val context: Context) :
    SQLiteOpenHelper(context, "respawn.db", null, 9) {

    override fun onConfigure(db: SQLiteDatabase) {
        super.onConfigure(db)
        db.setForeignKeyConstraintsEnabled(true)
    }

    override fun onCreate(db: SQLiteDatabase) {
        createCoreTables(db)
        putState(db, DefaultState.create())
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        createCoreTables(db)
        if (!hasState(db)) {
            val migrated = runCatching { migrateLegacy(db) }.getOrNull()
            putState(db, migrated ?: DefaultState.create())
        }
    }

    override fun onOpen(db: SQLiteDatabase) {
        super.onOpen(db)
        createCoreTables(db)
        if (!hasState(db)) putState(db, DefaultState.create())
    }

    private fun createCoreTables(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS state_store(
                key TEXT PRIMARY KEY NOT NULL,
                json TEXT NOT NULL
            )
            """.trimIndent()
        )
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS documents(
                id TEXT PRIMARY KEY NOT NULL,
                owner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                size_bytes INTEGER NOT NULL DEFAULT 0,
                added_at INTEGER NOT NULL,
                local_path TEXT NOT NULL
            )
            """.trimIndent()
        )
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id)")
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS internal_snapshots(
                id INTEGER PRIMARY KEY NOT NULL,
                created_at TEXT NOT NULL,
                payload TEXT NOT NULL
            )
            """.trimIndent()
        )
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS undo_store(
                id INTEGER PRIMARY KEY CHECK(id=1),
                label TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """.trimIndent()
        )
    }

    private fun hasState(db: SQLiteDatabase): Boolean =
        db.rawQuery("SELECT 1 FROM state_store WHERE key='core' LIMIT 1", null)
            .use { it.moveToFirst() }

    private fun tableExists(db: SQLiteDatabase, name: String): Boolean =
        db.rawQuery(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name=? LIMIT 1",
            arrayOf(name)
        ).use { it.moveToFirst() }

    private fun migrateLegacy(db: SQLiteDatabase): CoreState? {
        if (!tableExists(db, "debts")) return null

        val legacyPayments = mutableMapOf<String, MutableList<Payment>>()
        if (tableExists(db, "payments")) {
            db.rawQuery("SELECT id,debt_id,amount_cents,date,note FROM payments", null).use { c ->
                while (c.moveToNext()) {
                    val p = Payment(
                        id = c.getString(0),
                        date = c.getString(3) ?: "",
                        amount = c.getLong(2) / 100.0,
                        note = c.getString(4) ?: "",
                        createdAt = ""
                    )
                    legacyPayments.getOrPut(c.getString(1)) { mutableListOf() }.add(p)
                }
            }
        }

        val active = mutableListOf<Debt>()
        val trash = mutableListOf<Debt>()
        db.rawQuery("SELECT * FROM debts", null).use { c ->
            val idx = { name: String -> c.getColumnIndex(name) }
            while (c.moveToNext()) {
                val id = c.stringAt(idx("id")).ifBlank { StateCodec.uid() }
                val extra = c.stringAt(idx("extra_json"))
                val fromExtra = if (extra.isNotBlank() && extra != "{}") {
                    runCatching {
                        val root = JSONObject()
                            .put("app", "RESPAWN_DEBEDAS")
                            .put("version", 17)
                            .put("debts", JSONArray().put(JSONObject(extra)))
                        StateCodec.fromJson(root).debts.firstOrNull()
                    }.getOrNull()
                } else null

                val createdMs = c.longOrNull(idx("created_at"))
                val closedMs = c.longOrNull(idx("closed_at"))
                val base = fromExtra ?: Debt(
                    id = id,
                    name = c.stringAt(idx("name")).ifBlank { "Sen nome" },
                    amount = (c.longOrNull(idx("amount_cents")) ?: 0L) / 100.0,
                    category = c.stringAt(idx("category")).ifBlank { "Débeda actual" },
                    type = c.stringAt(idx("type")).ifBlank { "Outro" },
                    paid = c.intOrZero(idx("paid")) == 1,
                    createdAt = createdMs?.let { java.time.Instant.ofEpochMilli(it).toString() }
                        ?: StateCodec.nowIso(),
                    updatedAt = createdMs?.let { java.time.Instant.ofEpochMilli(it).toString() }
                        ?: StateCodec.nowIso(),
                    closedAt = closedMs?.let { java.time.Instant.ofEpochMilli(it).toString() } ?: "",
                    priority = c.stringAt(idx("priority")).ifBlank { "Normal" },
                    dueDate = c.stringAt(idx("due_date")),
                    apr = c.doubleOrZero(idx("apr")),
                    nextAction = c.stringAt(idx("next_action")),
                    legalStatus = c.stringAt(idx("legal_status")).ifBlank { "Por verificar" }
                )

                val merged = if (base.payments.isEmpty() && legacyPayments[id].orEmpty().isNotEmpty())
                    base.copy(payments = legacyPayments[id].orEmpty())
                else base

                if (c.intOrZero(idx("trashed")) == 1) {
                    trash += merged.copy(
                        trashedAt = merged.trashedAt.ifBlank { StateCodec.nowIso() }
                    )
                } else active += merged
            }
        }

        val notes = mutableListOf<GeneralNote>()
        if (tableExists(db, "general_notes")) {
            db.rawQuery("SELECT * FROM general_notes", null).use { c ->
                val idx = { name: String -> c.getColumnIndex(name) }
                while (c.moveToNext()) {
                    val extra = c.stringAt(idx("extra_json"))
                    val fromExtra = if (extra.isNotBlank() && extra != "{}") {
                        runCatching {
                            val root = JSONObject()
                                .put("app", "RESPAWN_DEBEDAS")
                                .put("version", 17)
                                .put("debts", JSONArray())
                                .put("generalNotes", JSONArray().put(JSONObject(extra)))
                            StateCodec.fromJson(root).generalNotes.firstOrNull()
                        }.getOrNull()
                    } else null

                    notes += fromExtra ?: GeneralNote(
                        id = c.stringAt(idx("id")).ifBlank { StateCodec.uid() },
                        title = c.stringAt(idx("title")),
                        category = c.stringAt(idx("category")).ifBlank { "Nota xeral" },
                        tag = c.stringAt(idx("tag")),
                        body = c.stringAt(idx("body")),
                        archived = c.intOrZero(idx("archived")) == 1,
                        createdAt = c.longOrNull(idx("created_at"))
                            ?.let { java.time.Instant.ofEpochMilli(it).toString() } ?: StateCodec.nowIso(),
                        updatedAt = c.longOrNull(idx("updated_at"))
                            ?.let { java.time.Instant.ofEpochMilli(it).toString() } ?: StateCodec.nowIso()
                    )
                }
            }
        }

        return CoreState(
            debts = active.ifEmpty { DefaultState.create().debts },
            trash = trash,
            generalNotes = notes
        )
    }

    private fun Cursor.stringAt(index: Int): String =
        if (index < 0 || isNull(index)) "" else getString(index) ?: ""

    private fun Cursor.longOrNull(index: Int): Long? =
        if (index < 0 || isNull(index)) null else getLong(index)

    private fun Cursor.intOrZero(index: Int): Int =
        if (index < 0 || isNull(index)) 0 else getInt(index)

    private fun Cursor.doubleOrZero(index: Int): Double =
        if (index < 0 || isNull(index)) 0.0 else getDouble(index)

    private fun putState(db: SQLiteDatabase, state: CoreState) {
        val values = ContentValues().apply {
            put("key", "core")
            put("json", StateCodec.encode(state))
        }
        db.insertWithOnConflict("state_store", null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun loadState(): CoreState {
        readableDatabase.rawQuery("SELECT json FROM state_store WHERE key='core'", null).use { c ->
            if (c.moveToFirst()) {
                return runCatching { StateCodec.decode(c.getString(0)) }
                    .getOrElse { DefaultState.create() }
            }
        }
        return DefaultState.create().also { saveState(it) }
    }

    fun saveState(state: CoreState) = putState(writableDatabase, state)

    fun listDocuments(ownerId: String? = null): List<DocumentRecord> {
        val where = if (ownerId != null) "owner_id=?" else null
        val args = ownerId?.let { arrayOf(it) }
        val out = mutableListOf<DocumentRecord>()
        readableDatabase.query(
            "documents", null, where, args, null, null, "added_at DESC"
        ).use { c ->
            while (c.moveToNext()) {
                out += DocumentRecord(
                    id = c.getString(c.getColumnIndexOrThrow("id")),
                    ownerId = c.getString(c.getColumnIndexOrThrow("owner_id")),
                    name = c.getString(c.getColumnIndexOrThrow("name")),
                    mimeType = c.getString(c.getColumnIndexOrThrow("mime_type")),
                    sizeBytes = c.getLong(c.getColumnIndexOrThrow("size_bytes")),
                    addedAt = c.getLong(c.getColumnIndexOrThrow("added_at")),
                    localPath = c.getString(c.getColumnIndexOrThrow("local_path"))
                )
            }
        }
        return out
    }

    fun insertDocument(doc: DocumentRecord) {
        val values = ContentValues().apply {
            put("id", doc.id)
            put("owner_id", doc.ownerId)
            put("name", doc.name)
            put("mime_type", doc.mimeType)
            put("size_bytes", doc.sizeBytes)
            put("added_at", doc.addedAt)
            put("local_path", doc.localPath)
        }
        writableDatabase.insertOrThrow("documents", null, values)
    }

    fun deleteDocument(id: String) {
        writableDatabase.delete("documents", "id=?", arrayOf(id))
    }

    fun deleteOwnerDocuments(ownerId: String): List<DocumentRecord> {
        val docs = listDocuments(ownerId)
        writableDatabase.delete("documents", "owner_id=?", arrayOf(ownerId))
        return docs
    }

    fun saveUndo(label: String, payload: String) {
        val values = ContentValues().apply {
            put("id", 1)
            put("label", label)
            put("payload", payload)
            put("created_at", StateCodec.nowIso())
        }
        writableDatabase.insertWithOnConflict(
            "undo_store", null, values, SQLiteDatabase.CONFLICT_REPLACE
        )
    }

    fun loadUndo(): Triple<String, String, String>? =
        readableDatabase.rawQuery(
            "SELECT label,payload,created_at FROM undo_store WHERE id=1", null
        ).use { c ->
            if (c.moveToFirst()) Triple(c.getString(0), c.getString(1), c.getString(2))
            else null
        }

    fun clearUndo() {
        writableDatabase.delete("undo_store", null, null)
    }

    fun addSnapshot(payload: String) {
        val id = System.currentTimeMillis()
        val values = ContentValues().apply {
            put("id", id)
            put("created_at", StateCodec.nowIso())
            put("payload", payload)
        }
        val db = writableDatabase
        db.insert("internal_snapshots", null, values)
        db.execSQL(
            """
            DELETE FROM internal_snapshots
            WHERE id NOT IN (
                SELECT id FROM internal_snapshots ORDER BY id DESC LIMIT 12
            )
            """.trimIndent()
        )
    }

    fun snapshots(): List<InternalSnapshot> {
        val out = mutableListOf<InternalSnapshot>()
        readableDatabase.rawQuery(
            "SELECT id,created_at,payload FROM internal_snapshots ORDER BY id DESC", null
        ).use { c ->
            while (c.moveToNext()) {
                out += InternalSnapshot(c.getLong(0), c.getString(1), c.getString(2))
            }
        }
        return out
    }

    fun restoreSnapshot(id: Long): CoreState? {
        readableDatabase.rawQuery(
            "SELECT payload FROM internal_snapshots WHERE id=?", arrayOf(id.toString())
        ).use { c ->
            if (c.moveToFirst()) {
                return runCatching { StateCodec.decode(c.getString(0)) }.getOrNull()
            }
        }
        return null
    }

    fun replaceAll(state: CoreState, docs: List<DocumentRecord>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            putState(db, state)
            db.delete("documents", null, null)
            docs.forEach { doc ->
                val values = ContentValues().apply {
                    put("id", doc.id)
                    put("owner_id", doc.ownerId)
                    put("name", doc.name)
                    put("mime_type", doc.mimeType)
                    put("size_bytes", doc.sizeBytes)
                    put("added_at", doc.addedAt)
                    put("local_path", doc.localPath)
                }
                db.insertOrThrow("documents", null, values)
            }
            db.delete("undo_store", null, null)
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }
}
