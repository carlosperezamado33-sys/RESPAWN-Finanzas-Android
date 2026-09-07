package com.respawn.finanzas.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.respawn.finanzas.data.*
import java.time.LocalDate
import java.time.YearMonth

enum class MoreDestination {
    CALENDAR, CONTROL, EVOLUTION, ARCHIVE, TRASH, HEALTH, SECURITY, INTERNAL_BACKUPS
}

@Composable
fun MoreScreen(onOpen: (MoreDestination) -> Unit) {
    val cards = listOf(
        Triple(MoreDestination.CALENDAR, "CALENDARIO", "Vencementos, pagamentos e ofertas por data."),
        Triple(MoreDestination.CONTROL, "CONTROL", "CIRBE, ASNEF, BADEXCUG, xudicial e investigación."),
        Triple(MoreDestination.EVOLUTION, "EVOLUCIÓN", "Histórico, patrimonio e resumos mensuais."),
        Triple(MoreDestination.ARCHIVE, "ARQUIVO", "Débedas saldadas co seu historial completo."),
        Triple(MoreDestination.TRASH, "PAPELEIRA", "Recupera débedas eliminadas antes de borralas definitivamente."),
        Triple(MoreDestination.HEALTH, "SAÚDE DOS DATOS", "Integridade, PDF orfos, pagamentos e copias."),
        Triple(MoreDestination.SECURITY, "SEGURIDADE", "Backup cifrado e bloqueo da interface.")
    )
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item { SectionTitle("MÁIS FERRAMENTAS", "Funcións de control, histórico, seguridade e mantemento.") }
        items(cards, key = { it.first.name }) { c ->
            RespawnCard(onClick = { onOpen(c.first) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        when(c.first) {
                            MoreDestination.CALENDAR -> Icons.Default.CalendarMonth
                            MoreDestination.CONTROL -> Icons.Default.FactCheck
                            MoreDestination.EVOLUTION -> Icons.Default.ShowChart
                            MoreDestination.ARCHIVE -> Icons.Default.Inventory2
                            MoreDestination.TRASH -> Icons.Default.DeleteSweep
                            MoreDestination.HEALTH -> Icons.Default.HealthAndSafety
                            MoreDestination.SECURITY -> Icons.Default.Security
                            MoreDestination.INTERNAL_BACKUPS -> Icons.Default.Backup
                        },
                        null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(30.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(c.second, fontWeight = FontWeight.Bold)
                        Text(c.third, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha=.62f))
                    }
                    Icon(Icons.Default.ChevronRight, null)
                }
            }
        }
    }
}

@Composable
fun CalendarScreen(state: CoreState, onDebt: (Debt) -> Unit) {
    var cursor by remember { mutableStateOf(YearMonth.now()) }
    val first = cursor.atDay(1)
    val offset = first.dayOfWeek.value - 1
    val start = first.minusDays(offset.toLong())
    val days = (0L until 42L).map { start.plusDays(it) }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(10.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { cursor = cursor.minusMonths(1) }) { Icon(Icons.Default.ChevronLeft, null) }
                Text(
                    "${cursor.month.name} ${cursor.year}",
                    Modifier.weight(1f),
                    textAlign = TextAlign.Center,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
                IconButton(onClick = { cursor = cursor.plusMonths(1) }) { Icon(Icons.Default.ChevronRight, null) }
            }
        }
        item {
            Row(Modifier.fillMaxWidth()) {
                listOf("LUN","MAR","MÉR","XOV","VEN","SÁB","DOM").forEach {
                    Text(it, Modifier.weight(1f), textAlign = TextAlign.Center, fontSize=9.sp, fontWeight=FontWeight.Bold)
                }
            }
        }
        items(days.chunked(7), key = { it.first().toString() }) { week ->
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                week.forEach { day ->
                    val due = state.debts.filter { !it.paid && it.dueDate == day.toString() }
                    val pays = state.debts.flatMap { d ->
                        d.payments.filter { it.date == day.toString() }.map { d to it }
                    }
                    val offers = state.debts.filter { it.agreement.deadline == day.toString() }
                    DayCell(
                        day = day,
                        inMonth = day.month == cursor.month,
                        isToday = day == LocalDate.now(),
                        due = due,
                        payments = pays,
                        offers = offers,
                        onDebt = onDebt,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
        item {
            Text(
                "Vermello: data límite/revisión · Verde: pago rexistrado · Ouro: oferta/acordo.",
                fontSize=11.sp,
                color=MaterialTheme.colorScheme.onSurface.copy(alpha=.62f)
            )
        }
    }
}

@Composable
private fun DayCell(
    day: LocalDate,
    inMonth: Boolean,
    isToday: Boolean,
    due: List<Debt>,
    payments: List<Pair<Debt, Payment>>,
    offers: List<Debt>,
    onDebt: (Debt) -> Unit,
    modifier: Modifier
) {
    Surface(
        modifier = modifier.heightIn(min=84.dp),
        shape=RoundedCornerShape(10.dp),
        border = if(isToday) androidx.compose.foundation.BorderStroke(1.dp,MaterialTheme.colorScheme.primary) else null,
        color = MaterialTheme.colorScheme.surface.copy(alpha=if(inMonth)1f else .45f)
    ) {
        Column(Modifier.padding(5.dp),verticalArrangement=Arrangement.spacedBy(2.dp)) {
            Text(day.dayOfMonth.toString(),fontSize=10.sp,fontWeight=FontWeight.Bold)
            due.take(2).forEach { d ->
                CalendarEvent(d.name, MaterialTheme.colorScheme.error) { onDebt(d) }
            }
            payments.take(2).forEach { (d,p) ->
                CalendarEvent("P ${money(p.amount)}", MaterialTheme.colorScheme.secondary) { onDebt(d) }
            }
            offers.take(1).forEach { d ->
                CalendarEvent("OFERTA", MaterialTheme.colorScheme.primary) { onDebt(d) }
            }
            val extra = due.size + payments.size + offers.size - 5
            if(extra>0) Text("+$extra",fontSize=8.sp)
        }
    }
}

@Composable
private fun CalendarEvent(text:String,color:Color,onClick:()->Unit){
    Surface(
        modifier=Modifier.fillMaxWidth().clickable(onClick=onClick),
        shape=RoundedCornerShape(5.dp),
        color=color.copy(alpha=.16f)
    ){
        Text(text,Modifier.padding(horizontal=3.dp,vertical=2.dp),fontSize=7.5.sp,maxLines=1,overflow=TextOverflow.Ellipsis,color=color)
    }
}

@Composable
fun ControlScreen(
    state: CoreState,
    documents: List<DocumentRecord>,
    onSource: (String) -> Unit,
    onDebt: (Debt) -> Unit
) {
    val open = state.debts.filter { !it.paid }
    val n = open.size.coerceAtLeast(1).toDouble()
    fun pct(selector:(Debt)->Boolean) = (open.count(selector) / n * 100).toInt()
    val investigated = (open.count { it.investigation.status != "Non avaliado" } / n * 100).toInt()

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding=PaddingValues(14.dp),
        verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item { SectionTitle("FONTES DE CONTROL","CIRBE · ASNEF · BADEXCUG · XUDICIAL. Garda a data, resultado e o PDF do informe.") }
        items(listOf("CIRBE","ASNEF","BADEXCUG","XUDICIAL")) { key ->
            val src=state.sources[key]?:SourceControl()
            val count=documents.count{it.ownerId=="GLOBAL:$key"}
            RespawnCard(onClick={onSource(key)}){
                Row(verticalAlignment=Alignment.CenterVertically){
                    Column(Modifier.weight(1f)){
                        Text(key,fontWeight=FontWeight.Bold)
                        Text("${if(src.date.isBlank()) "sen comprobar" else fmtDate(src.date)} · ${src.status} · ${src.note.ifBlank{"sen resumo"}} · PDF $count",fontSize=11.sp)
                    }
                    Icon(Icons.Default.ChevronRight,null)
                }
            }
        }

        item { SectionTitle("SEMÁFORO DOCUMENTAL GLOBAL") }
        item {
            Column(verticalArrangement=Arrangement.spacedBy(8.dp)){
                DocGlobalMetric("Contratos",pct{it.docs.contract})
                DocGlobalMetric("Saldo actualizado",pct{it.docs.balance})
                DocGlobalMetric("Titular actual",pct{it.docs.creditor})
                DocGlobalMetric("Reclamacións",pct{it.docs.claims})
                DocGlobalMetric("Xudicial",pct{it.docs.judicial})
                DocGlobalMetric("Ficha investigada",investigated)
            }
        }

        item { SectionTitle("DÉBEDAS ANTIGAS · INVESTIGACIÓN / PRESCRICIÓN","Ferramenta de seguimento, non conclusión xurídica automática.") }
        items(state.debts.filter{it.category=="Débeda antiga"},key={it.id}){d->
            RespawnCard(onClick={onDebt(d)}){
                Text(d.name,fontWeight=FontWeight.Bold)
                Text("Estado: ${d.investigation.status} · Legal: ${d.legalStatus}",fontSize=11.sp)
                Text("Últ. pago ${fmtDate(d.investigation.lastPayment)} · Últ. reclamación ${fmtDate(d.investigation.lastClaim)} · Últ. contacto ${fmtDate(d.investigation.lastContact)} · Xudicial ${d.investigation.judicial}",fontSize=10.sp)
            }
        }
    }
}

@Composable
private fun DocGlobalMetric(label:String,pct:Int){
    RespawnCard{
        Row{
            Text(label,Modifier.weight(1f))
            Text("$pct%",fontWeight=FontWeight.Black,color=if(pct>=80)MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.primary)
        }
        LinearProgressIndicator(progress={pct/100f},modifier=Modifier.fillMaxWidth())
    }
}

@Composable
fun EvolutionScreen(
    state: CoreState,
    onMonthlyPdf: (String) -> Unit
) {
    var month by remember { mutableStateOf(YearMonth.now().toString()) }
    val stats = remember(state,month){ FinanceLogic.monthStats(state,month) }
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding=PaddingValues(14.dp),
        verticalArrangement=Arrangement.spacedBy(12.dp)
    ){
        item {
            RespawnCard {
                Text("HISTÓRICO DE SALDO VIVO",style=MaterialTheme.typography.titleMedium)
                SimpleLineChart(state.history.map{it.live})
                if(state.history.isEmpty())Text("Aínda non hai fotos.")
            }
        }
        item {
            RespawnCard {
                Text("PATRIMONIO NETO",style=MaterialTheme.typography.titleMedium)
                SimpleLineChart(state.networthHistory.map{it.net},lineColor=MaterialTheme.colorScheme.secondary)
                if(state.networthHistory.isEmpty())Text("Aínda non hai fotos patrimoniais.")
            }
        }
        item {
            SectionTitle("RESUMO MENSUAL")
        }
        item {
            RespawnCard {
                OutlinedTextField(month,{month=it},label={Text("Mes YYYY-MM")},singleLine=true,modifier=Modifier.fillMaxWidth())
                SummaryLine("Pagos reais",money(stats.payments))
                SummaryLine("Novas débedas","${stats.newCount} · ${money(stats.newAmount)}")
                SummaryLine("Pechadas","${stats.closedCount} · ${money(stats.closedAmount)}")
                SummaryLine("Saldo inicio",stats.start?.let(::money)?:"sen foto")
                SummaryLine("Saldo fin",stats.end?.let(::money)?:"sen foto")
                SummaryLine("Redución neta",stats.net?.let(::money)?:"sen datos suficientes")
                Button(onClick={onMonthlyPdf(month)},modifier=Modifier.fillMaxWidth()){
                    Icon(Icons.Default.PictureAsPdf,null);Spacer(Modifier.width(8.dp));Text("EXPORTAR RESUMO PDF")
                }
            }
        }
        item { SectionTitle("FOTOS DE EVOLUCIÓN") }
        items(state.history.sortedByDescending{it.at},key={it.at+it.reason}){
            RespawnCard{
                Row{
                    Column(Modifier.weight(1f)){
                        Text(it.date,fontWeight=FontWeight.Bold)
                        Text(it.reason.ifBlank{"actualización"},fontSize=11.sp)
                    }
                    Column(horizontalAlignment=Alignment.End){
                        Text("Vivo ${money(it.live)}",fontWeight=FontWeight.Bold)
                        Text("Resolto ${money(it.resolved)} · Total ${money(it.total)}",fontSize=10.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun SummaryLine(label:String,value:String){
    Row(Modifier.fillMaxWidth()){
        Text(label,Modifier.weight(1f),color=MaterialTheme.colorScheme.onSurface.copy(alpha=.65f))
        Text(value,fontWeight=FontWeight.Bold)
    }
}

@Composable
fun ArchiveScreen(state:CoreState,onDebt:(Debt)->Unit){
    val rows=state.debts.filter{it.paid}.sortedByDescending{it.closedAt}
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(14.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){
        item{SectionTitle("ARQUIVO / SALDADAS","Nada desaparece. Mantés documentos, pagamentos, bitácora, acordo e data de peche.")}
        if(rows.isEmpty())item{Text("Aínda non hai débedas arquivadas.")}
        items(rows,key={it.id}){d->
            RespawnCard(onClick={onDebt(d)}){
                Text(d.name,fontWeight=FontWeight.Bold)
                Text("Pechada ${d.closedAt.take(10).ifBlank{"sen data"}} · ${d.legalStatus} · ${d.type}",fontSize=11.sp)
                Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){
                    Text("Base ${money(d.amount)}",fontSize=11.sp)
                    Text("Pago ${money(FinanceLogic.sumPayments(d))}",fontSize=11.sp,color=MaterialTheme.colorScheme.secondary)
                    Text("Quita ${money(FinanceLogic.discountAmount(d))}",fontSize=11.sp,color=MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

@Composable
fun TrashScreen(
    state:CoreState,
    onRestore:(String)->Unit,
    onDelete:(String)->Unit,
    onDebt:(Debt)->Unit
){
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(14.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){
        item{SectionTitle("PAPELEIRA","As débedas eliminadas quedan aquí cos seus PDF e historial.")}
        if(state.trash.isEmpty())item{Text("Papeleira baleira.")}
        items(state.trash,key={it.id}){d->
            RespawnCard(onClick={onDebt(d)}){
                Text(d.name,fontWeight=FontWeight.Bold)
                Text("Eliminada ${d.trashedAt.take(10)} · ${money(FinanceLogic.liveBalance(d))}",fontSize=11.sp)
                Row{
                    Button(onClick={onRestore(d.id)},modifier=Modifier.weight(1f)){Text("RECUPERAR")}
                    Spacer(Modifier.width(8.dp))
                    OutlinedButton(onClick={onDelete(d.id)},modifier=Modifier.weight(1f)){Text("BORRAR")}
                }
            }
        }
    }
}

@Composable
fun HealthScreen(
    state:CoreState,
    documents:List<DocumentRecord>,
    snapshots:List<InternalSnapshot>,
    onBackup:()->Unit,
    onInternal:()->Unit
){
    val lines=remember(state,documents,snapshots){FinanceLogic.health(state,documents,snapshots.size)}
    val issues=lines.count{it.first!="ok"}
    val validOwners=buildSet{
        (state.debts+state.trash).forEach{add(it.id)}
        listOf("CIRBE","ASNEF","BADEXCUG","XUDICIAL").forEach{add("GLOBAL:$it")}
        state.generalNotes.forEach{add("NOTE:${it.id}")}
    }
    val orphans=documents.count{it.ownerId !in validOwners}
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(14.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        item{SectionTitle("SAÚDE DOS DATOS")}
        item{
            Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                Kpi("ESTADO",if(issues==0)"SAUDABLE" else "REVISAR",if(issues==0)MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.error,Modifier.weight(1f))
                Kpi("INCIDENCIAS",issues.toString(),MaterialTheme.colorScheme.primary,Modifier.weight(1f))
            }
        }
        item{
            Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                Kpi("PDF ORFOS",orphans.toString(),MaterialTheme.colorScheme.primary,Modifier.weight(1f))
                Kpi("COPIAS INTERNAS",snapshots.size.toString(),MaterialTheme.colorScheme.primary,Modifier.weight(1f))
            }
        }
        items(lines,key={it.second}){line->
            RespawnCard{
                Row(verticalAlignment=Alignment.CenterVertically){
                    Icon(
                        if(line.first=="ok")Icons.Default.CheckCircle else Icons.Default.Warning,
                        null,
                        tint=if(line.first=="ok")MaterialTheme.colorScheme.secondary else if(line.first=="bad")MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.width(9.dp))
                    Text(line.second)
                }
            }
        }
        item{
            Button(onClick=onBackup,modifier=Modifier.fillMaxWidth()){
                Icon(Icons.Default.Backup,null);Spacer(Modifier.width(8.dp));Text("BACKUP AGORA")
            }
        }
        item{
            OutlinedButton(onClick=onInternal,modifier=Modifier.fillMaxWidth()){
                Icon(Icons.Default.History,null);Spacer(Modifier.width(8.dp));Text("VER COPIAS INTERNAS")
            }
        }
        item{
            RespawnCard{
                Text("ONDE SE GARDAN OS DATOS",fontWeight=FontWeight.Bold)
                Text("Os datos estruturados están nunha base SQLite privada da app e os PDF na área privada de ficheiros. Para ter unha copia visible e portátil usa BACKUP COMPLETO, ZIP ou backup cifrado.",fontSize=11.sp)
            }
        }
    }
}

@Composable
fun SecurityScreen(
    security:SecuritySettings,
    onEncryptedBackup:(String)->Unit,
    onRestoreEncrypted:()->Unit,
    onSetLock:(String,Boolean)->Unit,
    onRemoveLock:()->Unit,
    onLockNow:()->Unit
){
    var pass1 by remember{mutableStateOf("")}
    var pass2 by remember{mutableStateOf("")}
    var lock1 by remember{mutableStateOf("")}
    var lock2 by remember{mutableStateOf("")}
    var lockOnStart by remember(security.lockOnStart){mutableStateOf(security.lockOnStart)}
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(14.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
        item{SectionTitle("BACKUP CIFRADO")}
        item{
            RespawnCard{
                Text("AES-256-GCM",fontWeight=FontWeight.Bold)
                Text("Crea un ficheiro .respawn cifrado con contrasinal. Inclúe datos e todos os PDF.",fontSize=11.sp)
                OutlinedTextField(pass1,{pass1=it},label={Text("Contrasinal")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                OutlinedTextField(pass2,{pass2=it},label={Text("Repetir")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                Button(
                    enabled=pass1.length>=8&&pass1==pass2,
                    onClick={onEncryptedBackup(pass1);pass1="";pass2=""},
                    modifier=Modifier.fillMaxWidth()
                ){Text("CREAR BACKUP CIFRADO")}
            }
        }
        item{
            RespawnCard{
                Text("RESTAURAR CIFRADO",fontWeight=FontWeight.Bold)
                Text("Selecciona un backup .respawn e introduce o seu contrasinal no seguinte paso.",fontSize=11.sp)
                OutlinedButton(onClick=onRestoreEncrypted,modifier=Modifier.fillMaxWidth()){Text("RESTAURAR CIFRADO")}
            }
        }
        item{SectionTitle("BLOQUEO DA INTERFACE")}
        item{
            RespawnCard{
                Text("PRIVACIDADE LOCAL",fontWeight=FontWeight.Bold)
                Text("Bloquea visualmente RESPAWN ao abrir. Isto evita accesos casuais; os backups cifrados son o mecanismo de cifrado portátil.",fontSize=11.sp)
                OutlinedTextField(lock1,{lock1=it},label={Text("Novo contrasinal")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                OutlinedTextField(lock2,{lock2=it},label={Text("Repetir")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                Row(verticalAlignment=Alignment.CenterVertically){
                    Checkbox(lockOnStart,{lockOnStart=it});Text("BLOQUEAR AO ARRANCAR")
                }
                Button(
                    enabled=lock1.length>=6&&lock1==lock2,
                    onClick={onSetLock(lock1,lockOnStart);lock1="";lock2=""},
                    modifier=Modifier.fillMaxWidth()
                ){Text("GARDAR BLOQUEO")}
                OutlinedButton(onClick=onRemoveLock,modifier=Modifier.fillMaxWidth(),enabled=security.lockEnabled){Text("QUITAR BLOQUEO")}
                OutlinedButton(onClick=onLockNow,modifier=Modifier.fillMaxWidth(),enabled=security.lockEnabled){Text("BLOQUEAR AGORA")}
            }
        }
    }
}

@Composable
fun InternalBackupsScreen(
    snapshots:List<InternalSnapshot>,
    onRestore:(Long)->Unit
){
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(14.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){
        item{SectionTitle("COPIAS INTERNAS","Últimas instantáneas automáticas gardadas na base privada da app.")}
        if(snapshots.isEmpty())item{Text("Aínda non hai copias internas.")}
        items(snapshots,key={it.id}){s->
            RespawnCard{
                Row(verticalAlignment=Alignment.CenterVertically){
                    Column(Modifier.weight(1f)){
                        Text("COPIA ${s.id}",fontWeight=FontWeight.Bold)
                        Text(s.createdAt,fontSize=11.sp)
                    }
                    Button(onClick={onRestore(s.id)}){Text("RESTAURAR")}
                }
            }
        }
    }
}
