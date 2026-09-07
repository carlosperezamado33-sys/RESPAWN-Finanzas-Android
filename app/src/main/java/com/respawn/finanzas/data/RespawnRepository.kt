package com.respawn.finanzas.data

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RespawnRepository(
    private val context: Context,
    private val db: RespawnDbHelper
) {
    suspend fun snapshot(): Pair<List<Debt>, List<Payment>> =
        withContext(Dispatchers.IO) {
            db.listDebts() to db.listPayments()
        }

    suspend fun addDebt(
        name: String,
        amountCents: Long,
        category: String,
        type: String
    ) = withContext(Dispatchers.IO) {
        db.insertDebt(name, amountCents, category, type)
    }

    suspend fun setPaid(debtId: String, paid: Boolean) =
        withContext(Dispatchers.IO) {
            db.setPaid(debtId, paid)
        }

    suspend fun addPayment(
        debtId: String,
        amountCents: Long,
        date: String,
        note: String
    ) = withContext(Dispatchers.IO) {
        db.addPayment(debtId, amountCents, date, note)
    }

    suspend fun importPcBackup(uri: Uri): ImportSummary =
        withContext(Dispatchers.IO) {
            PcBackupImporter(context, db).import(uri)
        }
}
