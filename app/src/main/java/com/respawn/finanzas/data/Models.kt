package com.respawn.finanzas.data

data class Debt(
    val id: String,
    val name: String,
    val amountCents: Long,
    val category: String,
    val type: String,
    val paid: Boolean,
    val createdAt: Long,
    val closedAt: Long?,
    val priority: String = "Normal",
    val dueDate: String = "",
    val apr: Double = 0.0,
    val nextAction: String = "",
    val legalStatus: String = if (paid) "Saldada" else "Por verificar"
)

data class Payment(
    val id: String,
    val debtId: String,
    val amountCents: Long,
    val date: String,
    val note: String
)

data class DebtWithBalance(
    val debt: Debt,
    val paidCents: Long
) {
    val liveCents: Long
        get() = if (debt.paid) 0L else (debt.amountCents - paidCents).coerceAtLeast(0L)

    val resolvedCents: Long
        get() = (debt.amountCents - liveCents).coerceAtLeast(0L)
}
