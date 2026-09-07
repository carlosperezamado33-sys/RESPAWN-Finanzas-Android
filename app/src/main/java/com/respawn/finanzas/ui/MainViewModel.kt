package com.respawn.finanzas.ui

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.respawn.finanzas.data.Debt
import com.respawn.finanzas.data.DebtWithBalance
import com.respawn.finanzas.data.ImportSummary
import com.respawn.finanzas.data.Payment
import com.respawn.finanzas.data.RespawnDbHelper
import com.respawn.finanzas.data.RespawnRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate

data class RespawnUiState(
    val loading: Boolean = true,
    val importing: Boolean = false,
    val debts: List<Debt> = emptyList(),
    val payments: List<Payment> = emptyList(),
    val error: String? = null,
    val importSummary: ImportSummary? = null,
    val importError: String? = null
) {
    val paymentTotals: Map<String, Long>
        get() = payments.groupBy { it.debtId }
            .mapValues { (_, rows) -> rows.sumOf { it.amountCents } }

    val balances: List<DebtWithBalance>
        get() = debts.map { debt ->
            DebtWithBalance(debt, paymentTotals[debt.id] ?: 0L)
        }
}

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = RespawnRepository(
        application,
        RespawnDbHelper(application)
    )

    private val _state = MutableStateFlow(RespawnUiState())
    val state: StateFlow<RespawnUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            runCatching { repository.snapshot() }
                .onSuccess { (debts, payments) ->
                    _state.value = _state.value.copy(
                        loading = false,
                        debts = debts,
                        payments = payments,
                        error = null
                    )
                }
                .onFailure {
                    _state.value = _state.value.copy(
                        loading = false,
                        error = it.message ?: "Erro descoñecido"
                    )
                }
        }
    }

    fun addDebt(name: String, euros: String, category: String, type: String) {
        val cents = euros.replace(",", ".").toBigDecimalOrNull()
            ?.movePointRight(2)?.toLong()
            ?: return
        if (name.isBlank() || cents <= 0) return

        viewModelScope.launch {
            repository.addDebt(name.trim(), cents, category, type)
            refresh()
        }
    }

    fun setPaid(id: String, paid: Boolean) {
        viewModelScope.launch {
            repository.setPaid(id, paid)
            refresh()
        }
    }

    fun addPayment(id: String, euros: String, note: String) {
        val cents = euros.replace(",", ".").toBigDecimalOrNull()
            ?.movePointRight(2)?.toLong()
            ?: return
        if (cents <= 0) return

        viewModelScope.launch {
            repository.addPayment(
                debtId = id,
                amountCents = cents,
                date = LocalDate.now().toString(),
                note = note.trim()
            )
            refresh()
        }
    }

    fun importPcBackup(uri: Uri) {
        viewModelScope.launch {
            _state.value = _state.value.copy(
                importing = true,
                importSummary = null,
                importError = null
            )

            runCatching { repository.importPcBackup(uri) }
                .onSuccess { summary ->
                    val (debts, payments) = repository.snapshot()
                    _state.value = _state.value.copy(
                        importing = false,
                        debts = debts,
                        payments = payments,
                        error = null,
                        importSummary = summary,
                        importError = null
                    )
                }
                .onFailure { error ->
                    _state.value = _state.value.copy(
                        importing = false,
                        importError = error.message ?: "Erro importando o backup"
                    )
                }
        }
    }

    fun clearImportMessage() {
        _state.value = _state.value.copy(
            importSummary = null,
            importError = null
        )
    }
}
