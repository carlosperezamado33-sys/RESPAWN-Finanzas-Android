package com.respawn.finanzas.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import java.util.UUID

class RespawnDbHelper(context: Context) :
    SQLiteOpenHelper(context, "respawn.db", null, 2) {

    override fun onConfigure(db: SQLiteDatabase) {
        super.onConfigure(db)
        db.setForeignKeyConstraintsEnabled(true)
    }

    override fun onCreate(db: SQLiteDatabase) {
        createDebtTable(db)
        createPaymentTable(db)
        createNoteTable(db)
        createDocumentTable(db)
        seedDefaults(db)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            runCatching {
                db.execSQL("ALTER TABLE debts ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'")
            }
            runCatching {
                db.execSQL("ALTER TABLE debts ADD COLUMN trashed INTEGER NOT NULL DEFAULT 0")
            }
            createNoteTable(db)
            createDocumentTable(db)
        }
    }

    private fun createDebtTable(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS debts (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                amount_cents INTEGER NOT NULL,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                paid INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                closed_at INTEGER,
                priority TEXT NOT NULL DEFAULT 'Normal',
                due_date TEXT NOT NULL DEFAULT '',
                apr REAL NOT NULL DEFAULT 0,
                next_action TEXT NOT NULL DEFAULT '',
                legal_status TEXT NOT NULL DEFAULT 'Por verificar',
                extra_json TEXT NOT NULL DEFAULT '{}',
                trashed INTEGER NOT NULL DEFAULT 0
            )
            """.trimIndent()
        )
    }

    private fun createPaymentTable(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY NOT NULL,
                debt_id TEXT NOT NULL,
                amount_cents INTEGER NOT NULL,
                date TEXT NOT NULL,
                note TEXT NOT NULL DEFAULT '',
                FOREIGN KEY(debt_id) REFERENCES debts(id) ON DELETE CASCADE
            )
            """.trimIndent()
        )
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_payments_debt ON payments(debt_id)")
    }

    private fun createNoteTable(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS general_notes (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                tag TEXT NOT NULL DEFAULT '',
                body TEXT NOT NULL DEFAULT '',
                archived INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                extra_json TEXT NOT NULL DEFAULT '{}'
            )
            """.trimIndent()
        )
    }

    private fun createDocumentTable(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS documents (
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
    }

    private fun seedDefaults(db: SQLiteDatabase) {
        val now = System.currentTimeMillis()
        DefaultDebts.all.forEach { seed ->
            val values = ContentValues().apply {
                put("id", UUID.randomUUID().toString())
                put("name", seed.name)
                put("amount_cents", seed.amountCents)
                put("category", seed.category)
                put("type", seed.type)
                put("paid", 0)
                put("created_at", now)
                putNull("closed_at")
                put("priority", "Normal")
                put("due_date", "")
                put("apr", 0.0)
                put("next_action", "")
                put("legal_status", "Por verificar")
                put("extra_json", "{}")
                put("trashed", 0)
            }
            db.insertOrThrow("debts", null, values)
        }
    }

    fun listDebts(): List<Debt> {
        val result = mutableListOf<Debt>()
        readableDatabase.query(
            "debts",
            null,
            "trashed=0",
            null,
            null,
            null,
            "paid ASC, category ASC, name COLLATE NOCASE ASC"
        ).use { c ->
            while (c.moveToNext()) {
                result += Debt(
                    id = c.getString(c.getColumnIndexOrThrow("id")),
                    name = c.getString(c.getColumnIndexOrThrow("name")),
                    amountCents = c.getLong(c.getColumnIndexOrThrow("amount_cents")),
                    category = c.getString(c.getColumnIndexOrThrow("category")),
                    type = c.getString(c.getColumnIndexOrThrow("type")),
                    paid = c.getInt(c.getColumnIndexOrThrow("paid")) == 1,
                    createdAt = c.getLong(c.getColumnIndexOrThrow("created_at")),
                    closedAt = c.getColumnIndexOrThrow("closed_at").let { i ->
                        if (c.isNull(i)) null else c.getLong(i)
                    },
                    priority = c.getString(c.getColumnIndexOrThrow("priority")),
                    dueDate = c.getString(c.getColumnIndexOrThrow("due_date")),
                    apr = c.getDouble(c.getColumnIndexOrThrow("apr")),
                    nextAction = c.getString(c.getColumnIndexOrThrow("next_action")),
                    legalStatus = c.getString(c.getColumnIndexOrThrow("legal_status"))
                )
            }
        }
        return result
    }

    fun listPayments(): List<Payment> {
        val result = mutableListOf<Payment>()
        readableDatabase.query(
            "payments",
            null,
            null,
            null,
            null,
            null,
            "date DESC"
        ).use { c ->
            while (c.moveToNext()) {
                result += Payment(
                    id = c.getString(c.getColumnIndexOrThrow("id")),
                    debtId = c.getString(c.getColumnIndexOrThrow("debt_id")),
                    amountCents = c.getLong(c.getColumnIndexOrThrow("amount_cents")),
                    date = c.getString(c.getColumnIndexOrThrow("date")),
                    note = c.getString(c.getColumnIndexOrThrow("note"))
                )
            }
        }
        return result
    }

    fun insertDebt(name: String, amountCents: Long, category: String, type: String) {
        val values = ContentValues().apply {
            put("id", UUID.randomUUID().toString())
            put("name", name)
            put("amount_cents", amountCents)
            put("category", category)
            put("type", type)
            put("paid", 0)
            put("created_at", System.currentTimeMillis())
            putNull("closed_at")
            put("priority", "Normal")
            put("due_date", "")
            put("apr", 0.0)
            put("next_action", "")
            put("legal_status", "Por verificar")
            put("extra_json", "{}")
            put("trashed", 0)
        }
        writableDatabase.insertOrThrow("debts", null, values)
    }

    fun setPaid(debtId: String, paid: Boolean) {
        val values = ContentValues().apply {
            put("paid", if (paid) 1 else 0)
            if (paid) put("closed_at", System.currentTimeMillis()) else putNull("closed_at")
            put("legal_status", if (paid) "Saldada" else "Por verificar")
        }
        writableDatabase.update("debts", values, "id=?", arrayOf(debtId))
    }

    fun addPayment(debtId: String, amountCents: Long, date: String, note: String) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            val values = ContentValues().apply {
                put("id", UUID.randomUUID().toString())
                put("debt_id", debtId)
                put("amount_cents", amountCents)
                put("date", date)
                put("note", note)
            }
            db.insertOrThrow("payments", null, values)

            val base = db.rawQuery(
                "SELECT amount_cents FROM debts WHERE id=?",
                arrayOf(debtId)
            ).use { c -> if (c.moveToFirst()) c.getLong(0) else 0L }

            val paidTotal = db.rawQuery(
                "SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE debt_id=?",
                arrayOf(debtId)
            ).use { c -> if (c.moveToFirst()) c.getLong(0) else 0L }

            if (base > 0 && paidTotal >= base) {
                val paidValues = ContentValues().apply {
                    put("paid", 1)
                    put("closed_at", System.currentTimeMillis())
                    put("legal_status", "Saldada")
                }
                db.update("debts", paidValues, "id=?", arrayOf(debtId))
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }
}
