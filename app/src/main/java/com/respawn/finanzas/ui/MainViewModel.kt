package com.respawn.finanzas.ui

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.respawn.finanzas.data.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

data class UiMessage(val title: String, val text: String)

data class RespawnUiState(
    val loading: Boolean = true,
    val busy: Boolean = false,
    val core: CoreState = DefaultState.create(),
    val documents: List<DocumentRecord> = emptyList(),
    val internalSnapshots: List<InternalSnapshot> = emptyList(),
    val undoLabel: String? = null,
    val message: UiMessage? = null
)

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val db = RespawnDbHelper(application)
    private val repository = RespawnRepository(application, db)
    private val backups = BackupService(application, db, repository)
    private val reports = ReportService(application)

    private val _state = MutableStateFlow(RespawnUiState())
    val state: StateFlow<RespawnUiState> = _state.asStateFlow()

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            runCatching { repository.snapshot() }
                .onSuccess { snap ->
                    _state.value = _state.value.copy(
                        loading = false,
                        busy = false,
                        core = snap.state,
                        documents = snap.documents,
                        internalSnapshots = snap.snapshots,
                        undoLabel = snap.undoLabel
                    )
                }
                .onFailure { fail("ERRO", it) }
        }
    }

    private fun launchMutation(block: suspend () -> Unit) {
        viewModelScope.launch {
            _state.value = _state.value.copy(busy = true)
            runCatching { withContext(Dispatchers.IO) { block() } }
                .onSuccess { refresh() }
                .onFailure { fail("NON SE PUIDO COMPLETAR", it) }
        }
    }

    private fun fail(title: String, t: Throwable) {
        _state.value = _state.value.copy(
            loading = false,
            busy = false,
            message = UiMessage(title, t.message ?: "Erro descoñecido")
        )
    }

    fun clearMessage() {
        _state.value = _state.value.copy(message = null)
    }

    fun toast(title: String, text: String) {
        _state.value = _state.value.copy(message = UiMessage(title, text))
    }

    fun addDebt(name: String, amount: Double, category: String, type: String) =
        launchMutation { repository.addDebt(name, amount, category, type) }

    fun updateDebtBase(id: String, name: String, amount: Double, category: String) =
        launchMutation { repository.updateDebtBase(id, name, amount, category) }

    fun setPaid(id: String, paid: Boolean) =
        launchMutation { repository.setPaid(id, paid) }

    fun addPayment(id: String, date: String, amount: Double, note: String) =
        launchMutation { repository.addPayment(id, date, amount, note) }

    fun deletePayment(debtId: String, paymentId: String) =
        launchMutation { repository.deletePayment(debtId, paymentId) }

    fun updateTracking(
        id: String, priority: String, dueDate: String, apr: Double,
        legalStatus: String, type: String, nextAction: String
    ) = launchMutation {
        repository.updateTracking(id, priority, dueDate, apr, legalStatus, type, nextAction)
    }

    fun updateCreditor(id: String, creditor: Creditor) =
        launchMutation { repository.updateCreditor(id, creditor) }

    fun updateAgreement(id: String, agreement: Agreement) =
        launchMutation { repository.updateAgreement(id, agreement) }

    fun updateDocFlags(id: String, flags: DocFlags) =
        launchMutation { repository.updateDocFlags(id, flags) }

    fun updateInvestigation(id: String, inv: Investigation) =
        launchMutation { repository.updateInvestigation(id, inv) }

    fun updateDebtNotes(id: String, notes: String) =
        launchMutation { repository.updateDebtNotes(id, notes) }

    fun addLog(id: String, text: String) =
        launchMutation { repository.addLog(id, text) }

    fun deleteLog(id: String, logId: String) =
        launchMutation { repository.deleteLog(id, logId) }

    fun moveToTrash(id: String) =
        launchMutation { repository.moveToTrash(id) }

    fun restoreFromTrash(id: String) =
        launchMutation { repository.restoreFromTrash(id) }

    fun deletePermanently(id: String) =
        launchMutation { repository.deletePermanently(id) }

    fun addMission(text: String, date: String, priority: String) =
        launchMutation { repository.addMission(text, date, priority) }

    fun toggleMission(id: String) =
        launchMutation { repository.toggleMission(id) }

    fun deleteMission(id: String) =
        launchMutation { repository.deleteMission(id) }

    fun saveBudget(value: BudgetSettings) =
        launchMutation { repository.saveBudget(value) }

    fun saveFund(value: FundSettings) =
        launchMutation { repository.saveFund(value) }

    fun saveNetWorth(value: NetSettings) =
        launchMutation { repository.saveNetWorth(value) }

    fun saveSource(key: String, value: SourceControl) =
        launchMutation { repository.saveSource(key, value) }

    fun saveNote(note: GeneralNote) =
        launchMutation { repository.saveNote(note) }

    fun deleteNote(id: String) =
        launchMutation { repository.deleteNote(id) }

    fun setTheme(theme: String) =
        launchMutation { repository.setTheme(theme) }

    fun saveSecurity(security: SecuritySettings) =
        launchMutation { repository.saveSecurity(security) }

    fun recordSnapshot(reason: String = "foto manual") =
        launchMutation { repository.recordSnapshot(reason, true) }

    fun undo() =
        launchMutation { repository.undo() }

    fun restoreInternalSnapshot(id: Long) =
        launchMutation {
            if (!repository.restoreInternalSnapshot(id))
                error("Non se puido restaurar esta copia.")
        }

    fun attachDocument(ownerId: String, uri: Uri) =
        launchMutation { repository.attachDocument(ownerId, uri) }

    fun deleteDocument(id: String) =
        launchMutation { repository.deleteDocument(id) }

    fun importPlain(uri: Uri) {
        viewModelScope.launch {
            _state.value = _state.value.copy(busy = true)
            runCatching { withContext(Dispatchers.IO) { backups.restorePlain(uri) } }
                .onSuccess { summary ->
                    refresh()
                    _state.value = _state.value.copy(
                        message = UiMessage(
                            "BACKUP IMPORTADO",
                            "Versión ${summary.version} · ${summary.debts} débedas · " +
                                "${summary.trashedDebts} en papeleira · ${summary.payments} pagos · " +
                                "${summary.notes} fichas · ${summary.documents} documentos" +
                                if (summary.skippedDocuments > 0)
                                    " · ${summary.skippedDocuments} documentos omitidos"
                                else ""
                        )
                    )
                }
                .onFailure { fail("NON SE PUIDO IMPORTAR", it) }
        }
    }

    fun importEncrypted(uri: Uri, password: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(busy = true)
            runCatching { withContext(Dispatchers.IO) { backups.restoreEncrypted(uri, password) } }
                .onSuccess { summary ->
                    refresh()
                    _state.value = _state.value.copy(
                        message = UiMessage(
                            "BACKUP CIFRADO RESTAURADO",
                            "${summary.debts} débedas · ${summary.documents} documentos"
                        )
                    )
                }
                .onFailure { fail("NON SE PUIDO DESCIFRAR", it) }
        }
    }

    fun createBackup(callback: (File?) -> Unit) = createFileTask("BACKUP", callback) {
        backups.createFullJsonFile()
    }

    fun createEncryptedBackup(password: String, callback: (File?) -> Unit) =
        createFileTask("BACKUP CIFRADO", callback) { backups.createEncryptedFile(password) }

    fun createZip(callback: (File?) -> Unit) = createFileTask("ZIP", callback) {
        backups.createArchiveZip(reports)
    }

    fun createGlobalReport(callback: (File?) -> Unit) = createFileTask("INFORME", callback) {
        reports.createGlobalPdf(db.loadState())
    }

    fun createDossier(debt: Debt, callback: (File?) -> Unit) =
        createFileTask("DOSSIER", callback) { reports.createDossierPdf(debt) }

    fun createMonthlyReport(month: String, callback: (File?) -> Unit) =
        createFileTask("RESUMO MENSUAL", callback) {
            reports.createMonthlyPdf(db.loadState(), month)
        }

    private fun createFileTask(
        label: String,
        callback: (File?) -> Unit,
        block: suspend () -> File
    ) {
        viewModelScope.launch {
            _state.value = _state.value.copy(busy = true)
            runCatching { withContext(Dispatchers.IO) { block() } }
                .onSuccess {
                    _state.value = _state.value.copy(busy = false)
                    refresh()
                    callback(it)
                }
                .onFailure {
                    callback(null)
                    fail("$label · ERRO", it)
                }
        }
    }

    fun buildLock(password: String, lockOnStart: Boolean) {
        runCatching {
            val pair = LockSecurity.create(password)
            SecuritySettings(
                lockEnabled = true,
                lockOnStart = lockOnStart,
                lockSalt = pair.first,
                lockHash = pair.second
            )
        }.onSuccess(::saveSecurity)
            .onFailure { fail("BLOQUEO", it) }
    }

    fun verifyLock(password: String): Boolean {
        val sec = _state.value.core.settings.security
        return LockSecurity.verify(password, sec.lockSalt, sec.lockHash)
    }
}
