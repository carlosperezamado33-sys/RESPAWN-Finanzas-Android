package com.respawn.finanzas.data

import android.content.Context
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import java.io.File
import java.text.NumberFormat
import java.time.LocalDate
import java.util.Locale

class ReportService(private val context: Context) {
    private val moneyFmt = NumberFormat.getCurrencyInstance(Locale("es", "ES"))

    fun globalReportText(state: CoreState): String {
        val t = FinanceLogic.totals(state.debts)
        val lines = mutableListOf<String>()
        lines += "RESPAWN // INFORME GLOBAL"
        lines += "Data: ${StateCodec.todayKey()}"
        lines += ""
        lines += "Total base: ${money(t.total)}"
        lines += "Saldo vivo: ${money(t.live)}"
        lines += "Resolto: ${money(t.resolved)}"
        lines += "Pagos reais: ${money(t.payments)}"
        lines += "Débedas abertas: ${t.open}"
        lines += ""
        lines += "DÉBEDAS ABERTAS"
        FinanceLogic.attackSort("respawn", state.debts).forEach { d ->
            val r = FinanceLogic.riskInfo(d)
            lines += "${d.name} | ${money(FinanceLogic.liveBalance(d))} | ${d.priority} | ${r.label} | ${d.legalStatus} | ${d.dueDate.ifBlank { "sen data" }}"
        }
        lines += ""
        lines += "ARQUIVO / SALDADAS"
        state.debts.filter { it.paid }.forEach { d ->
            lines += "${d.name} | base ${money(d.amount)} | pago ${money(FinanceLogic.sumPayments(d))} | peche ${d.closedAt.take(10)}"
        }
        return lines.joinToString("\n")
    }

    fun dossierText(d: Debt): String {
        val lines = mutableListOf<String>()
        lines += "RESPAWN // DOSSIER"
        lines += d.name
        lines += "Data: ${StateCodec.todayKey()}"
        lines += ""
        lines += "Base: ${money(d.amount)}"
        lines += "Saldo vivo: ${money(FinanceLogic.liveBalance(d))}"
        lines += "Pagos: ${money(FinanceLogic.sumPayments(d))}"
        lines += "Quita/aforro: ${money(FinanceLogic.discountAmount(d))}"
        lines += "Tipo: ${d.type}"
        lines += "Bloque: ${d.category}"
        lines += "Prioridade: ${d.priority}"
        lines += "Vencemento: ${d.dueDate.ifBlank { "sen data" }}"
        lines += "TAE: ${d.apr}%"
        lines += "Estado legal: ${d.legalStatus}"
        lines += "Seguinte paso: ${d.nextAction}"
        lines += ""
        lines += "ACREDOR / EXPEDIENTE"
        lines += "Acredor: ${d.creditor.name}"
        lines += "Referencia: ${d.creditor.ref}"
        lines += "Teléfono: ${d.creditor.phone}"
        lines += "Email: ${d.creditor.email}"
        lines += ""
        lines += "ACORDO / NEGOCIACIÓN"
        lines += "Reclamado: ${money(d.agreement.claimed)}"
        lines += "Oferta: ${money(d.agreement.offer)}"
        lines += "Acordado: ${money(d.agreement.settled)}"
        lines += "Estado: ${d.agreement.status}"
        lines += "Data límite: ${d.agreement.deadline}"
        lines += "Nota: ${d.agreement.note}"
        lines += ""
        lines += "SEMÁFORO DOCUMENTAL"
        lines += "Contrato: ${yesNo(d.docs.contract)}"
        lines += "Saldo actual: ${yesNo(d.docs.balance)}"
        lines += "Titular actual: ${yesNo(d.docs.creditor)}"
        lines += "Reclamacións: ${yesNo(d.docs.claims)}"
        lines += "Xudicial: ${yesNo(d.docs.judicial)}"
        lines += ""
        lines += "INVESTIGACIÓN"
        lines += "Último pago: ${d.investigation.lastPayment}"
        lines += "Última reclamación: ${d.investigation.lastClaim}"
        lines += "Último contacto: ${d.investigation.lastContact}"
        lines += "Xudicial: ${d.investigation.judicial}"
        lines += "Estado: ${d.investigation.status}"
        lines += "Nota: ${d.investigation.note}"
        lines += ""
        lines += "NOTA FIXA"
        lines += d.notes
        lines += ""
        lines += "PAGOS"
        d.payments.sortedByDescending { it.date }.forEach {
            lines += "${it.date} | ${money(it.amount)} | ${it.note}"
        }
        lines += ""
        lines += "BITÁCORA"
        d.log.sortedByDescending { it.at }.forEach {
            lines += "${it.at} | ${it.text}"
        }
        return lines.joinToString("\n")
    }

    fun monthlyReportText(state: CoreState, month: String): String {
        val s = FinanceLogic.monthStats(state, month)
        return buildString {
            appendLine("RESPAWN // RESUMO MENSUAL")
            appendLine("Mes: $month")
            appendLine()
            appendLine("Pagos reais: ${money(s.payments)}")
            appendLine("Novas débedas: ${s.newCount} · ${money(s.newAmount)}")
            appendLine("Pechadas: ${s.closedCount} · ${money(s.closedAmount)}")
            appendLine("Saldo inicio: ${s.start?.let(::money) ?: "sen foto"}")
            appendLine("Saldo fin: ${s.end?.let(::money) ?: "sen foto"}")
            appendLine("Redución neta: ${s.net?.let(::money) ?: "sen datos suficientes"}")
        }
    }

    fun createGlobalPdf(state: CoreState): File =
        createTextPdf("RESPAWN_INFORME_GLOBAL_${StateCodec.todayKey()}.pdf", globalReportText(state))

    fun createDossierPdf(d: Debt): File =
        createTextPdf("RESPAWN_DOSSIER_${safeName(d.name)}.pdf", dossierText(d))

    fun createMonthlyPdf(state: CoreState, month: String): File =
        createTextPdf("RESPAWN_RESUMO_${month}.pdf", monthlyReportText(state, month))

    private fun createTextPdf(name: String, text: String): File {
        val pdf = PdfDocument()
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = android.graphics.Color.BLACK
            textSize = 10.5f
            typeface = Typeface.create(Typeface.MONOSPACE, Typeface.NORMAL)
        }
        val titlePaint = Paint(paint).apply {
            textSize = 15f
            typeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
        }
        val pageWidth = 595
        val pageHeight = 842
        val left = 38f
        val top = 48f
        val bottom = 40f
        val maxWidth = pageWidth - left - 38f
        val lineHeight = 14f

        val logicalLines = text.lines().flatMap { wrapLine(it, paint, maxWidth) }
        var pageNo = 1
        var index = 0
        while (index < logicalLines.size || pageNo == 1) {
            val page = pdf.startPage(
                PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNo).create()
            )
            val canvas = page.canvas
            var y = top
            if (pageNo == 1 && logicalLines.isNotEmpty()) {
                canvas.drawText(logicalLines[index], left, y, titlePaint)
                index++
                y += 24f
            }
            while (index < logicalLines.size && y < pageHeight - bottom) {
                canvas.drawText(logicalLines[index], left, y, paint)
                index++
                y += lineHeight
            }
            pdf.finishPage(page)
            pageNo++
        }

        val dir = File(context.cacheDir, "respawn_reports").apply { mkdirs() }
        val file = File(dir, name)
        file.outputStream().use { pdf.writeTo(it) }
        pdf.close()
        return file
    }

    private fun wrapLine(line: String, paint: Paint, maxWidth: Float): List<String> {
        if (line.isBlank()) return listOf("")
        val words = line.split(" ")
        val out = mutableListOf<String>()
        var current = ""
        words.forEach { word ->
            val candidate = if (current.isBlank()) word else "$current $word"
            if (paint.measureText(candidate) <= maxWidth) current = candidate
            else {
                if (current.isNotBlank()) out += current
                current = word
            }
        }
        if (current.isNotBlank()) out += current
        return out
    }

    private fun money(v: Double): String = moneyFmt.format(v)
    private fun yesNo(v: Boolean) = if (v) "SI" else "NON"
    private fun safeName(v: String) =
        v.replace(Regex("""[^\p{L}\p{N}._-]+"""), "_").take(80).ifBlank { "item" }
}
