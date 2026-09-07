package com.respawn.finanzas.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.respawn.finanzas.data.DocumentRecord
import com.respawn.finanzas.data.GeneralNote

@Composable
fun NotebookScreen(
    notes: List<GeneralNote>,
    documents: List<DocumentRecord>,
    onOpenNote: (GeneralNote) -> Unit,
    onNewNote: () -> Unit
) {
    var category by remember { mutableStateOf("Todas as categorías") }
    val categories = listOf(
        "Todas as categorías","Conta bancaria","Contacto","Trámite",
        "Documento","Referencia","Idea","Nota xeral","Outro"
    )
    val filtered = remember(notes, category) {
        notes.filter { category == "Todas as categorías" || it.category == category }
            .sortedWith(compareBy<GeneralNote> { it.archived }.thenByDescending { it.updatedAt })
    }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            SectionTitle(
                "CADERNO / INFO XERAL",
                "Información útil que non pertence a unha débeda concreta: bancos, trámites, persoas, referencias, ideas, documentación ou notas libres."
            )
        }
        item {
            RespawnCard {
                ChoiceDropdown("Categoría", category, categories) { category = it }
                Button(onClick = onNewNote, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Add, null)
                    Spacer(Modifier.width(8.dp))
                    Text("NOVA FICHA")
                }
            }
        }

        if (filtered.isEmpty()) {
            item { Text("Aínda non hai fichas nesta categoría.") }
        } else {
            items(filtered, key = { it.id }) { n ->
                val count = documents.count { it.ownerId == "NOTE:${n.id}" }
                RespawnCard(onClick = { onOpenNote(n) }) {
                    Row(verticalAlignment = Alignment.Top) {
                        Column(Modifier.weight(1f)) {
                            Text(
                                "${n.category}${if(n.tag.isNotBlank()) " · ${n.tag}" else ""}${if(n.archived) " · ARQUIVADA" else ""}",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(n.title.ifBlank { "Sen título" }, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            val preview = if (n.category == "Conta bancaria") {
                                listOf(
                                    n.bank.name,n.bank.holder,n.bank.alias,n.bank.purpose,n.body
                                ).filter { it.isNotBlank() }.joinToString("\n")
                            } else n.body
                            Text(
                                preview.ifBlank { "Sen contido" },
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha=.65f)
                            )
                            Spacer(Modifier.height(5.dp))
                            Text("${n.updatedAt.take(10)} · $count PDF", fontSize = 10.sp)
                        }
                        Icon(Icons.Default.Description, null, tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }

        item {
            SectionTitle("PARA QUE USALO")
        }
        item {
            RespawnCard {
                NotebookUse("01","CONTAS BANCARIAS","Banco, titular, alias, IBAN ou referencia útil. Sen contrasinais, PIN nin CVV.")
                HorizontalDivider()
                NotebookUse("02","TRÁMITES / XESTIÓNS","Números de expediente, teléfonos, datas, oficinas, documentos pendentes ou pasos a seguir.")
                HorizontalDivider()
                NotebookUse("03","NOTAS XERAIS","Calquera cousa que queiras ter localizada dentro de RESPAWN sen crear unha débeda ficticia.")
                HorizontalDivider()
                NotebookUse("04","ARQUIVO","Cada ficha pode levar documentos PDF e queda incluída nos backups completos e cifrados.")
            }
        }
        item {
            RespawnCard {
                Text(
                    "SEGURIDADE · Non uses este caderno como xestor de contrasinais. Non gardes contrasinais de banca, PIN de tarxetas, CVV, códigos de recuperación nin claves de sinatura.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
private fun NotebookUse(num:String,title:String,desc:String){
    Row(verticalAlignment=Alignment.Top){
        Text(num,fontWeight=FontWeight.Black,color=MaterialTheme.colorScheme.primary)
        Spacer(Modifier.width(10.dp))
        Column{
            Text(title,fontWeight=FontWeight.Bold)
            Text(desc,fontSize=11.sp,color=MaterialTheme.colorScheme.onSurface.copy(alpha=.65f))
        }
    }
}
