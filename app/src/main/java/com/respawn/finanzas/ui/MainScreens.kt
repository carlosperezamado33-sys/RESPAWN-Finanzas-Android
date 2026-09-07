package com.respawn.finanzas.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.respawn.finanzas.data.*
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

@Composable
fun DashboardScreen(
    ui: RespawnUiState,
    onDebts: () -> Unit,
    onSnapshot: () -> Unit,
    onGlobalPdf: () -> Unit,
    onZip: () -> Unit,
    onBackup: () -> Unit,
    onRestore: () -> Unit,
    onDebt: (Debt) -> Unit
) {
    val state = ui.core
    val t = remember(state) { FinanceLogic.totals(state.debts) }
    val baseline = state.settings.baselineTotal.takeIf { it > 0 } ?: t.total
    val resetPct = if (baseline > 0) ((baseline - t.live) / baseline * 100).coerceAtLeast(0.0) else 0.0
    val biggest = state.debts.filter { !it.paid }.maxByOrNull { FinanceLogic.liveBalance(it) }
    val highRisk = state.debts.count {
        val r = FinanceLogic.riskInfo(it).label
        !it.paid && (r == "ALTO" || r == "CRÍTICO")
    }
    val late = state.debts.count { !it.paid && FinanceLogic.dueDays(it) < 0 }
    val upcoming = state.debts
        .filter { !it.paid && it.dueDate.isNotBlank() }
        .filter { FinanceLogic.dueDays(it) <= 30 }
        .sortedBy { FinanceLogic.dueDays(it) }
        .take(10)

    val byCategory = state.debts.filter { !it.paid }
        .groupBy { it.category }
        .mapValues { (_, rows) -> rows.sumOf { FinanceLogic.liveBalance(it) } }
        .toList().sortedByDescending { it.second }

    val closed = state.debts.count { it.paid }
    val microOpen = state.debts.count { !it.paid && it.type == "Microcrédito" }
    val fund = state.settings.fund.current
    val achievements = listOf(
        Triple("✦", "PRIMEIRA DÉBEDA PECHADA", closed >= 1),
        Triple("10%", "10% ELIMINADO", resetPct >= 10),
        Triple("25%", "CUARTO DE CAMIÑO", resetPct >= 25),
        Triple("50%", "METADE", resetPct >= 50),
        Triple("0MC", "SEN MICROCRÉDITOS", microOpen == 0),
        Triple("500", "COLCHÓN 500", fund >= 500),
        Triple("100%", "DÉBEDA CERO", t.live <= .01)
    )

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                SafetyPill("Gardado automático", "ACTIVO", true, Modifier.weight(1f))
                SafetyPill("Copia interna", if (ui.internalSnapshots.isEmpty()) "INICIANDO" else "ACTIVA", true, Modifier.weight(1f))
                SafetyPill(
                    "Backup externo",
                    if (state.settings.dirtySinceBackup) "PENDENTE" else "AO DÍA",
                    !state.settings.dirtySinceBackup,
                    Modifier.weight(1f)
                )
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                Kpi("TOTAL BASE", money(t.total), MaterialTheme.colorScheme.primary, Modifier.weight(1f))
                Kpi("SALDO VIVO", money(t.live), MaterialTheme.colorScheme.error, Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                Kpi("RESOLTO", money(t.resolved), MaterialTheme.colorScheme.secondary, Modifier.weight(1f))
                Kpi("PAGOS REAIS", money(t.payments), MaterialTheme.colorScheme.secondary, Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                Kpi("ABERTAS", t.open.toString(), MaterialTheme.colorScheme.primary, Modifier.weight(1f))
                Kpi("% RESET", "${resetPct.toInt()}%", MaterialTheme.colorScheme.primary, Modifier.weight(1f))
            }
        }

        item {
            RespawnCard {
                Text("PROGRESO GLOBAL DO RESET", style = MaterialTheme.typography.titleMedium)
                LinearProgressIndicator(
                    progress = { (resetPct / 100.0).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier.fillMaxWidth()
                )
                Text("${resetPct.toInt()}% respecto da foto base · ${money(baseline)}")
            }
        }

        item {
            RespawnCard {
                Text("EVOLUCIÓN DO SALDO VIVO", style = MaterialTheme.typography.titleMedium)
                SimpleLineChart(state.history.takeLast(24).map { it.live })
                if (state.history.isEmpty()) Text("Aínda non hai fotos de evolución.")
            }
        }

        item {
            RespawnCard {
                Text("PAGOS REAIS POR MES", style = MaterialTheme.typography.titleMedium)
                val bars = FinanceLogic.monthlyPayments(state).takeLast(10)
                SimpleBarChart(bars)
                if (bars.isEmpty()) Text("Aínda non hai pagos rexistrados.")
            }
        }

        item {
            Text("AVALIACIÓN ACTUAL", style = MaterialTheme.typography.titleMedium)
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                MiniMetric("% resolto", "${resetPct.toInt()}%", Modifier.weight(1f))
                MiniMetric("Maior saldo", biggest?.let { money(FinanceLogic.liveBalance(it)) } ?: "—", Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                MiniMetric("Risco alto/crítico", highRisk.toString(), Modifier.weight(1f))
                MiniMetric("Datas vencidas", late.toString(), Modifier.weight(1f))
            }
        }

        item { Text("PRÓXIMOS 30 DÍAS / ATRASADOS", style = MaterialTheme.typography.titleMedium) }
        if (upcoming.isEmpty()) {
            item { Text("Sen datas nos próximos 30 días.") }
        } else {
            items(upcoming, key = { "up-${it.id}" }) { d ->
                RespawnCard(onClick = { onDebt(d) }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            fmtDate(d.dueDate),
                            color = if (FinanceLogic.dueDays(d) < 0) MaterialTheme.colorScheme.error
                            else MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(Modifier.width(10.dp))
                        Text(d.name, Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                        Text(
                            if (FinanceLogic.dueDays(d) < 0) "ATRASADA"
                            else d.nextAction.ifBlank { FinanceLogic.riskInfo(d).label },
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }

        item { Text("SALDO VIVO POR BLOQUE", style = MaterialTheme.typography.titleMedium) }
        items(byCategory, key = { it.first }) { pair ->
            RespawnCard {
                Row {
                    Text(pair.first, Modifier.weight(1f), fontWeight = FontWeight.Bold)
                    Text(money(pair.second), color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                }
            }
        }

        item { Text("FITOS / LOGROS", style = MaterialTheme.typography.titleMedium) }
        items(achievements, key = { it.first + it.second }) { a ->
            Surface(
                shape = RoundedCornerShape(15.dp),
                color = if (a.third) MaterialTheme.colorScheme.secondary.copy(alpha = .12f)
                else MaterialTheme.colorScheme.surface,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(Modifier.padding(13.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(a.first, fontWeight = FontWeight.Black, color = if (a.third) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.outline)
                    Spacer(Modifier.width(12.dp))
                    Text(a.second, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.weight(1f))
                    if (a.third) Icon(Icons.Default.CheckCircle, null, tint = MaterialTheme.colorScheme.secondary)
                }
            }
        }

        item { Text("ACCIÓNS RÁPIDAS", style = MaterialTheme.typography.titleMedium) }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onDebts, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.AccountBalanceWallet, null); Spacer(Modifier.width(8.dp)); Text("XESTIONAR DÉBEDAS")
                }
                OutlinedButton(onClick = onSnapshot, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.PhotoCamera, null); Spacer(Modifier.width(8.dp)); Text("REXISTRAR FOTO HOXE")
                }
                OutlinedButton(onClick = onGlobalPdf, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.PictureAsPdf, null); Spacer(Modifier.width(8.dp)); Text("INFORME GLOBAL PDF")
                }
                OutlinedButton(onClick = onZip, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.FolderZip, null); Spacer(Modifier.width(8.dp)); Text("EXPORTAR ZIP COMPLETO")
                }
                OutlinedButton(onClick = onBackup, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Backup, null); Spacer(Modifier.width(8.dp)); Text("BACKUP JSON + PDF")
                }
                OutlinedButton(onClick = onRestore, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Restore, null); Spacer(Modifier.width(8.dp)); Text("RESTAURAR BACKUP")
                }
            }
        }
    }
}

@Composable
private fun SafetyPill(label: String, value: String, good: Boolean, modifier: Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = if (good) MaterialTheme.colorScheme.secondary.copy(alpha = .10f)
        else MaterialTheme.colorScheme.error.copy(alpha = .10f)
    ) {
        Column(Modifier.padding(10.dp)) {
            Text(label, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(value, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun MiniMetric(label: String, value: String, modifier: Modifier) {
    RespawnCard(modifier) {
        Text(label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha=.62f))
        Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 19.sp)
    }
}

@Composable
fun TodayScreen(
    state: CoreState,
    onDebt: (Debt) -> Unit,
    onAddMission: (String, String, String) -> Unit,
    onToggleMission: (String) -> Unit,
    onDeleteMission: (String) -> Unit
) {
    val auto = remember(state) { FinanceLogic.autoMissions(state) }
    var text by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(LocalDate.now().toString()) }
    var priority by remember { mutableStateOf("Normal") }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            SectionTitle(
                "MISIÓNS DE HOXE",
                "Xeradas automaticamente por vencementos, risco, documentación e seguintes pasos."
            )
        }
        if (auto.isEmpty()) {
            item { RespawnCard { Text("Non hai misións automáticas críticas para hoxe.", color = MaterialTheme.colorScheme.secondary) } }
        } else {
            items(auto, key = { it.debtId + it.desc }) { m ->
                RespawnCard(onClick = {
                    state.debts.firstOrNull { it.id == m.debtId }?.let(onDebt)
                }) {
                    Row(verticalAlignment = Alignment.Top) {
                        RiskDot(m.priority)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(m.title, fontWeight = FontWeight.Bold)
                            Text(m.desc, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha=.66f))
                        }
                        Icon(Icons.Default.OpenInNew, null, Modifier.size(18.dp))
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(4.dp))
            SectionTitle("MISIÓN MANUAL")
        }
        item {
            RespawnCard {
                OutlinedTextField(
                    value = text, onValueChange = { text = it },
                    label = { Text("Que tes que facer?") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = date, onValueChange = { date = it },
                    label = { Text("Data YYYY-MM-DD") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                ChoiceDropdown("Prioridade", priority, listOf("Normal","Alta","Crítica","Baixa")) { priority = it }
                Button(
                    enabled = text.isNotBlank(),
                    onClick = {
                        onAddMission(text, date.ifBlank { LocalDate.now().toString() }, priority)
                        text = ""
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, null); Spacer(Modifier.width(8.dp)); Text("ENGADIR MISIÓN")
                }
            }
        }

        val manual = state.manualMissions.sortedWith(
            compareBy<ManualMission> { it.done }.thenBy { it.date }
        )
        items(manual, key = { it.id }) { m ->
            RespawnCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = m.done, onCheckedChange = { onToggleMission(m.id) })
                    Column(Modifier.weight(1f)) {
                        Text(
                            m.text,
                            fontWeight = FontWeight.SemiBold,
                            color = if (m.done) MaterialTheme.colorScheme.onSurface.copy(alpha=.45f)
                            else MaterialTheme.colorScheme.onSurface
                        )
                        Text("${fmtDate(m.date)} · ${m.priority}", fontSize = 11.sp)
                    }
                    IconButton(onClick = { onDeleteMission(m.id) }) {
                        Icon(Icons.Default.Delete, "Eliminar", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
private fun RiskDot(priority: String) {
    val color = when(priority) {
        "Crítica" -> MaterialTheme.colorScheme.error
        "Alta" -> MaterialTheme.colorScheme.tertiary
        "Normal" -> MaterialTheme.colorScheme.primary
        else -> MaterialTheme.colorScheme.outline
    }
    Surface(shape = RoundedCornerShape(999.dp), color = color, modifier = Modifier.size(10.dp)) {}
}

@Composable
fun DebtsScreen(
    state: CoreState,
    onDebt: (Debt) -> Unit,
    onTogglePaid: (Debt, Boolean) -> Unit
) {
    var search by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("Todas") }
    var category by remember { mutableStateOf("Todos bloques") }
    var legal by remember { mutableStateOf("Todo estado legal") }
    var priority by remember { mutableStateOf("Toda prioridade") }

    val filtered = remember(state, search, status, category, legal, priority) {
        state.debts.filter { d ->
            (search.isBlank() ||
                d.name.contains(search, true) ||
                d.type.contains(search, true) ||
                d.category.contains(search, true) ||
                d.legalStatus.contains(search, true)) &&
            when(status) {
                "Pendentes" -> !d.paid
                "Saldadas" -> d.paid
                else -> true
            } &&
            (category == "Todos bloques" || d.category == category) &&
            (legal == "Todo estado legal" || d.legalStatus == legal) &&
            (priority == "Toda prioridade" || d.priority == priority)
        }.sortedWith(
            compareBy<Debt> { it.paid }
                .thenByDescending { FinanceLogic.attackScore(it) }
        )
    }

    val filtersActive =
        status != "Todas" ||
        category != "Todos bloques" ||
        legal != "Todo estado legal" ||
        priority != "Toda prioridade"

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            leadingIcon = { Icon(Icons.Default.Search, null) },
            placeholder = { Text("Buscar débeda...") },
            trailingIcon = {
                if (search.isNotBlank()) {
                    IconButton(onClick = { search = "" }) {
                        Icon(Icons.Default.Close, "Limpar busca")
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 14.dp, top = 10.dp, bottom = 4.dp),
            singleLine = true,
            shape = RoundedCornerShape(16.dp)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(7.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            listOf("Todas", "Pendentes", "Saldadas").forEach { option ->
                FilterChip(
                    selected = status == option,
                    onClick = { status = option },
                    label = { Text(option) }
                )
            }

            CompactFilterMenu(
                label = if (category == "Todos bloques") "Bloque" else shortBlock(category),
                selected = category != "Todos bloques",
                value = category,
                options = listOf(
                    "Todos bloques",
                    "Débeda actual",
                    "Débeda antiga",
                    "Recuperacións",
                    "Pendentes"
                ),
                onChange = { category = it }
            )

            CompactFilterMenu(
                label = if (legal == "Todo estado legal") "Legal" else shortLegal(legal),
                selected = legal != "Todo estado legal",
                value = legal,
                options = listOf(
                    "Todo estado legal",
                    "Por verificar",
                    "Reclamable / activa",
                    "Prescrición posible",
                    "En acordo",
                    "Xudicializada",
                    "Saldada"
                ),
                onChange = { legal = it }
            )

            CompactFilterMenu(
                label = if (priority == "Toda prioridade") "Prioridade" else priority,
                selected = priority != "Toda prioridade",
                value = priority,
                options = listOf(
                    "Toda prioridade",
                    "Baixa",
                    "Normal",
                    "Alta",
                    "Crítica"
                ),
                onChange = { priority = it }
            )

            if (filtersActive) {
                AssistChip(
                    onClick = {
                        status = "Todas"
                        category = "Todos bloques"
                        legal = "Todo estado legal"
                        priority = "Toda prioridade"
                    },
                    label = { Text("Limpar") },
                    leadingIcon = {
                        Icon(
                            Icons.Default.FilterAltOff,
                            null,
                            Modifier.size(17.dp)
                        )
                    }
                )
            }
        }

        Text(
            "${filtered.size} rexistros",
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = .58f),
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 2.dp)
        )

        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(
                start = 14.dp,
                end = 14.dp,
                top = 5.dp,
                bottom = 92.dp
            ),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filtered, key = { it.id }) { d ->
                DebtListCard(
                    d = d,
                    onDebt = onDebt,
                    onTogglePaid = { paid -> onTogglePaid(d, paid) }
                )
            }
        }
    }
}

@Composable
private fun CompactFilterMenu(
    label: String,
    selected: Boolean,
    value: String,
    options: List<String>,
    onChange: (String) -> Unit
) {
    var open by remember { mutableStateOf(false) }
    Box {
        FilterChip(
            selected = selected,
            onClick = { open = true },
            label = { Text(label, maxLines = 1) },
            trailingIcon = {
                Icon(
                    Icons.Default.ArrowDropDown,
                    null,
                    Modifier.size(18.dp)
                )
            }
        )
        DropdownMenu(
            expanded = open,
            onDismissRequest = { open = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (option == value) {
                                Icon(
                                    Icons.Default.Check,
                                    null,
                                    Modifier.size(17.dp),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Spacer(Modifier.width(7.dp))
                            }
                            Text(option)
                        }
                    },
                    onClick = {
                        onChange(option)
                        open = false
                    }
                )
            }
        }
    }
}

private fun shortBlock(value: String): String = when(value) {
    "Débeda actual" -> "Actual"
    "Débeda antiga" -> "Antiga"
    "Recuperacións" -> "Recup."
    "Pendentes" -> "Pendentes"
    else -> "Bloque"
}

private fun shortLegal(value: String): String = when(value) {
    "Por verificar" -> "Verificar"
    "Reclamable / activa" -> "Activa"
    "Prescrición posible" -> "Prescrición"
    "En acordo" -> "Acordo"
    "Xudicializada" -> "Xudicial"
    "Saldada" -> "Saldada"
    else -> "Legal"
}

@Composable
fun DebtListCard(
    d: Debt,
    onDebt: (Debt) -> Unit,
    onTogglePaid: (Boolean) -> Unit
) {
    val risk = FinanceLogic.riskInfo(d)

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onDebt(d) },
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 1.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = d.paid,
                onCheckedChange = onTogglePaid,
                modifier = Modifier.size(42.dp)
            )

            Spacer(Modifier.width(3.dp))

            Column(Modifier.weight(1f)) {
                Text(
                    d.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.5.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    "${d.category} · ${d.type}",
                    fontSize = 10.5.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = .58f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RiskBadge(risk)
                    if (d.priority != "Normal") {
                        Text(
                            d.priority.uppercase(),
                            fontSize = 9.5.sp,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    if (d.dueDate.isNotBlank()) {
                        Text(fmtDate(d.dueDate), fontSize = 9.5.sp)
                    }
                }
            }

            Spacer(Modifier.width(8.dp))

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    money(FinanceLogic.liveBalance(d)),
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    color = if (d.paid)
                        MaterialTheme.colorScheme.secondary
                    else
                        MaterialTheme.colorScheme.error
                )
                Text(
                    if (d.paid) "SALDADA" else d.legalStatus,
                    fontSize = 9.5.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = .68f)
                )
            }
        }
    }
}

@Composable
fun PlanScreen(
    state: CoreState,
    onDebt: (Debt) -> Unit,
    onSaveBudget: (BudgetSettings) -> Unit,
    onSaveFund: (FundSettings) -> Unit,
    onSaveNet: (NetSettings) -> Unit
) {
    var strategy by remember { mutableStateOf("respawn") }
    var count by remember { mutableIntStateOf(5) }
    var simMonthly by remember { mutableStateOf("500") }
    var simExtra by remember { mutableStateOf("0") }
    var simStrategy by remember { mutableStateOf("respawn") }
    var simResult by remember { mutableStateOf<Triple<Int?, Double, List<Pair<String, Int>>>?>(null) }

    var income by remember(state.settings.budget) { mutableStateOf(state.settings.budget.income.toString()) }
    var essentials by remember(state.settings.budget) { mutableStateOf(state.settings.budget.essentials.toString()) }
    var safety by remember(state.settings.budget) { mutableStateOf(state.settings.budget.safety.toString()) }
    var debtBudget by remember(state.settings.budget) { mutableStateOf(state.settings.budget.debt.toString()) }

    var fundCurrent by remember(state.settings.fund) { mutableStateOf(state.settings.fund.current.toString()) }
    var fundTarget by remember(state.settings.fund) { mutableStateOf(state.settings.fund.target.toString()) }

    var netAssets by remember(state.settings.net) { mutableStateOf(state.settings.net.assets.toString()) }
    var netOther by remember(state.settings.net) { mutableStateOf(state.settings.net.other.toString()) }

    val attack = remember(state, strategy, count) {
        FinanceLogic.attackSort(strategy, state.debts).take(count)
    }
    val capacity = (income.toDoubleOrNull() ?: 0.0) -
        (essentials.toDoubleOrNull() ?: 0.0) -
        (safety.toDoubleOrNull() ?: 0.0)
    val fundPct = ((fundCurrent.toDoubleOrNull() ?: 0.0) /
        (fundTarget.toDoubleOrNull() ?: 1.0) * 100).coerceIn(0.0, 100.0)
    val t = FinanceLogic.totals(state.debts)
    val netWorth = (netAssets.toDoubleOrNull() ?: 0.0) + (netOther.toDoubleOrNull() ?: 0.0) - t.live

    val short = state.debts.filter { !it.paid && (it.type == "Microcrédito" || it.type == "Tarxeta") }
    val createdAfter = state.debts.filter {
        it.createdAt.take(10) > state.settings.baselineDate &&
            it.type in listOf("Microcrédito","Tarxeta","Financiamento")
    }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { SectionTitle("PLAN DE ATAQUE") }
        item {
            RespawnCard {
                ChoiceDropdown(
                    "Estratexia",
                    strategy,
                    listOf("respawn","snowball","avalanche","due")
                ) { strategy = it }
                ChoiceDropdown("Máximo obxectivos visibles", count.toString(), listOf("5","10","20")) {
                    count = it.toInt()
                }
            }
        }
        items(attack, key = { "atk-${it.id}" }) { d ->
            RespawnCard(onClick = { onDebt(d) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("#${attack.indexOf(d)+1}", fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(d.name, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            RiskBadge(FinanceLogic.riskInfo(d))
                        }
                        Text(
                            "${d.type} · TAE ${"%.2f".format(d.apr)}% · ${if (d.dueDate.isBlank()) "sen data" else fmtDate(d.dueDate)} · score ${FinanceLogic.attackScore(d)}",
                            fontSize = 11.sp
                        )
                    }
                    Spacer(Modifier.width(8.dp))
                    Text(money(FinanceLogic.liveBalance(d)), fontWeight = FontWeight.Bold)
                }
            }
        }

        item { SectionTitle("SIMULADOR “E SE PAGO...”") }
        item {
            RespawnCard {
                OutlinedTextField(simMonthly, { simMonthly = it }, label={Text("Orzamento mensual para débeda")}, singleLine=true, modifier=Modifier.fillMaxWidth())
                OutlinedTextField(simExtra, { simExtra = it }, label={Text("Pago extraordinario agora")}, singleLine=true, modifier=Modifier.fillMaxWidth())
                ChoiceDropdown("Estratexia", simStrategy, listOf("respawn","snowball","avalanche","due")) { simStrategy=it }
                Button(
                    onClick = {
                        simResult = FinanceLogic.simulate(
                            state,
                            simMonthly.replace(",", ".").toDoubleOrNull() ?: 0.0,
                            simExtra.replace(",", ".").toDoubleOrNull() ?: 0.0,
                            simStrategy
                        )
                    },
                    modifier=Modifier.fillMaxWidth()
                ) { Text("SIMULAR") }

                simResult?.let { result ->
                    HorizontalDivider()
                    Text(
                        result.first?.let { "~ $it MESES" } ?: "NON PECHA",
                        fontSize = 25.sp,
                        fontWeight = FontWeight.Black,
                        color = if (result.first != null) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.error
                    )
                    Text("Xuros aproximados modelados: ${money(result.second)}")
                    result.third.take(8).forEach { Text("MES ${it.second}: ${it.first}", fontSize=11.sp) }
                    Text("Supón que non nacen novas débedas e que as TAE baleiras equivalen a 0%.", fontSize=10.sp)
                }
            }
        }

        item { SectionTitle("ORZAMENTO DISPOÑIBLE") }
        item {
            RespawnCard {
                OutlinedTextField(income,{income=it},label={Text("Ingresos mensuais")},singleLine=true,modifier=Modifier.fillMaxWidth())
                OutlinedTextField(essentials,{essentials=it},label={Text("Gastos básicos")},singleLine=true,modifier=Modifier.fillMaxWidth())
                OutlinedTextField(safety,{safety=it},label={Text("Colchón mensual que queres respectar")},singleLine=true,modifier=Modifier.fillMaxWidth())
                OutlinedTextField(debtBudget,{debtBudget=it},label={Text("Orzamento débeda decidido")},singleLine=true,modifier=Modifier.fillMaxWidth())
                Text("Capacidade teórica dispoñible: ${money(capacity.coerceAtLeast(0.0))}", fontWeight=FontWeight.Bold, color=MaterialTheme.colorScheme.primary)
                Button(onClick={
                    onSaveBudget(BudgetSettings(
                        income.replace(",",".").toDoubleOrNull()?:0.0,
                        essentials.replace(",",".").toDoubleOrNull()?:0.0,
                        safety.replace(",",".").toDoubleOrNull()?:0.0,
                        debtBudget.replace(",",".").toDoubleOrNull()?:0.0
                    ))
                },modifier=Modifier.fillMaxWidth()){Text("GARDAR ORZAMENTO")}
            }
        }

        item { SectionTitle("FONDO DE EMERXENCIA") }
        item {
            RespawnCard {
                OutlinedTextField(fundCurrent,{fundCurrent=it},label={Text("Fondo actual")},singleLine=true,modifier=Modifier.fillMaxWidth())
                ChoiceDropdown("Obxectivo", fundTarget, listOf("300.0","500.0","1000.0","2000.0")) { fundTarget=it }
                LinearProgressIndicator(progress={ (fundPct/100.0).toFloat() },modifier=Modifier.fillMaxWidth())
                Text("${money(fundCurrent.toDoubleOrNull()?:0.0)} / ${money(fundTarget.toDoubleOrNull()?:0.0)} · ${fundPct.toInt()}%")
                Button(onClick={
                    onSaveFund(FundSettings(
                        fundCurrent.replace(",",".").toDoubleOrNull()?:0.0,
                        fundTarget.replace(",",".").toDoubleOrNull()?:500.0
                    ))
                },modifier=Modifier.fillMaxWidth()){Text("GARDAR FONDO")}
            }
        }

        item { SectionTitle("PATRIMONIO NETO FINANCEIRO") }
        item {
            RespawnCard {
                OutlinedTextField(netAssets,{netAssets=it},label={Text("Efectivo / contas / aforro")},singleLine=true,modifier=Modifier.fillMaxWidth())
                OutlinedTextField(netOther,{netOther=it},label={Text("Outros activos líquidos")},singleLine=true,modifier=Modifier.fillMaxWidth())
                Text(
                    money(netWorth),
                    fontSize=28.sp,
                    fontWeight=FontWeight.Black,
                    color=if(netWorth>=0) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.error
                )
                Text("Activos líquidos − saldo vivo da débeda.",fontSize=11.sp)
                Button(onClick={
                    onSaveNet(NetSettings(
                        netAssets.replace(",",".").toDoubleOrNull()?:0.0,
                        netOther.replace(",",".").toDoubleOrNull()?:0.0
                    ))
                },modifier=Modifier.fillMaxWidth()){Text("GARDAR FOTO PATRIMONIAL")}
            }
        }

        item { SectionTitle("NON VOLVER A FACER") }
        item {
            RespawnCard {
                if(short.isEmpty()) {
                    Text("Non hai microcréditos nin tarxetas activas no sistema. Patrón curto: limpo.", color=MaterialTheme.colorScheme.secondary)
                } else {
                    Text(
                        "PATRÓN CURTO ACTIVO: ${short.size} operacións de microcrédito/tarxeta abertas. Novas operacións deste tipo desde a foto base: ${createdAfter.size}.",
                        color=MaterialTheme.colorScheme.error,
                        fontWeight=FontWeight.Bold
                    )
                }
                Text("Este bloque non che impide facer nada; sinala cando unha nova operación recrea o patrón de crédito curto, tarxeta ou financiamento.",fontSize=11.sp)
            }
        }
    }
}
