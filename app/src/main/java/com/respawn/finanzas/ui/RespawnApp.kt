package com.respawn.finanzas.ui

import android.content.Context
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items as gridItems
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.respawn.finanzas.data.DebtWithBalance
import com.respawn.finanzas.ui.theme.RespawnTheme
import com.respawn.finanzas.ui.theme.RespawnThemeMode
import java.text.NumberFormat
import java.util.Locale

private enum class Section(val label: String) {
    PANEL("Panel"),
    DEBEDAS("Débedas"),
    MAIS("Máis")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RespawnApp(viewModel: MainViewModel) {
    val context = LocalContext.current
    val prefs = remember {
        context.getSharedPreferences("respawn_settings", Context.MODE_PRIVATE)
    }

    var themeMode by remember {
        mutableStateOf(
            if (prefs.getString("theme", "obsidian") == "ivory")
                RespawnThemeMode.IVORY
            else
                RespawnThemeMode.OBSIDIAN
        )
    }

    RespawnTheme(themeMode) {
        val state by viewModel.state.collectAsStateWithLifecycle()

        val backupPicker = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.OpenDocument()
        ) { uri ->
            if (uri != null) viewModel.importPcBackup(uri)
        }

        var section by remember { mutableStateOf(Section.PANEL) }
        var showAdd by remember { mutableStateOf(false) }
        var selected by remember { mutableStateOf<DebtWithBalance?>(null) }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text(
                                "RESPAWN // FINANZAS",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                "ANDROID · 0.2.1",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f)
                            )
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = {
                                themeMode =
                                    if (themeMode == RespawnThemeMode.OBSIDIAN)
                                        RespawnThemeMode.IVORY
                                    else
                                        RespawnThemeMode.OBSIDIAN

                                prefs.edit()
                                    .putString(
                                        "theme",
                                        if (themeMode == RespawnThemeMode.IVORY)
                                            "ivory"
                                        else
                                            "obsidian"
                                    )
                                    .apply()
                            }
                        ) {
                            Icon(
                                if (themeMode == RespawnThemeMode.OBSIDIAN)
                                    Icons.Default.LightMode
                                else
                                    Icons.Default.DarkMode,
                                contentDescription = "Cambiar tema"
                            )
                        }
                    }
                )
            },
            bottomBar = {
                NavigationBar {
                    Section.entries.forEach { item ->
                        NavigationBarItem(
                            selected = section == item,
                            onClick = { section = item },
                            icon = {
                                Icon(
                                    when (item) {
                                        Section.PANEL -> Icons.Default.Dashboard
                                        Section.DEBEDAS -> Icons.Default.AccountBalanceWallet
                                        Section.MAIS -> Icons.Default.MoreHoriz
                                    },
                                    contentDescription = item.label
                                )
                            },
                            label = { Text(item.label) }
                        )
                    }
                }
            },
            floatingActionButton = {
                if (section == Section.DEBEDAS) {
                    FloatingActionButton(onClick = { showAdd = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Engadir débeda")
                    }
                }
            }
        ) { padding ->
            Box(
                Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                when {
                    state.loading ->
                        CircularProgressIndicator(Modifier.align(Alignment.Center))

                    state.error != null ->
                        ErrorState(state.error!!, viewModel::refresh)

                    else -> when (section) {
                        Section.PANEL ->
                            Dashboard(state.balances)

                        Section.DEBEDAS ->
                            DebtsScreen(
                                balances = state.balances,
                                onDebt = { selected = it }
                            )

                        Section.MAIS ->
                            MoreScreen(
                                importing = state.importing,
                                onImport = {
                                    backupPicker.launch(
                                        arrayOf("application/json", "text/plain", "*/*")
                                    )
                                }
                            )
                    }
                }
            }
        }

        if (showAdd) {
            AddDebtDialog(
                onDismiss = { showAdd = false },
                onSave = { name, amount, category, type ->
                    viewModel.addDebt(name, amount, category, type)
                    showAdd = false
                }
            )
        }

        selected?.let { row ->
            DebtDetailDialog(
                row = row,
                onDismiss = { selected = null },
                onPaid = {
                    viewModel.setPaid(row.debt.id, !row.debt.paid)
                    selected = null
                },
                onPayment = { amount, note ->
                    viewModel.addPayment(row.debt.id, amount, note)
                    selected = null
                }
            )
        }

        state.importSummary?.let { summary ->
            AlertDialog(
                onDismissRequest = viewModel::clearImportMessage,
                title = { Text("BACKUP IMPORTADO") },
                text = {
                    Text(
                        "Versión PC: ${summary.backupVersion}\n" +
                            "Débedas: ${summary.debts}\n" +
                            "Papeleira preservada: ${summary.trashedDebts}\n" +
                            "Pagos: ${summary.payments}\n" +
                            "Notas: ${summary.notes}\n" +
                            "PDF/documentos: ${summary.documents}" +
                            if (summary.skippedDocuments > 0)
                                "\nDocumentos omitidos: ${summary.skippedDocuments}"
                            else
                                ""
                    )
                },
                confirmButton = {
                    Button(onClick = viewModel::clearImportMessage) {
                        Text("OK")
                    }
                }
            )
        }

        state.importError?.let { message ->
            AlertDialog(
                onDismissRequest = viewModel::clearImportMessage,
                title = { Text("NON SE PUIDO IMPORTAR") },
                text = { Text(message) },
                confirmButton = {
                    Button(onClick = viewModel::clearImportMessage) {
                        Text("PECHAR")
                    }
                }
            )
        }
    }
}

@Composable
private fun ErrorState(message: String, retry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Erro: $message")
        Spacer(Modifier.height(12.dp))
        Button(onClick = retry) { Text("REINTENTAR") }
    }
}

@Composable
private fun Dashboard(rows: List<DebtWithBalance>) {
    val total = rows.sumOf { it.debt.amountCents }
    val live = rows.sumOf { it.liveCents }
    val paid = rows.sumOf { it.paidCents }
    val resolved = (total - live).coerceAtLeast(0L)
    val open = rows.count { !it.debt.paid }
    val progress = if (total > 0) resolved.toFloat() / total.toFloat() else 0f

    val primaryColor = MaterialTheme.colorScheme.primary
    val errorColor = MaterialTheme.colorScheme.error
    val secondaryColor = MaterialTheme.colorScheme.secondary

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                "PANEL",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary
            )
        }

        item {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(160.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp),
                userScrollEnabled = false,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                gridItems(
                    listOf(
                        Triple("TOTAL BASE", total, primaryColor),
                        Triple("SALDO VIVO", live, errorColor),
                        Triple("RESOLTO", resolved, secondaryColor),
                        Triple("PAGOS REAIS", paid, secondaryColor)
                    )
                ) { (label, value, color) ->
                    KpiCard(label, money(value), color)
                }
            }
        }

        item {
            Surface(
                shape = RoundedCornerShape(18.dp),
                tonalElevation = 1.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text(
                        "PROGRESO GLOBAL",
                        style = MaterialTheme.typography.labelMedium
                    )
                    Spacer(Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { progress.coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "${(progress * 100).toInt()}% resolto · $open abertas",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }

        item {
            Text(
                "MAIORES SALDOS",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }

        items(
            rows
                .filter { !it.debt.paid }
                .sortedByDescending { it.liveCents }
                .take(5)
        ) {
            DebtMiniRow(it)
        }
    }
}

@Composable
private fun KpiCard(label: String, value: String, accent: Color) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 112.dp),
        shape = RoundedCornerShape(18.dp),
        tonalElevation = 1.dp
    ) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = .65f)
            )
            Text(
                value,
                color = accent,
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                maxLines = 1,
                softWrap = false,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun DebtMiniRow(row: DebtWithBalance) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        tonalElevation = 1.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.weight(1f)) {
                Text(row.debt.name, fontWeight = FontWeight.Bold)
                Text(
                    row.debt.category,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f),
                    fontSize = 12.sp
                )
            }

            Text(
                money(row.liveCents),
                color = MaterialTheme.colorScheme.error,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun DebtsScreen(
    balances: List<DebtWithBalance>,
    onDebt: (DebtWithBalance) -> Unit
) {
    var search by remember { mutableStateOf("") }

    val filtered = remember(balances, search) {
        balances.filter {
            search.isBlank() ||
                it.debt.name.contains(search, ignoreCase = true) ||
                it.debt.category.contains(search, ignoreCase = true) ||
                it.debt.type.contains(search, ignoreCase = true)
        }
    }

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            leadingIcon = { Icon(Icons.Default.Search, null) },
            placeholder = { Text("Buscar débeda...") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(
                horizontal = 14.dp,
                vertical = 4.dp
            ),
            verticalArrangement = Arrangement.spacedBy(9.dp)
        ) {
            items(filtered, key = { it.debt.id }) { row ->
                DebtCard(row, onClick = { onDebt(row) })
            }
        }
    }
}

@Composable
private fun DebtCard(row: DebtWithBalance, onClick: () -> Unit) {
    val d = row.debt

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 1.dp
    ) {
        Row(
            modifier = Modifier.padding(15.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                Modifier
                    .size(10.dp, 48.dp)
                    .background(
                        when (d.category) {
                            "Débeda actual" ->
                                MaterialTheme.colorScheme.error

                            "Débeda antiga" ->
                                MaterialTheme.colorScheme.primary

                            "Recuperacións" ->
                                MaterialTheme.colorScheme.secondary

                            else ->
                                MaterialTheme.colorScheme.tertiary
                        },
                        RoundedCornerShape(8.dp)
                    )
            )

            Spacer(Modifier.width(12.dp))

            Column(Modifier.weight(1f)) {
                Text(
                    d.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Spacer(Modifier.height(3.dp))
                Text(
                    "${d.category} · ${d.type}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = .62f)
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    money(row.liveCents),
                    color =
                        if (d.paid) MaterialTheme.colorScheme.secondary
                        else MaterialTheme.colorScheme.error,
                    fontWeight = FontWeight.ExtraBold
                )

                Text(
                    if (d.paid) "SALDADA" else "ABERTA",
                    fontSize = 11.sp,
                    color =
                        if (d.paid) MaterialTheme.colorScheme.secondary
                        else MaterialTheme.colorScheme.onSurface.copy(alpha = .6f)
                )
            }
        }
    }
}

@Composable
private fun AddDebtDialog(
    onDismiss: () -> Unit,
    onSave: (String, String, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Débeda actual") }
    var type by remember { mutableStateOf("Microcrédito") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("NOVA DÉBEDA") },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nome") },
                    singleLine = true
                )

                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Importe €") },
                    singleLine = true
                )

                SimpleChoice(
                    label = "Bloque",
                    value = category,
                    options = listOf(
                        "Débeda actual",
                        "Débeda antiga",
                        "Recuperacións",
                        "Pendentes"
                    ),
                    onChange = { category = it }
                )

                SimpleChoice(
                    label = "Tipo",
                    value = type,
                    options = listOf(
                        "Microcrédito",
                        "Financiamento",
                        "Tarxeta",
                        "Banco",
                        "AEAT",
                        "Telecom",
                        "Persoal",
                        "Outro"
                    ),
                    onChange = { type = it }
                )
            }
        },
        confirmButton = {
            Button(
                enabled =
                    name.isNotBlank() &&
                        amount.replace(",", ".").toBigDecimalOrNull() != null,
                onClick = {
                    onSave(name, amount, category, type)
                }
            ) {
                Text("GARDAR")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("CANCELAR")
            }
        }
    )
}

@Composable
private fun SimpleChoice(
    label: String,
    value: String,
    options: List<String>,
    onChange: (String) -> Unit
) {
    var open by remember { mutableStateOf(false) }

    Column {
        Text(label, style = MaterialTheme.typography.labelMedium)
        Spacer(Modifier.height(4.dp))

        Box {
            OutlinedButton(onClick = { open = true }) {
                Text(value)
                Spacer(Modifier.width(6.dp))
                Icon(Icons.Default.ArrowDropDown, null)
            }

            DropdownMenu(
                expanded = open,
                onDismissRequest = { open = false }
            ) {
                options.forEach {
                    DropdownMenuItem(
                        text = { Text(it) },
                        onClick = {
                            onChange(it)
                            open = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun DebtDetailDialog(
    row: DebtWithBalance,
    onDismiss: () -> Unit,
    onPaid: () -> Unit,
    onPayment: (String, String) -> Unit
) {
    var payment by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(row.debt.name) },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Base: ${money(row.debt.amountCents)}")
                Text(
                    "Saldo vivo: ${money(row.liveCents)}",
                    color = MaterialTheme.colorScheme.error,
                    fontWeight = FontWeight.Bold
                )
                Text("Pagos rexistrados: ${money(row.paidCents)}")

                HorizontalDivider()

                Text(
                    "Rexistrar pago parcial",
                    fontWeight = FontWeight.Bold
                )

                OutlinedTextField(
                    value = payment,
                    onValueChange = { payment = it },
                    label = { Text("Importe €") },
                    singleLine = true
                )

                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Nota") }
                )

                Button(
                    enabled =
                        payment.replace(",", ".").toBigDecimalOrNull() != null,
                    onClick = { onPayment(payment, note) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("REXISTRAR PAGO")
                }
            }
        },
        confirmButton = {
            Button(onClick = onPaid) {
                Text(
                    if (row.debt.paid)
                        "REABRIR"
                    else
                        "MARCAR SALDADA"
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("PECHAR")
            }
        }
    )
}

@Composable
private fun MoreScreen(
    importing: Boolean,
    onImport: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                "MÁIS",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary
            )
        }

        item {
            Surface(
                shape = RoundedCornerShape(18.dp),
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.UploadFile,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )

                        Spacer(Modifier.width(10.dp))

                        Column(Modifier.weight(1f)) {
                            Text(
                                "IMPORTAR RESPAWN DESDE PC",
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Le o backup completo JSON da versión USB/PC e " +
                                    "reconstrúe débedas, pagos, Caderno e PDF.",
                                fontSize = 13.sp,
                                color =
                                    MaterialTheme.colorScheme.onSurface.copy(alpha = .65f)
                            )
                        }
                    }

                    Spacer(Modifier.height(14.dp))

                    Button(
                        onClick = onImport,
                        enabled = !importing,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (importing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(Modifier.width(10.dp))
                            Text("IMPORTANDO...")
                        } else {
                            Icon(Icons.Default.FolderOpen, null)
                            Spacer(Modifier.width(8.dp))
                            Text("SELECCIONAR BACKUP JSON")
                        }
                    }

                    Spacer(Modifier.height(8.dp))

                    Text(
                        "A importación substitúe os datos actuais da app Android. " +
                            "Os PDF do backup quedan gardados no espazo privado da aplicación.",
                        fontSize = 12.sp,
                        color =
                            MaterialTheme.colorScheme.onSurface.copy(alpha = .6f)
                    )
                }
            }
        }

        item {
            Text(
                "SEGUINTE FASE",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }

        items(
            listOf(
                "Arquivo de PDF e visor dentro da app",
                "Caderno / información xeral visible",
                "Backup Android compatible con PC",
                "Calendario e notificacións de vencementos",
                "Backup cifrado e restauración",
                "Pegada / biometría",
                "Plan de ataque e simulador",
                "Saúde dos datos"
            )
        ) { title ->
            Surface(
                shape = RoundedCornerShape(16.dp),
                tonalElevation = 1.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.CheckCircleOutline,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.width(12.dp))
                    Text(title)
                }
            }
        }
    }
}

private fun money(cents: Long): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("gl", "ES"))
    return formatter.format(cents / 100.0)
}
