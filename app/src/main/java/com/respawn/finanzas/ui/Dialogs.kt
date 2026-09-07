package com.respawn.finanzas.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.respawn.finanzas.data.*

@Composable
fun AddDebtDialog(
    onDismiss:()->Unit,
    onSave:(String,Double,String,String)->Unit
){
    var name by remember{mutableStateOf("")}
    var amount by remember{mutableStateOf("")}
    var category by remember{mutableStateOf("Débeda actual")}
    var type by remember{mutableStateOf("Microcrédito")}
    val parsed=amount.replace(",",".").toDoubleOrNull()
    val short=type in listOf("Microcrédito","Tarxeta","Financiamento")
    AlertDialog(
        onDismissRequest=onDismiss,
        title={Text("NOVA DÉBEDA")},
        text={
            Column(Modifier.verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(9.dp)){
                OutlinedTextField(name,{name=it},label={Text("Nome")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                OutlinedTextField(amount,{amount=it},label={Text("Importe base")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                ChoiceDropdown("Bloque",category,listOf("Débeda actual","Débeda antiga","Recuperacións","Pendentes")){category=it}
                ChoiceDropdown("Tipo",type,listOf("Microcrédito","Tarxeta","Financiamento","AEAT","Persoal","Telecom","Banco","Outro")){type=it}
                if(short) Text("ALERTA DE PATRÓN: esta nova entrada engade crédito curto/financiado ao sistema.",color=MaterialTheme.colorScheme.error,fontSize=11.sp)
            }
        },
        confirmButton={
            Button(
                enabled=name.isNotBlank()&&parsed!=null&&parsed>0,
                onClick={onSave(name,parsed?:0.0,category,type)}
            ){Text(if(short)"ENGADIR IGUALMENTE" else "ENGADIR")}
        },
        dismissButton={TextButton(onClick=onDismiss){Text("CANCELAR")}}
    )
}

@Composable
fun EditDebtBaseDialog(
    debt:Debt,
    onDismiss:()->Unit,
    onSave:(String,Double,String)->Unit
){
    var name by remember(debt.id){mutableStateOf(debt.name)}
    var amount by remember(debt.id){mutableStateOf(debt.amount.toString())}
    var category by remember(debt.id){mutableStateOf(debt.category)}
    val parsed=amount.replace(",",".").toDoubleOrNull()
    val min=FinanceLogic.sumPayments(debt)
    AlertDialog(
        onDismissRequest=onDismiss,
        title={Text("EDITAR DÉBEDA")},
        text={
            Column(Modifier.verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(9.dp)){
                OutlinedTextField(name,{name=it},label={Text("Nome")},modifier=Modifier.fillMaxWidth())
                OutlinedTextField(amount,{amount=it},label={Text("Importe base")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                ChoiceDropdown("Bloque",category,listOf("Débeda actual","Débeda antiga","Recuperacións","Pendentes")){category=it}
                if(parsed!=null&&parsed<min)Text("O importe base non pode ser menor ca os pagos xa rexistrados (${money(min)}).",color=MaterialTheme.colorScheme.error,fontSize=11.sp)
            }
        },
        confirmButton={Button(enabled=name.isNotBlank()&&parsed!=null&&parsed>=min,onClick={onSave(name,parsed?:0.0,category)}){Text("GARDAR")}},
        dismissButton={TextButton(onClick=onDismiss){Text("CANCELAR")}}
    )
}

@Composable
fun DebtDetailDialog(
    debt:Debt,
    documents:List<DocumentRecord>,
    isTrash:Boolean,
    onDismiss:()->Unit,
    onSetPaid:(Boolean)->Unit,
    onEditBase:()->Unit,
    onAttachPdf:()->Unit,
    onOpenPdf:(DocumentRecord)->Unit,
    onDeletePdf:(DocumentRecord)->Unit,
    onDossier:()->Unit,
    onPayment:(String,Double,String)->Unit,
    onDeletePayment:(String)->Unit,
    onTracking:(String,String,Double,String,String,String)->Unit,
    onCreditor:(Creditor)->Unit,
    onAgreement:(Agreement)->Unit,
    onDocFlags:(DocFlags)->Unit,
    onInvestigation:(Investigation)->Unit,
    onNotes:(String)->Unit,
    onAddLog:(String)->Unit,
    onDeleteLog:(String)->Unit,
    onTrash:()->Unit
){
    var payDate by remember(debt.id){mutableStateOf(StateCodec.todayKey())}
    var payAmount by remember(debt.id){mutableStateOf("")}
    var payNote by remember(debt.id){mutableStateOf("")}

    var priority by remember(debt.id){mutableStateOf(debt.priority)}
    var dueDate by remember(debt.id){mutableStateOf(debt.dueDate)}
    var apr by remember(debt.id){mutableStateOf(if(debt.apr==0.0)"" else debt.apr.toString())}
    var legal by remember(debt.id){mutableStateOf(debt.legalStatus)}
    var type by remember(debt.id){mutableStateOf(debt.type)}
    var nextAction by remember(debt.id){mutableStateOf(debt.nextAction)}

    var credName by remember(debt.id){mutableStateOf(debt.creditor.name)}
    var credRef by remember(debt.id){mutableStateOf(debt.creditor.ref)}
    var credPhone by remember(debt.id){mutableStateOf(debt.creditor.phone)}
    var credEmail by remember(debt.id){mutableStateOf(debt.creditor.email)}

    var agrClaimed by remember(debt.id){mutableStateOf(numText(debt.agreement.claimed))}
    var agrOffer by remember(debt.id){mutableStateOf(numText(debt.agreement.offer))}
    var agrSettled by remember(debt.id){mutableStateOf(numText(debt.agreement.settled))}
    var agrStatus by remember(debt.id){mutableStateOf(debt.agreement.status)}
    var agrDeadline by remember(debt.id){mutableStateOf(debt.agreement.deadline)}
    var agrNote by remember(debt.id){mutableStateOf(debt.agreement.note)}

    var contract by remember(debt.id){mutableStateOf(debt.docs.contract)}
    var balance by remember(debt.id){mutableStateOf(debt.docs.balance)}
    var creditorDoc by remember(debt.id){mutableStateOf(debt.docs.creditor)}
    var claims by remember(debt.id){mutableStateOf(debt.docs.claims)}
    var judicialDoc by remember(debt.id){mutableStateOf(debt.docs.judicial)}

    var invLastPayment by remember(debt.id){mutableStateOf(debt.investigation.lastPayment)}
    var invLastClaim by remember(debt.id){mutableStateOf(debt.investigation.lastClaim)}
    var invLastContact by remember(debt.id){mutableStateOf(debt.investigation.lastContact)}
    var invJudicial by remember(debt.id){mutableStateOf(debt.investigation.judicial)}
    var invStatus by remember(debt.id){mutableStateOf(debt.investigation.status)}
    var invNote by remember(debt.id){mutableStateOf(debt.investigation.note)}

    var fixedNotes by remember(debt.id){mutableStateOf(debt.notes)}
    var logText by remember(debt.id){mutableStateOf("")}

    Dialog(
        onDismissRequest=onDismiss,
        properties=DialogProperties(usePlatformDefaultWidth=false)
    ){
        Surface(
            modifier=Modifier.fillMaxSize().padding(8.dp),
            shape=MaterialTheme.shapes.large,
            color=MaterialTheme.colorScheme.background
        ){
            Column(Modifier.fillMaxSize()){
                Row(
                    Modifier.fillMaxWidth().padding(12.dp),
                    verticalAlignment=Alignment.CenterVertically
                ){
                    Column(Modifier.weight(1f)){
                        Text(debt.name,style=MaterialTheme.typography.headlineSmall)
                        Text("${debt.category} · ${debt.type}",fontSize=11.sp)
                    }
                    IconButton(onClick=onDismiss){Icon(Icons.Default.Close,"Pechar")}
                }
                HorizontalDivider()
                Column(
                    Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(12.dp),
                    verticalArrangement=Arrangement.spacedBy(14.dp)
                ){
                    Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                        Kpi("IMPORTE BASE",money(debt.amount),MaterialTheme.colorScheme.primary,Modifier.weight(1f))
                        Kpi("SALDO VIVO",money(FinanceLogic.liveBalance(debt)),MaterialTheme.colorScheme.error,Modifier.weight(1f))
                    }
                    Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                        Kpi("PAGOS REAIS",money(FinanceLogic.sumPayments(debt)),MaterialTheme.colorScheme.secondary,Modifier.weight(1f))
                        Kpi("QUITA / AFORRO",money(FinanceLogic.discountAmount(debt)),MaterialTheme.colorScheme.primary,Modifier.weight(1f))
                    }

                    if(!isTrash){
                        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                            Button(onClick={onSetPaid(!debt.paid)},modifier=Modifier.weight(1f)){
                                Text(if(debt.paid)"REABRIR" else "MARCAR SALDADA")
                            }
                            OutlinedButton(onClick=onEditBase,modifier=Modifier.weight(1f)){Text("EDITAR BASE")}
                        }
                    }
                    Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                        OutlinedButton(onClick=onAttachPdf,modifier=Modifier.weight(1f)){
                            Icon(Icons.Default.AttachFile,null);Spacer(Modifier.width(4.dp));Text("PDF")
                        }
                        OutlinedButton(onClick=onDossier,modifier=Modifier.weight(1f)){
                            Icon(Icons.Default.PictureAsPdf,null);Spacer(Modifier.width(4.dp));Text("DOSSIER")
                        }
                    }

                    DetailSection("DOCUMENTOS ANEXADOS"){
                        DocumentList(documents,onOpenPdf,onDeletePdf)
                        OutlinedButton(onClick=onAttachPdf,modifier=Modifier.fillMaxWidth()){
                            Icon(Icons.Default.Add,null);Spacer(Modifier.width(6.dp));Text("ENGADIR PDF")
                        }
                    }

                    if(!isTrash){
                        DetailSection("PAGO PARCIAL"){
                            OutlinedTextField(payDate,{payDate=it},label={Text("Data YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(payAmount,{payAmount=it},label={Text("Importe €")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(payNote,{payNote=it},label={Text("Nota")},modifier=Modifier.fillMaxWidth())
                            val amount=payAmount.replace(",",".").toDoubleOrNull()
                            Button(
                                enabled=amount!=null&&amount>0,
                                onClick={
                                    onPayment(payDate,amount?:0.0,payNote)
                                    payAmount="";payNote=""
                                },
                                modifier=Modifier.fillMaxWidth()
                            ){Text("+ PAGO")}
                            debt.payments.sortedByDescending{it.date}.forEach{p->
                                Row(verticalAlignment=Alignment.CenterVertically){
                                    Text("${fmtDate(p.date)} · ${money(p.amount)} · ${p.note.ifBlank{"—"}}",Modifier.weight(1f),fontSize=11.sp)
                                    IconButton(onClick={onDeletePayment(p.id)}){Icon(Icons.Default.Delete,"Eliminar",tint=MaterialTheme.colorScheme.error)}
                                }
                            }
                        }

                        DetailSection("SEGUIMENTO / RISCO"){
                            ChoiceDropdown("Prioridade",priority,listOf("Baixa","Normal","Alta","Crítica")){priority=it}
                            OutlinedTextField(dueDate,{dueDate=it},label={Text("Data límite/revisión YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(apr,{apr=it},label={Text("TAE % (se a coñeces)")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            ChoiceDropdown("Estado legal",legal,listOf("Por verificar","Reclamable / activa","Prescrición posible","En acordo","Xudicializada","Saldada")){legal=it}
                            ChoiceDropdown("Tipo",type,listOf("Microcrédito","Tarxeta","Financiamento","AEAT","Persoal","Telecom","Banco","Outro")){type=it}
                            OutlinedTextField(nextAction,{nextAction=it},label={Text("Seguinte paso")},modifier=Modifier.fillMaxWidth())
                            Button(onClick={onTracking(priority,dueDate,apr.replace(",",".").toDoubleOrNull()?:0.0,legal,type,nextAction)},modifier=Modifier.fillMaxWidth()){Text("GARDAR SEGUIMENTO")}
                        }

                        DetailSection("ACREDOR / EXPEDIENTE"){
                            OutlinedTextField(credName,{credName=it},label={Text("Acredor / titular actual")},modifier=Modifier.fillMaxWidth())
                            OutlinedTextField(credRef,{credRef=it},label={Text("Referencia / contrato")},modifier=Modifier.fillMaxWidth())
                            OutlinedTextField(credPhone,{credPhone=it},label={Text("Teléfono")},modifier=Modifier.fillMaxWidth())
                            OutlinedTextField(credEmail,{credEmail=it},label={Text("Email")},modifier=Modifier.fillMaxWidth())
                            Button(onClick={onCreditor(Creditor(credName,credRef,credPhone,credEmail))},modifier=Modifier.fillMaxWidth()){Text("GARDAR ACREDOR")}
                        }

                        DetailSection("ACORDO / NEGOCIACIÓN"){
                            OutlinedTextField(agrClaimed,{agrClaimed=it},label={Text("Importe reclamado")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(agrOffer,{agrOffer=it},label={Text("Oferta recibida")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(agrSettled,{agrSettled=it},label={Text("Importe acordado")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            ChoiceDropdown("Estado",agrStatus,listOf("Sen negociación","Pendente","Oferta recibida","Contraoferta","Aceptado","Rexeitado")){agrStatus=it}
                            OutlinedTextField(agrDeadline,{agrDeadline=it},label={Text("Data límite oferta YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(agrNote,{agrNote=it},label={Text("Nota acordo")},modifier=Modifier.fillMaxWidth())
                            Button(onClick={
                                onAgreement(Agreement(
                                    claimed=agrClaimed.replace(",",".").toDoubleOrNull()?:0.0,
                                    offer=agrOffer.replace(",",".").toDoubleOrNull()?:0.0,
                                    settled=agrSettled.replace(",",".").toDoubleOrNull()?:0.0,
                                    status=agrStatus,deadline=agrDeadline,note=agrNote
                                ))
                            },modifier=Modifier.fillMaxWidth()){Text("GARDAR ACORDO")}
                        }

                        DetailSection("SEMÁFORO DOCUMENTAL"){
                            FlagRow("CONTRATO",contract){contract=it}
                            FlagRow("SALDO ACTUAL",balance){balance=it}
                            FlagRow("TITULAR ACTUAL",creditorDoc){creditorDoc=it}
                            FlagRow("RECLAMACIÓNS",claims){claims=it}
                            FlagRow("XUDICIAL",judicialDoc){judicialDoc=it}
                            Button(onClick={onDocFlags(DocFlags(contract,balance,creditorDoc,claims,judicialDoc))},modifier=Modifier.fillMaxWidth()){Text("GARDAR SEMÁFORO")}
                        }

                        DetailSection("INVESTIGACIÓN / PRESCRICIÓN"){
                            OutlinedTextField(invLastPayment,{invLastPayment=it},label={Text("Último pago coñecido YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(invLastClaim,{invLastClaim=it},label={Text("Última reclamación recibida YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            OutlinedTextField(invLastContact,{invLastContact=it},label={Text("Última comunicación túa YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                            ChoiceDropdown("Xudicial coñecido?",invJudicial,listOf("Descoñecido","Non","Si")){invJudicial=it}
                            ChoiceDropdown("Estado investigación",invStatus,listOf("Non avaliado","Falta información","Revisar","Posible prescrición","Documentación completa")){invStatus=it}
                            OutlinedTextField(invNote,{invNote=it},label={Text("Nota investigación")},modifier=Modifier.fillMaxWidth())
                            Text("Isto organiza datos. Non declara automaticamente prescrita nin reclamable unha débeda.",fontSize=10.sp,color=MaterialTheme.colorScheme.onSurface.copy(alpha=.6f))
                            Button(onClick={onInvestigation(Investigation(invLastPayment,invLastClaim,invLastContact,invJudicial,invStatus,invNote))},modifier=Modifier.fillMaxWidth()){Text("GARDAR INVESTIGACIÓN")}
                        }

                        DetailSection("NOTA FIXA"){
                            OutlinedTextField(fixedNotes,{fixedNotes=it},label={Text("Nota")},modifier=Modifier.fillMaxWidth(),minLines=4)
                            Button(onClick={onNotes(fixedNotes)},modifier=Modifier.fillMaxWidth()){Text("GARDAR NOTA")}
                        }

                        DetailSection("BITÁCORA"){
                            OutlinedTextField(logText,{logText=it},label={Text("Nova anotación")},modifier=Modifier.fillMaxWidth())
                            Button(enabled=logText.isNotBlank(),onClick={onAddLog(logText);logText=""},modifier=Modifier.fillMaxWidth()){Text("+ ENGADIR")}
                            debt.log.sortedByDescending{it.at}.forEach{l->
                                Row(verticalAlignment=Alignment.Top){
                                    Column(Modifier.weight(1f)){
                                        Text(l.at,fontSize=9.sp,color=MaterialTheme.colorScheme.onSurface.copy(alpha=.55f))
                                        Text(l.text,fontSize=11.sp)
                                    }
                                    IconButton(onClick={onDeleteLog(l.id)}){Icon(Icons.Default.Delete,"Eliminar",tint=MaterialTheme.colorScheme.error)}
                                }
                            }
                        }

                        OutlinedButton(onClick=onTrash,modifier=Modifier.fillMaxWidth()){
                            Icon(Icons.Default.DeleteSweep,null,tint=MaterialTheme.colorScheme.error)
                            Spacer(Modifier.width(6.dp))
                            Text("MOVER Á PAPELEIRA",color=MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailSection(title:String,content:@Composable ColumnScope.()->Unit){
    RespawnCard{
        Text(title,style=MaterialTheme.typography.titleMedium,color=MaterialTheme.colorScheme.primary)
        content()
    }
}

@Composable
private fun FlagRow(label:String,value:Boolean,onChange:(Boolean)->Unit){
    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically){
        Checkbox(value,onChange)
        Text(label,fontWeight=FontWeight.SemiBold)
    }
}

private fun numText(v:Double)=if(v==0.0)"" else v.toString()

@Composable
fun SourceDialog(
    key:String,
    source:SourceControl,
    documents:List<DocumentRecord>,
    onDismiss:()->Unit,
    onSave:(SourceControl)->Unit,
    onAttach:()->Unit,
    onOpen:(DocumentRecord)->Unit,
    onDelete:(DocumentRecord)->Unit
){
    var date by remember(key){mutableStateOf(source.date)}
    var status by remember(key){mutableStateOf(source.status)}
    var note by remember(key){mutableStateOf(source.note)}
    AlertDialog(
        onDismissRequest=onDismiss,
        title={Text(key)},
        text={
            Column(Modifier.verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(9.dp)){
                OutlinedTextField(date,{date=it},label={Text("Última comprobación YYYY-MM-DD")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                ChoiceDropdown("Estado",status,listOf("Non comprobado","Sen incidencias","Hai datos","Pendente analizar")){status=it}
                OutlinedTextField(note,{note=it},label={Text("Resumo")},modifier=Modifier.fillMaxWidth(),minLines=2)
                Text("PDF DO INFORME",fontWeight=FontWeight.Bold)
                DocumentList(documents,onOpen,onDelete)
                OutlinedButton(onClick=onAttach,modifier=Modifier.fillMaxWidth()){Text("ENGADIR PDF")}
            }
        },
        confirmButton={Button(onClick={onSave(SourceControl(date,status,note))}){Text("GARDAR")}},
        dismissButton={TextButton(onClick=onDismiss){Text("PECHAR")}}
    )
}

@Composable
fun NoteDialog(
    note:GeneralNote,
    documents:List<DocumentRecord>,
    onDismiss:()->Unit,
    onSave:(GeneralNote)->Unit,
    onAttach:()->Unit,
    onOpen:(DocumentRecord)->Unit,
    onDeleteDoc:(DocumentRecord)->Unit,
    onDeleteNote:()->Unit
){
    var title by remember(note.id){mutableStateOf(note.title)}
    var category by remember(note.id){mutableStateOf(note.category)}
    var tag by remember(note.id){mutableStateOf(note.tag)}
    var body by remember(note.id){mutableStateOf(note.body)}
    var bankName by remember(note.id){mutableStateOf(note.bank.name)}
    var holder by remember(note.id){mutableStateOf(note.bank.holder)}
    var iban by remember(note.id){mutableStateOf(note.bank.iban)}
    var alias by remember(note.id){mutableStateOf(note.bank.alias)}
    var purpose by remember(note.id){mutableStateOf(note.bank.purpose)}
    var archived by remember(note.id){mutableStateOf(note.archived)}

    AlertDialog(
        onDismissRequest=onDismiss,
        title={Text(if(note.title.isBlank())"NOVA FICHA" else note.title)},
        text={
            Column(
                Modifier.verticalScroll(rememberScrollState()).heightIn(max=610.dp),
                verticalArrangement=Arrangement.spacedBy(9.dp)
            ){
                OutlinedTextField(title,{title=it},label={Text("Título")},modifier=Modifier.fillMaxWidth())
                ChoiceDropdown("Categoría",category,listOf("Conta bancaria","Contacto","Trámite","Documento","Referencia","Idea","Nota xeral","Outro")){category=it}
                OutlinedTextField(tag,{tag=it},label={Text("Etiqueta / alias")},modifier=Modifier.fillMaxWidth())
                if(category=="Conta bancaria"){
                    Text("DATOS DA CONTA",fontWeight=FontWeight.Bold)
                    OutlinedTextField(bankName,{bankName=it},label={Text("Banco / entidade")},modifier=Modifier.fillMaxWidth())
                    OutlinedTextField(holder,{holder=it},label={Text("Titular")},modifier=Modifier.fillMaxWidth())
                    OutlinedTextField(iban,{iban=it},label={Text("IBAN / referencia")},modifier=Modifier.fillMaxWidth())
                    OutlinedTextField(alias,{alias=it},label={Text("Alias da conta")},modifier=Modifier.fillMaxWidth())
                    OutlinedTextField(purpose,{purpose=it},label={Text("Uso / finalidade")},modifier=Modifier.fillMaxWidth())
                    Text("Non gardes aquí contrasinais, PIN, CVV, códigos SMS, claves de sinatura nin palabras de recuperación.",fontSize=10.sp,color=MaterialTheme.colorScheme.error)
                }
                Text("CONTIDO",fontWeight=FontWeight.Bold)
                OutlinedTextField(body,{body=it},label={Text("Texto")},modifier=Modifier.fillMaxWidth(),minLines=4)
                Text("DOCUMENTOS PDF",fontWeight=FontWeight.Bold)
                DocumentList(documents,onOpen,onDeleteDoc)
                OutlinedButton(onClick=onAttach,modifier=Modifier.fillMaxWidth()){Text("ENGADIR PDF")}
                Row(verticalAlignment=Alignment.CenterVertically){
                    Checkbox(archived,{archived=it});Text("ARQUIVAR")
                }
                OutlinedButton(onClick=onDeleteNote,modifier=Modifier.fillMaxWidth()){
                    Text("ELIMINAR FICHA",color=MaterialTheme.colorScheme.error)
                }
            }
        },
        confirmButton={
            Button(enabled=title.isNotBlank(),onClick={
                onSave(note.copy(
                    title=title,category=category,tag=tag,body=body,
                    bank=BankInfo(bankName,holder,iban,alias,purpose),
                    archived=archived
                ))
            }){Text("GARDAR FICHA")}
        },
        dismissButton={TextButton(onClick=onDismiss){Text("PECHAR")}}
    )
}

@Composable
fun PasswordPromptDialog(
    title:String,
    description:String,
    onDismiss:()->Unit,
    onConfirm:(String)->Unit
){
    var pass by remember{mutableStateOf("")}
    AlertDialog(
        onDismissRequest=onDismiss,
        title={Text(title)},
        text={
            Column(verticalArrangement=Arrangement.spacedBy(8.dp)){
                Text(description,fontSize=12.sp)
                OutlinedTextField(pass,{pass=it},label={Text("Contrasinal")},singleLine=true,modifier=Modifier.fillMaxWidth())
            }
        },
        confirmButton={Button(enabled=pass.isNotBlank(),onClick={onConfirm(pass)}){Text("CONTINUAR")}},
        dismissButton={TextButton(onClick=onDismiss){Text("CANCELAR")}}
    )
}

@Composable
fun LockScreen(
    onUnlock:(String)->Boolean
){
    var pass by remember{mutableStateOf("")}
    var error by remember{mutableStateOf("")}
    Surface(Modifier.fillMaxSize(),color=MaterialTheme.colorScheme.background){
        Column(
            Modifier.fillMaxSize().padding(28.dp),
            verticalArrangement=Arrangement.Center,
            horizontalAlignment=Alignment.CenterHorizontally
        ){
            Icon(Icons.Default.Lock,null,Modifier.size(58.dp),tint=MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(18.dp))
            Text("RESPAWN // BLOQUEADO",style=MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(14.dp))
            OutlinedTextField(pass,{pass=it;error=""},label={Text("Contrasinal")},singleLine=true,modifier=Modifier.fillMaxWidth())
            if(error.isNotBlank())Text(error,color=MaterialTheme.colorScheme.error,fontSize=11.sp)
            Spacer(Modifier.height(10.dp))
            Button(
                enabled=pass.isNotBlank(),
                onClick={
                    if(onUnlock(pass)){pass=""}else error="Contrasinal incorrecto."
                },
                modifier=Modifier.fillMaxWidth()
            ){Text("DESBLOQUEAR")}
        }
    }
}
