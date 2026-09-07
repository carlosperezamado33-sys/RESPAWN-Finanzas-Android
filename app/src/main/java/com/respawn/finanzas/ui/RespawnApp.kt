package com.respawn.finanzas.ui

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.respawn.finanzas.data.*
import com.respawn.finanzas.ui.theme.RespawnTheme
import com.respawn.finanzas.ui.theme.RespawnThemeMode
import java.io.File

private enum class AppView(val label:String){
    PANEL("PANEL"),
    TODAY("HOXE"),
    DEBTS("DÉBEDAS"),
    PLAN("PLAN"),
    MORE("MÁIS"),
    NOTEBOOK("CADERNO"),
    CALENDAR("CALENDARIO"),
    CONTROL("CONTROL"),
    EVOLUTION("EVOLUCIÓN"),
    ARCHIVE("ARQUIVO"),
    TRASH("PAPELEIRA"),
    HEALTH("SAÚDE"),
    SECURITY("SEGURIDADE"),
    INTERNAL("COPIAS")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RespawnApp(viewModel: MainViewModel){
    val ui by viewModel.state.collectAsStateWithLifecycle()
    val context=LocalContext.current
    val mainTabs=listOf(AppView.PANEL,AppView.TODAY,AppView.DEBTS,AppView.PLAN,AppView.MORE,AppView.NOTEBOOK)
    var view by remember{mutableStateOf(AppView.PANEL)}

    var selectedDebtId by remember{mutableStateOf<String?>(null)}
    var selectedIsTrash by remember{mutableStateOf(false)}
    var showAddDebt by remember{mutableStateOf(false)}
    var editBaseId by remember{mutableStateOf<String?>(null)}
    var sourceKey by remember{mutableStateOf<String?>(null)}
    var noteDraft by remember{mutableStateOf<GeneralNote?>(null)}

    var pendingDocumentOwner by remember{mutableStateOf<String?>(null)}
    var pendingEncryptedUri by remember{mutableStateOf<android.net.Uri?>(null)}
    var askEncryptedPassword by remember{mutableStateOf(false)}

    var lockInitialized by remember{mutableStateOf(false)}
    var locked by remember{mutableStateOf(false)}

    val themeMode=if(ui.core.settings.theme=="ivory")RespawnThemeMode.IVORY else RespawnThemeMode.OBSIDIAN

    val documentPicker=rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ){uri->
        val owner=pendingDocumentOwner
        if(uri!=null&&owner!=null)viewModel.attachDocument(owner,uri)
        pendingDocumentOwner=null
    }

    val plainRestorePicker=rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ){uri-> if(uri!=null)viewModel.importPlain(uri) }

    val encryptedRestorePicker=rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ){uri->
        if(uri!=null){
            pendingEncryptedUri=uri
            askEncryptedPassword=true
        }
    }

    LaunchedEffect(ui.loading,ui.core.settings.security.lockEnabled,ui.core.settings.security.lockOnStart){
        if(!ui.loading&&!lockInitialized){
            lockInitialized=true
            locked=ui.core.settings.security.lockEnabled&&ui.core.settings.security.lockOnStart
        }
    }

    RespawnTheme(themeMode){
        Box(Modifier.fillMaxSize()){
            if(locked){
                LockScreen{password->
                    val ok=viewModel.verifyLock(password)
                    if(ok)locked=false
                    ok
                }
            }else{
                Scaffold(
                    topBar={
                        Column{
                            TopAppBar(
                                title={
                                    Column{
                                        Text("RESPAWN // FINANZAS",style=MaterialTheme.typography.titleMedium)
                                        Text("ANDROID · 0.9.0 · PARIDADE WEB",style=MaterialTheme.typography.labelMedium)
                                    }
                                },
                                navigationIcon={
                                    if(view !in mainTabs){
                                        IconButton(onClick={view=AppView.MORE}){
                                            Icon(Icons.Default.ArrowBack,"Volver")
                                        }
                                    }
                                },
                                actions={
                                    if(ui.core.settings.security.lockEnabled){
                                        IconButton(onClick={locked=true}){Icon(Icons.Default.Lock,"Bloquear")}
                                    }
                                    IconButton(onClick={
                                        viewModel.setTheme(if(ui.core.settings.theme=="ivory")"obsidian" else "ivory")
                                    }){
                                        Icon(
                                            if(ui.core.settings.theme=="ivory")Icons.Default.DarkMode else Icons.Default.LightMode,
                                            "Cambiar tema"
                                        )
                                    }
                                }
                            )
                            if(view in mainTabs){
                                ScrollableTabRow(
                                    selectedTabIndex=mainTabs.indexOf(view),
                                    edgePadding=8.dp
                                ){
                                    mainTabs.forEach{tab->
                                        Tab(
                                            selected=view==tab,
                                            onClick={view=tab},
                                            text={Text(tab.label)}
                                        )
                                    }
                                }
                            }
                            if(ui.undoLabel!=null){
                                Surface(
                                    color=MaterialTheme.colorScheme.primary.copy(alpha=.12f),
                                    modifier=Modifier.fillMaxWidth()
                                ){
                                    Row(
                                        Modifier.padding(horizontal=12.dp,vertical=7.dp),
                                        verticalAlignment=Alignment.CenterVertically
                                    ){
                                        Text("Podes desfacer: ${ui.undoLabel}",Modifier.weight(1f),style=MaterialTheme.typography.labelMedium)
                                        TextButton(onClick=viewModel::undo){Text("DESFACER")}
                                    }
                                }
                            }
                        }
                    }
                ){padding->
                    Box(Modifier.fillMaxSize().padding(padding)){
                        when{
                            ui.loading->Box(Modifier.fillMaxSize(),contentAlignment=Alignment.Center){CircularProgressIndicator()}
                            else->when(view){
                                AppView.PANEL->DashboardScreen(
                                    ui=ui,
                                    onDebts={view=AppView.DEBTS},
                                    onSnapshot={viewModel.recordSnapshot()},
                                    onGlobalPdf={
                                        viewModel.createGlobalReport{f->if(f!=null)shareFile(context,f,"application/pdf")}
                                    },
                                    onZip={
                                        viewModel.createZip{f->if(f!=null)shareFile(context,f,"application/zip")}
                                    },
                                    onBackup={
                                        viewModel.createBackup{f->if(f!=null)shareFile(context,f,"application/json")}
                                    },
                                    onRestore={plainRestorePicker.launch(arrayOf("application/json","text/plain","*/*"))},
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false}
                                )
                                AppView.TODAY->TodayScreen(
                                    state=ui.core,
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false},
                                    onAddMission=viewModel::addMission,
                                    onToggleMission=viewModel::toggleMission,
                                    onDeleteMission=viewModel::deleteMission
                                )
                                AppView.DEBTS->DebtsScreen(
                                    state=ui.core,
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false},
                                    onAddDebt={showAddDebt=true}
                                )
                                AppView.PLAN->PlanScreen(
                                    state=ui.core,
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false},
                                    onSaveBudget=viewModel::saveBudget,
                                    onSaveFund=viewModel::saveFund,
                                    onSaveNet=viewModel::saveNetWorth
                                )
                                AppView.MORE->MoreScreen{dest->
                                    view=when(dest){
                                        MoreDestination.CALENDAR->AppView.CALENDAR
                                        MoreDestination.CONTROL->AppView.CONTROL
                                        MoreDestination.EVOLUTION->AppView.EVOLUTION
                                        MoreDestination.ARCHIVE->AppView.ARCHIVE
                                        MoreDestination.TRASH->AppView.TRASH
                                        MoreDestination.HEALTH->AppView.HEALTH
                                        MoreDestination.SECURITY->AppView.SECURITY
                                        MoreDestination.INTERNAL_BACKUPS->AppView.INTERNAL
                                    }
                                }
                                AppView.NOTEBOOK->NotebookScreen(
                                    notes=ui.core.generalNotes,
                                    documents=ui.documents,
                                    onOpenNote={noteDraft=it},
                                    onNewNote={
                                        val now=StateCodec.nowIso()
                                        noteDraft=GeneralNote(
                                            id=StateCodec.uid(),
                                            title="",
                                            createdAt=now,
                                            updatedAt=now
                                        )
                                    }
                                )
                                AppView.CALENDAR->CalendarScreen(
                                    state=ui.core,
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false}
                                )
                                AppView.CONTROL->ControlScreen(
                                    state=ui.core,
                                    documents=ui.documents,
                                    onSource={sourceKey=it},
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false}
                                )
                                AppView.EVOLUTION->EvolutionScreen(
                                    state=ui.core,
                                    onMonthlyPdf={month->
                                        viewModel.createMonthlyReport(month){f->if(f!=null)shareFile(context,f,"application/pdf")}
                                    }
                                )
                                AppView.ARCHIVE->ArchiveScreen(
                                    state=ui.core,
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=false}
                                )
                                AppView.TRASH->TrashScreen(
                                    state=ui.core,
                                    onRestore=viewModel::restoreFromTrash,
                                    onDelete=viewModel::deletePermanently,
                                    onDebt={selectedDebtId=it.id;selectedIsTrash=true}
                                )
                                AppView.HEALTH->HealthScreen(
                                    state=ui.core,
                                    documents=ui.documents,
                                    snapshots=ui.internalSnapshots,
                                    onBackup={
                                        viewModel.createBackup{f->if(f!=null)shareFile(context,f,"application/json")}
                                    },
                                    onInternal={view=AppView.INTERNAL}
                                )
                                AppView.SECURITY->SecurityScreen(
                                    security=ui.core.settings.security,
                                    onEncryptedBackup={pass->
                                        viewModel.createEncryptedBackup(pass){f->if(f!=null)shareFile(context,f,"application/octet-stream")}
                                    },
                                    onRestoreEncrypted={
                                        encryptedRestorePicker.launch(arrayOf("application/octet-stream","*/*"))
                                    },
                                    onSetLock={pass,onStart->viewModel.buildLock(pass,onStart)},
                                    onRemoveLock={viewModel.saveSecurity(SecuritySettings())},
                                    onLockNow={locked=true}
                                )
                                AppView.INTERNAL->InternalBackupsScreen(
                                    snapshots=ui.internalSnapshots,
                                    onRestore=viewModel::restoreInternalSnapshot
                                )
                            }
                        }
                        BusyOverlay(ui.busy)
                    }
                }
            }

            ui.message?.let{msg->
                AlertDialog(
                    onDismissRequest=viewModel::clearMessage,
                    title={Text(msg.title)},
                    text={Text(msg.text)},
                    confirmButton={Button(onClick=viewModel::clearMessage){Text("OK")}}
                )
            }

            if(showAddDebt){
                AddDebtDialog(
                    onDismiss={showAddDebt=false},
                    onSave={name,amount,category,type->
                        viewModel.addDebt(name,amount,category,type)
                        showAddDebt=false
                    }
                )
            }

            val selectedDebt=if(selectedIsTrash)
                ui.core.trash.firstOrNull{it.id==selectedDebtId}
            else ui.core.debts.firstOrNull{it.id==selectedDebtId}
            selectedDebt?.let{d->
                DebtDetailDialog(
                    debt=d,
                    documents=ui.documents.filter{it.ownerId==d.id},
                    isTrash=selectedIsTrash,
                    onDismiss={selectedDebtId=null},
                    onSetPaid={viewModel.setPaid(d.id,it)},
                    onEditBase={editBaseId=d.id},
                    onAttachPdf={
                        pendingDocumentOwner=d.id
                        documentPicker.launch(arrayOf("application/pdf"))
                    },
                    onOpenPdf={openDocument(context,it)},
                    onDeletePdf={viewModel.deleteDocument(it.id)},
                    onDossier={
                        viewModel.createDossier(d){f->if(f!=null)shareFile(context,f,"application/pdf")}
                    },
                    onPayment={date,amount,note->viewModel.addPayment(d.id,date,amount,note)},
                    onDeletePayment={viewModel.deletePayment(d.id,it)},
                    onTracking={priority,due,apr,legal,type,next->
                        viewModel.updateTracking(d.id,priority,due,apr,legal,type,next)
                    },
                    onCreditor={viewModel.updateCreditor(d.id,it)},
                    onAgreement={viewModel.updateAgreement(d.id,it)},
                    onDocFlags={viewModel.updateDocFlags(d.id,it)},
                    onInvestigation={viewModel.updateInvestigation(d.id,it)},
                    onNotes={viewModel.updateDebtNotes(d.id,it)},
                    onAddLog={viewModel.addLog(d.id,it)},
                    onDeleteLog={viewModel.deleteLog(d.id,it)},
                    onTrash={
                        viewModel.moveToTrash(d.id)
                        selectedDebtId=null
                    }
                )
            }

            editBaseId?.let{id->
                ui.core.debts.firstOrNull{it.id==id}?.let{d->
                    EditDebtBaseDialog(
                        debt=d,
                        onDismiss={editBaseId=null},
                        onSave={name,amount,category->
                            viewModel.updateDebtBase(d.id,name,amount,category)
                            editBaseId=null
                        }
                    )
                }
            }

            sourceKey?.let{key->
                SourceDialog(
                    key=key,
                    source=ui.core.sources[key]?:SourceControl(),
                    documents=ui.documents.filter{it.ownerId=="GLOBAL:$key"},
                    onDismiss={sourceKey=null},
                    onSave={viewModel.saveSource(key,it);sourceKey=null},
                    onAttach={
                        pendingDocumentOwner="GLOBAL:$key"
                        documentPicker.launch(arrayOf("application/pdf"))
                    },
                    onOpen={openDocument(context,it)},
                    onDelete={viewModel.deleteDocument(it.id)}
                )
            }

            noteDraft?.let{note->
                NoteDialog(
                    note=note,
                    documents=ui.documents.filter{it.ownerId=="NOTE:${note.id}"},
                    onDismiss={noteDraft=null},
                    onSave={viewModel.saveNote(it);noteDraft=null},
                    onAttach={
                        pendingDocumentOwner="NOTE:${note.id}"
                        documentPicker.launch(arrayOf("application/pdf"))
                    },
                    onOpen={openDocument(context,it)},
                    onDeleteDoc={viewModel.deleteDocument(it.id)},
                    onDeleteNote={viewModel.deleteNote(note.id);noteDraft=null}
                )
            }

            if(askEncryptedPassword&&pendingEncryptedUri!=null){
                PasswordPromptDialog(
                    title="RESTAURAR BACKUP CIFRADO",
                    description="Introduce o contrasinal do ficheiro .respawn.",
                    onDismiss={askEncryptedPassword=false;pendingEncryptedUri=null},
                    onConfirm={pass->
                        pendingEncryptedUri?.let{viewModel.importEncrypted(it,pass)}
                        askEncryptedPassword=false
                        pendingEncryptedUri=null
                    }
                )
            }
        }
    }
}
