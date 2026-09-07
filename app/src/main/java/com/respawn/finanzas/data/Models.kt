package com.respawn.finanzas.data

data class Creditor(
    val name: String = "",
    val ref: String = "",
    val phone: String = "",
    val email: String = ""
)

data class Agreement(
    val claimed: Double = 0.0,
    val offer: Double = 0.0,
    val settled: Double = 0.0,
    val status: String = "Sen negociación",
    val deadline: String = "",
    val note: String = ""
)

data class DocFlags(
    val contract: Boolean = false,
    val balance: Boolean = false,
    val creditor: Boolean = false,
    val claims: Boolean = false,
    val judicial: Boolean = false
)

data class Investigation(
    val lastPayment: String = "",
    val lastClaim: String = "",
    val lastContact: String = "",
    val judicial: String = "Descoñecido",
    val status: String = "Non avaliado",
    val note: String = ""
)

data class Payment(
    val id: String,
    val date: String,
    val amount: Double,
    val note: String = "",
    val createdAt: String = ""
)

data class LogEntry(
    val id: String,
    val at: String,
    val text: String
)

data class Debt(
    val id: String,
    val name: String,
    val amount: Double,
    val category: String,
    val type: String = "Outro",
    val paid: Boolean = false,
    val createdAt: String,
    val updatedAt: String,
    val closedAt: String = "",
    val notes: String = "",
    val priority: String = "Normal",
    val dueDate: String = "",
    val apr: Double = 0.0,
    val nextAction: String = "",
    val legalStatus: String = "Por verificar",
    val creditor: Creditor = Creditor(),
    val agreement: Agreement = Agreement(),
    val docs: DocFlags = DocFlags(),
    val investigation: Investigation = Investigation(),
    val payments: List<Payment> = emptyList(),
    val log: List<LogEntry> = emptyList(),
    val trashedAt: String = ""
)

data class HistoryEntry(
    val date: String,
    val live: Double,
    val total: Double,
    val resolved: Double,
    val reason: String = "",
    val at: String
)

data class BudgetSettings(
    val income: Double = 2850.0,
    val essentials: Double = 2057.44,
    val safety: Double = 200.0,
    val debt: Double = 500.0
)

data class FundSettings(
    val current: Double = 0.0,
    val target: Double = 500.0
)

data class NetSettings(
    val assets: Double = 215.0,
    val other: Double = 0.0
)

data class SecuritySettings(
    val lockEnabled: Boolean = false,
    val lockOnStart: Boolean = false,
    val lockSalt: String = "",
    val lockHash: String = ""
)

data class AppSettings(
    val budget: BudgetSettings = BudgetSettings(),
    val fund: FundSettings = FundSettings(),
    val net: NetSettings = NetSettings(),
    val baselineDate: String = "2026-08-13",
    val baselineTotal: Double = 28199.64,
    val dirtySinceBackup: Boolean = true,
    val lastBackupAt: String = "",
    val lastChangeAt: String = "",
    val theme: String = "obsidian",
    val security: SecuritySettings = SecuritySettings()
)

data class ManualMission(
    val id: String,
    val text: String,
    val date: String,
    val priority: String = "Normal",
    val done: Boolean = false
)

data class SourceControl(
    val date: String = "",
    val status: String = "Non comprobado",
    val note: String = ""
)

data class BankInfo(
    val name: String = "",
    val holder: String = "",
    val iban: String = "",
    val alias: String = "",
    val purpose: String = ""
)

data class GeneralNote(
    val id: String,
    val title: String,
    val category: String = "Nota xeral",
    val tag: String = "",
    val body: String = "",
    val bank: BankInfo = BankInfo(),
    val archived: Boolean = false,
    val createdAt: String,
    val updatedAt: String
)

data class NetWorthEntry(
    val date: String,
    val assets: Double,
    val debt: Double,
    val net: Double
)

data class CoreState(
    val app: String = "RESPAWN_DEBEDAS",
    val version: Int = 17,
    val debts: List<Debt>,
    val trash: List<Debt> = emptyList(),
    val history: List<HistoryEntry> = emptyList(),
    val settings: AppSettings = AppSettings(),
    val generalNotes: List<GeneralNote> = emptyList(),
    val manualMissions: List<ManualMission> = emptyList(),
    val sources: Map<String, SourceControl> = defaultSources(),
    val networthHistory: List<NetWorthEntry> = emptyList()
)

data class DocumentRecord(
    val id: String,
    val ownerId: String,
    val name: String,
    val mimeType: String,
    val sizeBytes: Long,
    val addedAt: Long,
    val localPath: String
)

data class InternalSnapshot(
    val id: Long,
    val createdAt: String,
    val payload: String
)

data class BackupSummary(
    val version: Int,
    val debts: Int,
    val trashedDebts: Int,
    val payments: Int,
    val notes: Int,
    val documents: Int,
    val skippedDocuments: Int,
    val importedTheme: String?
)

data class RiskInfo(
    val score: Int,
    val label: String
)

data class Totals(
    val total: Double,
    val live: Double,
    val resolved: Double,
    val payments: Double,
    val open: Int
)

data class AutoMission(
    val priority: String,
    val title: String,
    val desc: String,
    val debtId: String
)

data class MonthStats(
    val payments: Double,
    val newCount: Int,
    val newAmount: Double,
    val closedCount: Int,
    val closedAmount: Double,
    val start: Double?,
    val end: Double?,
    val net: Double?
)

fun defaultSources(): Map<String, SourceControl> =
    listOf("CIRBE", "ASNEF", "BADEXCUG", "XUDICIAL")
        .associateWith { SourceControl() }
