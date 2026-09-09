package com.respawn.finanzas.ui

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.luminance
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
fun BuracoBackground(content: @Composable BoxScope.() -> Unit) {
    val scheme = MaterialTheme.colorScheme
    val isLight = scheme.background.luminance() > .5f
    val backgroundBrush = if (isLight) {
        // Ivory: variación mínima e opaca. Evita o efecto gris/fume das capas con alfa.
        Brush.verticalGradient(
            colors = listOf(
                Color(0xFFF8F7F3),
                Color(0xFFF4F3EF),
                Color(0xFFF6F5F1)
            )
        )
    } else {
        Brush.verticalGradient(
            colors = listOf(
                scheme.background,
                scheme.surfaceVariant.copy(alpha = .38f),
                scheme.background
            )
        )
    }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundBrush),
        content = content
    )
}

@Composable
fun SectionTitle(title: String, subtitle: String? = null) {
    val isLight = MaterialTheme.colorScheme.background.luminance() > .5f
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            modifier = Modifier.size(width = if (isLight) 3.dp else 4.dp, height = if (subtitle.isNullOrBlank()) 24.dp else 40.dp),
            shape = RoundedCornerShape(99.dp),
            color = MaterialTheme.colorScheme.primary
        ) {}
        Spacer(Modifier.width(10.dp))
        Column {
            Text(
                title,
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onSurface
            )
            if (!subtitle.isNullOrBlank()) {
                Text(
                    subtitle,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
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
    val isLight = MaterialTheme.colorScheme.background.luminance() > .5f
    Surface(
        modifier = if (onClick != null) base.clickable(onClick = onClick) else base,
        shape = RoundedCornerShape(if (isLight) 24.dp else 22.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(
            1.dp,
            MaterialTheme.colorScheme.outline.copy(alpha = if (isLight) .28f else .15f)
        ),
        shadowElevation = if (isLight) 3.dp else 6.dp,
        tonalElevation = 0.dp
    ) {
        Column(
            Modifier.padding(if (isLight) 16.dp else 15.dp),
            verticalArrangement = Arrangement.spacedBy(9.dp),
            content = content
        )
    }
}

@Composable
fun Kpi(label: String, value: String, accent: Color, modifier: Modifier = Modifier) {
    val isLight = MaterialTheme.colorScheme.background.luminance() > .5f
    Surface(
        modifier = modifier.heightIn(min = 106.dp),
        shape = RoundedCornerShape(if (isLight) 24.dp else 22.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(
            1.dp,
            if (isLight) MaterialTheme.colorScheme.outline.copy(alpha = .34f)
            else accent.copy(alpha = .24f)
        ),
        shadowElevation = if (isLight) 3.dp else 7.dp,
        tonalElevation = 0.dp
    ) {
        Column(
            Modifier.padding(if (isLight) 16.dp else 15.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(12.dp))
            Text(
                value,
                color = accent,
                fontWeight = FontWeight.Black,
                fontSize = 24.sp,
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
        Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(5.dp))
        Box {
            OutlinedButton(
                onClick = { open = true },
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = .35f))
            ) {
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
    val isLight = MaterialTheme.colorScheme.background.luminance() > .5f
    Surface(
        shape = RoundedCornerShape(999.dp),
        color = color.copy(alpha = if (isLight) .08f else .12f),
        border = BorderStroke(1.dp, color.copy(alpha = if (isLight) .42f else .65f))
    ) {
        Text(
            risk.label,
            color = color,
            fontWeight = FontWeight.Bold,
            fontSize = 10.sp,
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp)
        )
    }
}

@Composable
fun SimpleLineChart(
    values: List<Double>,
    modifier: Modifier = Modifier,
    lineColor: Color = MaterialTheme.colorScheme.primary
) {
    val grid = MaterialTheme.colorScheme.outline.copy(alpha = .22f)
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
        drawPath(path, lineColor, style = Stroke(width = 4.5f, cap = StrokeCap.Round))
    }
}

@Composable
fun SimpleBarChart(
    values: List<Pair<String, Double>>,
    modifier: Modifier = Modifier,
    barColor: Color = MaterialTheme.colorScheme.secondary
) {
    val grid = MaterialTheme.colorScheme.outline.copy(alpha = .18f)
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
            drawRoundRect(
                color = barColor,
                topLeft = Offset(left, size.height - h),
                size = androidx.compose.ui.geometry.Size(barW, h),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(8f, 8f)
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
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        return
    }
    val isLight = MaterialTheme.colorScheme.background.luminance() > .5f
    docs.forEach { doc ->
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = if (isLight) .24f else .14f)),
            shadowElevation = if (isLight) 1.dp else 2.dp,
            tonalElevation = 0.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Box(Modifier.size(38.dp), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Description, null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
                    }
                }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(doc.name, fontWeight = FontWeight.SemiBold, maxLines = 2)
                    Text(
                        humanSize(doc.sizeBytes),
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
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
    val isLight = MaterialTheme.colorScheme.background.luminance() > .5f
    Box(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background.copy(alpha = if (isLight) .88f else .78f)),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = if (isLight) .25f else .16f)),
            shadowElevation = if (isLight) 5.dp else 14.dp,
            tonalElevation = 0.dp
        ) {
            Row(
                Modifier.padding(horizontal = 22.dp, vertical = 18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(Modifier.size(23.dp), strokeWidth = 3.dp)
                Spacer(Modifier.width(12.dp))
                Text("BURACO traballando...", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
