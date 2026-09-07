package com.respawn.finanzas.data

import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeParseException
import java.time.temporal.ChronoUnit
import kotlin.math.ceil
import kotlin.math.max

object FinanceLogic {
    fun sumPayments(d: Debt): Double = d.payments.sumOf { it.amount }

    fun settlementTarget(d: Debt): Double {
        val settled = d.agreement.settled
        return if (settled > 0 && d.agreement.status == "Aceptado") settled else d.amount
    }

    fun rawBalance(d: Debt): Double = max(0.0, settlementTarget(d) - sumPayments(d))
    fun liveBalance(d: Debt): Double = if (d.paid) 0.0 else rawBalance(d)
    fun resolvedAmount(d: Debt): Double = max(0.0, d.amount - liveBalance(d))
    fun discountAmount(d: Debt): Double =
        if (d.agreement.settled > 0 && d.agreement.status == "Aceptado")
            max(0.0, d.amount - d.agreement.settled)
        else 0.0

    fun totals(list: List<Debt>): Totals {
        val total = list.sumOf { it.amount }
        val live = list.sumOf { liveBalance(it) }
        return Totals(
            total = total,
            live = live,
            resolved = max(0.0, total - live),
            payments = list.sumOf { sumPayments(it) },
            open = list.count { !it.paid && liveBalance(it) > 0.005 }
        )
    }

    fun parseDate(value: String): LocalDate? {
        if (value.isBlank()) return null
        return try { LocalDate.parse(value) } catch (_: DateTimeParseException) { null }
    }

    fun dueDays(d: Debt, today: LocalDate = LocalDate.now()): Long {
        val due = parseDate(d.dueDate) ?: return Long.MAX_VALUE
        return ChronoUnit.DAYS.between(today, due)
    }

    fun riskInfo(d: Debt, today: LocalDate = LocalDate.now()): RiskInfo {
        if (d.paid) return RiskInfo(0, "RESOLTA")
        var s = when (d.priority) {
            "Baixa" -> 0
            "Normal" -> 1
            "Alta" -> 2
            "Crítica" -> 3
            else -> 0
        }

        if (d.dueDate.isNotBlank()) {
            val diff = dueDays(d, today)
            s += when {
                diff < 0 -> 4
                diff <= 7 -> 3
                diff <= 30 -> 2
                else -> 0
            }
        }

        s += when (d.legalStatus) {
            "Por verificar" -> 1
            "Reclamable / activa" -> 3
            "Prescrición posible" -> 1
            "En acordo" -> 2
            "Xudicializada" -> 4
            "Saldada" -> 0
            else -> 0
        }

        val b = liveBalance(d)
        s += when {
            b >= 2000 -> 2
            b >= 500 -> 1
            else -> 0
        }

        return RiskInfo(
            s,
            when {
                s >= 8 -> "CRÍTICO"
                s >= 5 -> "ALTO"
                s >= 3 -> "MEDIO"
                else -> "BAIXO"
            }
        )
    }

    fun attackScore(d: Debt): Int {
        val r = riskInfo(d).score
        val due = dueDays(d)
        val dueScore = when {
            due < 0 -> 8
            due <= 7 -> 6
            due <= 30 -> 4
            due <= 60 -> 2
            else -> 0
        }
        val bal = when {
            liveBalance(d) >= 2000 -> 3
            liveBalance(d) >= 500 -> 2
            else -> 1
        }
        return r * 2 + dueScore + bal
    }

    fun attackSort(strategy: String, debts: List<Debt>): List<Debt> {
        val open = debts.filter { !it.paid && liveBalance(it) > 0.005 }
        return when (strategy) {
            "snowball" -> open.sortedBy { liveBalance(it) }
            "avalanche" -> open.sortedWith(
                compareByDescending<Debt> { it.apr }.thenByDescending { liveBalance(it) }
            )
            "due" -> open.sortedWith(
                compareBy<Debt> { dueDays(it) }.thenByDescending { riskInfo(it).score }
            )
            else -> open.sortedByDescending { attackScore(it) }
        }
    }

    fun autoMissions(state: CoreState): List<AutoMission> {
        val out = mutableListOf<AutoMission>()
        val today = LocalDate.now()
        val week = today.plusDays(7)

        state.debts.filter { !it.paid }.forEach { d ->
            val r = riskInfo(d, today)
            val due = parseDate(d.dueDate)
            if (due != null) {
                if (due.isBefore(today)) {
                    out += AutoMission(
                        "Crítica", d.name,
                        "Data límite pasada (${d.dueDate}). ${d.nextAction.ifBlank { "Revisar estado." }}",
                        d.id
                    )
                } else if (!due.isAfter(week)) {
                    out += AutoMission(
                        "Alta", d.name,
                        "Vence/revisar ${d.dueDate}. ${d.nextAction}",
                        d.id
                    )
                }
            }

            val docCount = listOf(
                d.docs.contract, d.docs.balance, d.docs.creditor,
                d.docs.claims, d.docs.judicial
            ).count { it }

            if (d.category == "Débeda antiga" && docCount <= 1) {
                out += AutoMission(
                    "Normal", d.name,
                    "Semáforo documental incompleto ($docCount/5).",
                    d.id
                )
            }

            if (r.label == "CRÍTICO" && out.none { it.debtId == d.id }) {
                out += AutoMission(
                    "Alta", d.name,
                    "Risco operativo ${r.label}. ${d.nextAction.ifBlank { "Definir seguinte paso." }}",
                    d.id
                )
            }
        }

        fun weight(p: String) = when (p) {
            "Crítica" -> 3
            "Alta" -> 2
            "Normal" -> 1
            else -> 0
        }
        return out.sortedByDescending { weight(it.priority) }.take(12)
    }

    fun monthlyPayments(state: CoreState): List<Pair<String, Double>> {
        return state.debts
            .flatMap { d -> d.payments.map { it.date.take(7) to it.amount } }
            .filter { it.first.length == 7 }
            .groupBy { it.first }
            .mapValues { (_, v) -> v.sumOf { it.second } }
            .toList()
            .sortedBy { it.first }
    }

    fun monthStats(state: CoreState, month: String): MonthStats {
        val pays = state.debts.flatMap { d ->
            d.payments.filter { it.date.startsWith(month) }
        }
        val newDebts = state.debts.filter { it.createdAt.take(7) == month }
        val closed = state.debts.filter { it.closedAt.take(7) == month }
        val snaps = state.history.filter { it.date.startsWith(month) }.sortedBy { it.at }
        val start = snaps.firstOrNull()?.live
        val end = snaps.lastOrNull()?.live

        return MonthStats(
            payments = pays.sumOf { it.amount },
            newCount = newDebts.size,
            newAmount = newDebts.sumOf { it.amount },
            closedCount = closed.size,
            closedAmount = closed.sumOf { it.amount },
            start = start,
            end = end,
            net = if (start != null && end != null) start - end else null
        )
    }

    fun simulate(
        state: CoreState,
        monthly: Double,
        extra: Double,
        strategy: String
    ): Triple<Int?, Double, List<Pair<String, Int>>> {
        if (monthly <= 0 && extra <= 0) return Triple(null, 0.0, emptyList())

        data class Work(var name: String, var balance: Double, val apr: Double)
        val work = attackSort(strategy, state.debts)
            .map { Work(it.name, liveBalance(it), it.apr) }
            .filter { it.balance > 0.005 }
            .toMutableList()

        var lump = extra
        while (lump > 0 && work.isNotEmpty()) {
            val x = work.first()
            val use = minOf(lump, x.balance)
            x.balance -= use
            lump -= use
            if (x.balance <= 0.005) work.removeAt(0)
        }

        var months = 0
        var interest = 0.0
        val targets = mutableListOf<Pair<String, Int>>()
        var guard = 0
        while (work.isNotEmpty() && guard < 600) {
            guard++
            months++
            work.forEach { x ->
                val mi = if (x.apr > 0) x.apr / 100.0 / 12.0 else 0.0
                val inc = x.balance * mi
                x.balance += inc
                interest += inc
            }
            var budget = monthly
            while (budget > 0 && work.isNotEmpty()) {
                val x = work.first()
                val use = minOf(budget, x.balance)
                x.balance -= use
                budget -= use
                if (x.balance <= 0.005) {
                    targets += x.name to months
                    work.removeAt(0)
                }
            }
            if (monthly <= 0) break
        }
        return Triple(if (work.isEmpty()) months else null, interest, targets)
    }

    fun health(state: CoreState, docs: List<DocumentRecord>, snapshotCount: Int): List<Pair<String, String>> {
        val lines = mutableListOf<Pair<String, String>>()
        val ids = (state.debts + state.trash).map { it.id }
        val dupCount = ids.groupingBy { it }.eachCount().count { it.value > 1 }
        lines += if (dupCount > 0)
            "bad" to "Hai $dupCount identificadores de débeda duplicados."
        else "ok" to "IDs de débedas: correctos e únicos."

        val payIssues = state.debts.count { sumPayments(it) > settlementTarget(it) + 0.01 }
        lines += if (payIssues > 0)
            "bad" to "$payIssues débedas teñen pagos superiores ao importe/acordo rexistrado."
        else "ok" to "Pagos vs. saldo: coherentes."

        val validOwners = mutableSetOf<String>()
        (state.debts + state.trash).forEach { validOwners += it.id }
        listOf("CIRBE","ASNEF","BADEXCUG","XUDICIAL").forEach { validOwners += "GLOBAL:$it" }
        state.generalNotes.forEach { validOwners += "NOTE:${it.id}" }
        val orphans = docs.count { it.ownerId !in validOwners }
        lines += if (orphans > 0)
            "warn" to "Hai $orphans PDF sen propietario recoñecido. Non se borran automaticamente."
        else "ok" to "PDF asociados: ${docs.size}, sen orfos."

        lines += if (snapshotCount < 2)
            "warn" to "Só hai $snapshotCount copia(s) interna(s)."
        else "ok" to "Copias internas dispoñibles: $snapshotCount."

        lines += if (state.settings.dirtySinceBackup)
            "warn" to "Hai cambios posteriores ao último backup externo."
        else "ok" to "Backup externo marcado como ao día."

        val strange = state.debts.count { it.paid && it.legalStatus != "Saldada" }
        if (strange > 0) lines += "warn" to "$strange débedas están pagadas pero o estado legal non é SALDADA."

        val inverse = state.debts.count { !it.paid && it.legalStatus == "Saldada" }
        if (inverse > 0) lines += "warn" to "$inverse débedas están abertas pero o estado legal figura como SALDADA."

        val agreementMismatch = state.debts.count {
            it.agreement.settled > 0 && it.agreement.status != "Aceptado"
        }
        if (agreementMismatch > 0) lines +=
            "ok" to "$agreementMismatch importes de acordo están gardados como proposta/non aceptados e NON reducen o saldo vivo."

        return lines
    }
}
