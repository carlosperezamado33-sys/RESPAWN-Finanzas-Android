package com.respawn.finanzas.data

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID

data class AppSnapshot(
    val state: CoreState,
    val documents: List<DocumentRecord>,
    val snapshots: List<InternalSnapshot>,
    val undoLabel: String?
)

class RespawnRepository(
    private val context: Context,
    private val db: RespawnDbHelper
) {
    private val mutex = Mutex()

    suspend fun snapshot(): AppSnapshot = withContext(Dispatchers.IO) {
        AppSnapshot(
            state = db.loadState(),
            documents = db.listDocuments(),
            snapshots = db.snapshots(),
            undoLabel = db.loadUndo()?.first
        )
    }

    private fun addHistory(state: CoreState, reason: String, force: Boolean = false): CoreState {
        val t = FinanceLogic.totals(state.debts)
        val date = StateCodec.todayKey()
        val row = HistoryEntry(
            date = date,
            live = t.live,
            total = t.total,
            resolved = t.resolved,
            reason = reason,
            at = StateCodec.nowIso()
        )
        val h = state.history.toMutableList()
        val idx = h.indexOfLast { it.date == date }
        if (idx >= 0 && !force) h[idx] = row else h += row
        return state.copy(history = h.sortedBy { it.at })
    }

    private fun dirty(state: CoreState): CoreState =
        state.copy(
            settings = state.settings.copy(
                dirtySinceBackup = true,
                lastChangeAt = StateCodec.nowIso()
            )
        )

    private suspend fun mutate(
        label: String,
        reason: String = label,
        recordHistory: Boolean = true,
        forceHistory: Boolean = false,
        block: (CoreState) -> CoreState
    ): CoreState = withContext(Dispatchers.IO) {
        mutex.withLock {
            val before = db.loadState()
            db.saveUndo(label, StateCodec.encode(before))
            var after = dirty(block(before))
            if (recordHistory) after = addHistory(after, reason, forceHistory)
            db.saveState(after)
            db.addSnapshot(StateCodec.encode(after))
            after
        }
    }

    private suspend fun mutateWithoutUndo(
        recordHistory: Boolean = false,
        reason: String = "actualización",
        block: (CoreState) -> CoreState
    ): CoreState = withContext(Dispatchers.IO) {
        mutex.withLock {
            var after = dirty(block(db.loadState()))
            if (recordHistory) after = addHistory(after, reason)
            db.saveState(after)
            db.addSnapshot(StateCodec.encode(after))
            after
        }
    }

    suspend fun recordSnapshot(reason: String = "foto manual", force: Boolean = true) =
        withContext(Dispatchers.IO) {
            mutex.withLock {
                val s = addHistory(dirty(db.loadState()), reason, force)
                db.saveState(s)
                db.addSnapshot(StateCodec.encode(s))
            }
        }

    suspend fun undo(): Boolean = withContext(Dispatchers.IO) {
        mutex.withLock {
            val u = db.loadUndo() ?: return@withLock false
            val restored = runCatching { StateCodec.decode(u.second) }.getOrNull()
                ?: return@withLock false
            db.saveState(
                restored.copy(
                    settings = restored.settings.copy(
                        dirtySinceBackup = true,
                        lastChangeAt = StateCodec.nowIso()
                    )
                )
            )
            db.clearUndo()
            db.addSnapshot(StateCodec.encode(restored))
            true
        }
    }

    suspend fun restoreInternalSnapshot(id: Long): Boolean = withContext(Dispatchers.IO) {
        mutex.withLock {
            val snap = db.restoreSnapshot(id) ?: return@withLock false
            db.saveUndo("restaurar copia interna", StateCodec.encode(db.loadState()))
            val restored = snap.copy(
                settings = snap.settings.copy(
                    dirtySinceBackup = true,
                    lastChangeAt = StateCodec.nowIso()
                )
            )
            db.saveState(restored)
            db.addSnapshot(StateCodec.encode(restored))
            true
        }
    }

    suspend fun addDebt(name: String, amount: Double, category: String, type: String) {
        mutate("engadir $name", "nova débeda") { s ->
            val now = StateCodec.nowIso()
            s.copy(
                debts = s.debts + Debt(
                    id = StateCodec.uid(),
                    name = name.trim(),
                    amount = amount,
                    category = category,
                    type = type,
                    createdAt = now,
                    updatedAt = now
                )
            )
        }
    }

    suspend fun updateDebtBase(id: String, name: String, amount: Double, category: String) {
        mutate("editar ${name.trim()}", "débeda editada") { s ->
            s.copy(debts = s.debts.map { d ->
                if (d.id == id) d.copy(
                    name = name.trim(),
                    amount = amount,
                    category = category,
                    updatedAt = StateCodec.nowIso()
                ) else d
            })
        }
    }

    suspend fun setPaid(id: String, paid: Boolean) {
        val d = db.loadState().debts.firstOrNull { it.id == id } ?: return
        mutate(
            if (paid) "marcar ${d.name} como saldada" else "reabrir ${d.name}",
            if (paid) "débeda saldada" else "débeda reaberta"
        ) { s ->
            s.copy(debts = s.debts.map { x ->
                if (x.id != id) x else {
                    val now = StateCodec.nowIso()
                    x.copy(
                        paid = paid,
                        closedAt = if (paid) now else "",
                        legalStatus = if (paid) "Saldada"
                        else if (x.legalStatus == "Saldada") "Por verificar" else x.legalStatus,
                        updatedAt = now,
                        log = x.log + LogEntry(
                            StateCodec.uid(), now,
                            if (paid) "Débeda marcada como SALDADA." else "Débeda reaberta."
                        )
                    )
                }
            })
        }
    }

    suspend fun addPayment(id: String, date: String, amount: Double, note: String) {
        val current = db.loadState().debts.firstOrNull { it.id == id } ?: return
        require(amount > 0) { "Importe non válido." }
        require(amount <= FinanceLogic.rawBalance(current) + 0.01) {
            "O pago supera o saldo segundo o importe/acordo rexistrado."
        }

        mutate("engadir pago en ${current.name}", "pago parcial") { s ->
            s.copy(debts = s.debts.map { d ->
                if (d.id != id) d else {
                    val now = StateCodec.nowIso()
                    var changed = d.copy(
                        payments = d.payments + Payment(
                            StateCodec.uid(), date, amount, note.trim(), now
                        ),
                        log = d.log + LogEntry(
                            StateCodec.uid(), now,
                            "Pago rexistrado: ${"%.2f".format(amount)} €${if (note.isBlank()) "" else " · ${note.trim()}"}."
                        ),
                        updatedAt = now
                    )
                    if (FinanceLogic.rawBalance(changed) <= 0.005) {
                        changed = changed.copy(
                            paid = true,
                            closedAt = now,
                            legalStatus = "Saldada",
                            log = changed.log + LogEntry(
                                StateCodec.uid(), now,
                                "Saldo cuberto polos pagos. Débeda SALDADA."
                            )
                        )
                    }
                    changed
                }
            })
        }
    }

    suspend fun deletePayment(debtId: String, paymentId: String) {
        val current = db.loadState().debts.firstOrNull { it.id == debtId } ?: return
        mutate("eliminar pago de ${current.name}", "pago eliminado") { s ->
            s.copy(debts = s.debts.map { d ->
                if (d.id != debtId) d else {
                    val p = d.payments.firstOrNull { it.id == paymentId }
                    val now = StateCodec.nowIso()
                    var changed = d.copy(
                        payments = d.payments.filterNot { it.id == paymentId },
                        log = d.log + LogEntry(
                            StateCodec.uid(), now,
                            "Eliminouse un pago rexistrado${p?.let { " de ${"%.2f".format(it.amount)} €" } ?: ""}."
                        ),
                        updatedAt = now
                    )
                    if (changed.paid && FinanceLogic.rawBalance(changed) > 0.005) {
                        changed = changed.copy(
                            paid = false,
                            closedAt = "",
                            legalStatus = if (changed.legalStatus == "Saldada") "Por verificar"
                            else changed.legalStatus
                        )
                    }
                    changed
                }
            })
        }
    }

    suspend fun updateTracking(
        id: String,
        priority: String,
        dueDate: String,
        apr: Double,
        legalStatus: String,
        type: String,
        nextAction: String
    ) {
        mutate("actualizar seguimento", "seguimento actualizado", recordHistory = false) { s ->
            s.copy(debts = s.debts.map { d ->
                if (d.id != id) d else d.copy(
                    priority = priority,
                    dueDate = dueDate,
                    apr = apr,
                    legalStatus = legalStatus,
                    type = type,
                    nextAction = nextAction.trim(),
                    updatedAt = StateCodec.nowIso()
                )
            })
        }
    }

    suspend fun updateCreditor(id: String, creditor: Creditor) {
        mutate("actualizar acredor", recordHistory = false) { s ->
            s.copy(debts = s.debts.map {
                if (it.id == id) it.copy(creditor = creditor, updatedAt = StateCodec.nowIso()) else it
            })
        }
    }

    suspend fun updateAgreement(id: String, agreement: Agreement) {
        val current = db.loadState().debts.firstOrNull { it.id == id } ?: return
        require(agreement.settled <= 0 || agreement.settled + 0.01 >= FinanceLogic.sumPayments(current)) {
            "O importe acordado non pode ser menor ca os pagos xa rexistrados."
        }

        mutate("actualizar acordo", "acordo actualizado") { s ->
            s.copy(debts = s.debts.map { d ->
                if (d.id != id) d else {
                    val oldAccepted = d.agreement.status == "Aceptado"
                    val newLegal = when {
                        agreement.status == "Aceptado" -> "En acordo"
                        oldAccepted && d.legalStatus == "En acordo" -> "Por verificar"
                        else -> d.legalStatus
                    }
                    d.copy(
                        agreement = agreement,
                        legalStatus = newLegal,
                        updatedAt = StateCodec.nowIso()
                    )
                }
            })
        }
    }

    suspend fun updateDocFlags(id: String, flags: DocFlags) {
        mutate("actualizar semáforo documental", recordHistory = false) { s ->
            s.copy(debts = s.debts.map {
                if (it.id == id) it.copy(docs = flags, updatedAt = StateCodec.nowIso()) else it
            })
        }
    }

    suspend fun updateInvestigation(id: String, inv: Investigation) {
        mutate("actualizar investigación", recordHistory = false) { s ->
            s.copy(debts = s.debts.map {
                if (it.id == id) it.copy(investigation = inv, updatedAt = StateCodec.nowIso()) else it
            })
        }
    }

    suspend fun updateDebtNotes(id: String, notes: String) {
        mutateWithoutUndo { s ->
            s.copy(debts = s.debts.map {
                if (it.id == id) it.copy(notes = notes, updatedAt = StateCodec.nowIso()) else it
            })
        }
    }

    suspend fun addLog(id: String, text: String) {
        if (text.isBlank()) return
        mutateWithoutUndo { s ->
            s.copy(debts = s.debts.map {
                if (it.id == id) it.copy(
                    log = it.log + LogEntry(StateCodec.uid(), StateCodec.nowIso(), text.trim()),
                    updatedAt = StateCodec.nowIso()
                ) else it
            })
        }
    }

    suspend fun deleteLog(id: String, logId: String) {
        mutateWithoutUndo { s ->
            s.copy(debts = s.debts.map {
                if (it.id == id) it.copy(log = it.log.filterNot { x -> x.id == logId }) else it
            })
        }
    }

    suspend fun moveToTrash(id: String) {
        val state = db.loadState()
        val d = state.debts.firstOrNull { it.id == id } ?: return
        mutate("eliminar ${d.name}", "débeda á papeleira") { s ->
            val item = s.debts.first { it.id == id }.copy(trashedAt = StateCodec.nowIso())
            s.copy(
                debts = s.debts.filterNot { it.id == id },
                trash = s.trash + item
            )
        }
    }

    suspend fun restoreFromTrash(id: String) {
        val state = db.loadState()
        val d = state.trash.firstOrNull { it.id == id } ?: return
        mutate("recuperar ${d.name}", "débeda recuperada da papeleira") { s ->
            val item = s.trash.first { it.id == id }.copy(trashedAt = "")
            s.copy(
                debts = s.debts + item,
                trash = s.trash.filterNot { it.id == id }
            )
        }
    }

    suspend fun deletePermanently(id: String) = withContext(Dispatchers.IO) {
        mutex.withLock {
            val before = db.loadState()
            val d = before.trash.firstOrNull { it.id == id } ?: return@withLock
            db.saveUndo("borrar definitivamente ${d.name}", StateCodec.encode(before))
            val after = dirty(before.copy(trash = before.trash.filterNot { it.id == id }))
            db.saveState(after)
            db.deleteOwnerDocuments(id).forEach { runCatching { File(it.localPath).delete() } }
            db.addSnapshot(StateCodec.encode(after))
        }
    }

    suspend fun addMission(text: String, date: String, priority: String) {
        mutateWithoutUndo { s ->
            s.copy(manualMissions = s.manualMissions + ManualMission(
                StateCodec.uid(), text.trim(), date, priority, false
            ))
        }
    }

    suspend fun toggleMission(id: String) {
        mutateWithoutUndo { s ->
            s.copy(manualMissions = s.manualMissions.map {
                if (it.id == id) it.copy(done = !it.done) else it
            })
        }
    }

    suspend fun deleteMission(id: String) {
        mutateWithoutUndo { s ->
            s.copy(manualMissions = s.manualMissions.filterNot { it.id == id })
        }
    }

    suspend fun saveBudget(budget: BudgetSettings) {
        mutateWithoutUndo { s -> s.copy(settings = s.settings.copy(budget = budget)) }
    }

    suspend fun saveFund(fund: FundSettings) {
        mutateWithoutUndo { s -> s.copy(settings = s.settings.copy(fund = fund)) }
    }

    suspend fun saveNetWorth(net: NetSettings) {
        mutateWithoutUndo { s ->
            val t = FinanceLogic.totals(s.debts)
            val assets = net.assets + net.other
            val row = NetWorthEntry(StateCodec.todayKey(), assets, t.live, assets - t.live)
            s.copy(
                settings = s.settings.copy(net = net),
                networthHistory = (s.networthHistory.filterNot { it.date == row.date } + row)
                    .sortedBy { it.date }
            )
        }
    }

    suspend fun saveSource(key: String, value: SourceControl) {
        mutateWithoutUndo { s ->
            s.copy(sources = s.sources.toMutableMap().apply { put(key, value) })
        }
    }

    suspend fun saveNote(note: GeneralNote) {
        mutateWithoutUndo { s ->
            val exists = s.generalNotes.any { it.id == note.id }
            val now = StateCodec.nowIso()
            val row = note.copy(
                createdAt = note.createdAt.ifBlank { now },
                updatedAt = now
            )
            s.copy(
                generalNotes = if (exists)
                    s.generalNotes.map { if (it.id == note.id) row else it }
                else s.generalNotes + row
            )
        }
    }

    suspend fun deleteNote(id: String) = withContext(Dispatchers.IO) {
        mutex.withLock {
            val before = db.loadState()
            val note = before.generalNotes.firstOrNull { it.id == id } ?: return@withLock
            db.saveUndo("eliminar ficha ${note.title}", StateCodec.encode(before))
            val after = dirty(before.copy(generalNotes = before.generalNotes.filterNot { it.id == id }))
            db.saveState(after)
            db.deleteOwnerDocuments("NOTE:$id").forEach { runCatching { File(it.localPath).delete() } }
            db.addSnapshot(StateCodec.encode(after))
        }
    }

    suspend fun setTheme(theme: String) {
        withContext(Dispatchers.IO) {
            mutex.withLock {
                val s = db.loadState()
                db.saveState(s.copy(settings = s.settings.copy(theme = theme)))
            }
        }
    }

    suspend fun saveSecurity(security: SecuritySettings) {
        withContext(Dispatchers.IO) {
            mutex.withLock {
                val s = db.loadState()
                db.saveState(s.copy(settings = s.settings.copy(security = security)))
            }
        }
    }

    suspend fun attachDocument(ownerId: String, uri: Uri): DocumentRecord =
        withContext(Dispatchers.IO) {
            mutex.withLock {
                val resolver = context.contentResolver
                val name = resolver.query(uri, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME),
                    null, null, null)?.use { c ->
                    if (c.moveToFirst()) c.getString(0) else null
                } ?: "documento.pdf"
                val type = resolver.getType(uri) ?: "application/pdf"
                val dir = File(context.filesDir, "documents").apply { mkdirs() }
                val id = UUID.randomUUID().toString()
                val safe = name.replace(Regex("""[^\p{L}\p{N}._ -]"""), "_")
                val target = File(dir, "${id.takeLast(8)}_$safe")
                resolver.openInputStream(uri)?.use { input ->
                    target.outputStream().use { output -> input.copyTo(output) }
                } ?: error("Non se puido ler o documento.")
                val doc = DocumentRecord(
                    id = id,
                    ownerId = ownerId,
                    name = name,
                    mimeType = type,
                    sizeBytes = target.length(),
                    addedAt = System.currentTimeMillis(),
                    localPath = target.absolutePath
                )
                db.insertDocument(doc)
                val s = dirty(db.loadState())
                db.saveState(s)
                db.addSnapshot(StateCodec.encode(s))
                doc
            }
        }

    suspend fun deleteDocument(id: String) = withContext(Dispatchers.IO) {
        mutex.withLock {
            val doc = db.listDocuments().firstOrNull { it.id == id } ?: return@withLock
            db.deleteDocument(id)
            runCatching { File(doc.localPath).delete() }
            val s = dirty(db.loadState())
            db.saveState(s)
        }
    }

    suspend fun markExternalBackupClean() = withContext(Dispatchers.IO) {
        mutex.withLock {
            val s = db.loadState()
            db.saveState(
                s.copy(settings = s.settings.copy(
                    dirtySinceBackup = false,
                    lastBackupAt = StateCodec.nowIso()
                ))
            )
        }
    }

    suspend fun replaceFromBackup(state: CoreState, docs: List<DocumentRecord>) =
        withContext(Dispatchers.IO) {
            mutex.withLock {
                db.saveUndo("restaurar backup", StateCodec.encode(db.loadState()))
                db.replaceAll(
                    state.copy(settings = state.settings.copy(
                        dirtySinceBackup = false,
                        lastBackupAt = StateCodec.nowIso()
                    )),
                    docs
                )
                db.addSnapshot(StateCodec.encode(state))
            }
        }
}
