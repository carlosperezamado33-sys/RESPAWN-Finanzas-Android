package com.respawn.finanzas.ui

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import com.respawn.finanzas.data.DocumentRecord
import com.respawn.finanzas.data.FinanceLogic
import com.respawn.finanzas.data.RiskInfo
import java.io.File
import java.text.DateFormat
import java.text.NumberFormat
import java.time.LocalDate
import java.util.Date
import java.util.Locale
import kotlin.math.max

fun money(value: Double): String =
    NumberFormat.getCurrencyInstance(Locale("es", "ES")).format(value)

fun fmtDate(value: String): String {
    val d = FinanceLogic.parseDate(value) ?: return "—"
    return "${d.dayOfMonth.toString().padStart(2,'0')}/${d.monthValue.toString().padStart(2,'0')}/${d.year}"
}

fun fmtDateTime(epoch: Long): String =
    DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(epoch))

fun humanSize(bytes: Long): String = when {
    bytes < 1024 -> "$bytes B"
    bytes < 1024 * 1024 -> "${bytes / 1024} KB"
    else -> String.format(Locale.US, "%.1f MB", bytes / 1024.0 / 1024.0)
}

fun shareFile(context: Context, file: File, mime: String = "*/*") {
    val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.files",
        file
    )
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = mime
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(intent, "Compartir / gardar"))
}

fun openDocument(context: Context, doc: DocumentRecord) {
    val file = File(doc.localPath)
    if (!file.exists()) return
    val uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.files",
        file
    )
    val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uri, doc.mimeType.ifBlank { "application/pdf" })
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    runCatching { context.startActivity(intent) }
}

@Composable
fun SectionTitle(title: String, subtitle: String? = null) {
    Column {
        Text(
            title,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary
        )
        if (!subtitle.isNullOrBlank()) {
            Text(
                subtitle,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = .62f)
            )
        }
    }
}

@Composable
fun RespawnCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val base = modifier.fillMaxWidth()
    Surface(
        modifier = if (onClick != null) base.clickable(onClick = onClick) else base,
        shape = RoundedCornerShape(18.dp),
        tonalElevation = 1.dp
    ) {
        Column(
            Modifier.padding(15.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            content = content
        )
    }
}

@Composable
fun Kpi(label: String, value: String, accent: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.heightIn(min = 98.dp),
        shape = RoundedCornerShape(17.dp),
        tonalElevation = 1.dp
    ) {
        Column(
            Modifier.padding(13.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = .62f)
            )
            Spacer(Modifier.height(10.dp))
            Text(
                value,
                color = accent,
                fontWeight = FontWeight.ExtraBold,
                fontSize = 23.sp,
                maxLines = 1,
                softWrap = false,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun ChoiceDropdown(
    label: String,
    value: String,
    options: List<String>,
    modifier: Modifier = Modifier,
    onChange: (String) -> Unit
) {
    var open by remember { mutableStateOf(false) }
    Column(modifier) {
        Text(label, style = MaterialTheme.typography.labelMedium)
        Spacer(Modifier.height(4.dp))
        Box {
            OutlinedButton(onClick = { open = true }) {
                Text(value, maxLines = 1)
            }
            DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option) },
                        onClick = {
                            onChange(option)
                            open = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun RiskBadge(risk: RiskInfo) {
    val color = when (risk.label) {
        "CRÍTICO" -> MaterialTheme.colorScheme.error
        "ALTO" -> MaterialTheme.colorScheme.tertiary
        "MEDIO" -> MaterialTheme.colorScheme.primary
        "RESOLTA" -> MaterialTheme.colorScheme.secondary
        else -> MaterialTheme.colorScheme.outline
    }
    Surface(
        shape = RoundedCornerShape(999.dp),
        color = color.copy(alpha = .14f),
        border = androidx.compose.foundation.BorderStroke(1.dp, color)
    ) {
        Text(
            risk.label,
            color = color,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun SimpleLineChart(
    values: List<Double>,
    modifier: Modifier = Modifier,
    lineColor: Color = MaterialTheme.colorScheme.primary
) {
    val grid = MaterialTheme.colorScheme.outline.copy(alpha = .3f)
    Canvas(modifier = modifier.height(190.dp).fillMaxWidth()) {
        if (values.size < 2) return@Canvas
        val min = values.minOrNull() ?: 0.0
        val maxV = values.maxOrNull() ?: 1.0
        val span = max(0.01, maxV - min)
        repeat(4) { i ->
            val y = size.height * i / 3f
            drawLine(grid, Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
        }
        val path = Path()
        values.forEachIndexed { index, v ->
            val x = if (values.size == 1) 0f
            else size.width * index / (values.size - 1).toFloat()
            val y = size.height - ((v - min) / span).toFloat() * size.height
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        drawPath(path, lineColor, style = Stroke(width = 4f, cap = StrokeCap.Round))
    }
}

@Composable
fun SimpleBarChart(
    values: List<Pair<String, Double>>,
    modifier: Modifier = Modifier,
    barColor: Color = MaterialTheme.colorScheme.secondary
) {
    val grid = MaterialTheme.colorScheme.outline.copy(alpha = .25f)
    Canvas(modifier = modifier.height(190.dp).fillMaxWidth()) {
        if (values.isEmpty()) return@Canvas
        val maxV = (values.maxOfOrNull { it.second } ?: 1.0).coerceAtLeast(1.0)
        repeat(4) { i ->
            val y = size.height * i / 3f
            drawLine(grid, Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
        }
        val gap = 7f
        val barW = ((size.width - gap * (values.size + 1)) / values.size)
            .coerceAtLeast(4f)
        values.forEachIndexed { i, pair ->
            val h = (pair.second / maxV).toFloat() * size.height
            val left = gap + i * (barW + gap)
            drawRect(
                barColor,
                topLeft = Offset(left, size.height - h),
                size = androidx.compose.ui.geometry.Size(barW, h)
            )
        }
    }
}

@Composable
fun DocumentList(
    docs: List<DocumentRecord>,
    onOpen: (DocumentRecord) -> Unit,
    onDelete: ((DocumentRecord) -> Unit)? = null
) {
    if (docs.isEmpty()) {
        Text(
            "Sen documentos anexados.",
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = .55f)
        )
        return
    }
    docs.forEach { doc ->
        Surface(
            shape = RoundedCornerShape(13.dp),
            tonalElevation = 1.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                Modifier.padding(11.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Description, null, tint = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.width(9.dp))
                Column(Modifier.weight(1f)) {
                    Text(doc.name, fontWeight = FontWeight.SemiBold, maxLines = 2)
                    Text(
                        humanSize(doc.sizeBytes),
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = .55f)
                    )
                }
                IconButton(onClick = { onOpen(doc) }) {
                    Icon(Icons.Default.OpenInNew, "Abrir")
                }
                if (onDelete != null) {
                    IconButton(onClick = { onDelete(doc) }) {
                        Icon(Icons.Default.Delete, "Eliminar", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
fun BusyOverlay(visible: Boolean) {
    if (!visible) return
    Box(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background.copy(alpha = .72f)),
        contentAlignment = Alignment.Center
    ) {
        Surface(shape = RoundedCornerShape(18.dp), tonalElevation = 6.dp) {
            Row(
                Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(Modifier.size(23.dp), strokeWidth = 3.dp)
                Spacer(Modifier.width(12.dp))
                Text("RESPAWN traballando...")
            }
        }
    }
}
