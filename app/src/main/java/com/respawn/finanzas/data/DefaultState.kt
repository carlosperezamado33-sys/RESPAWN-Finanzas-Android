package com.respawn.finanzas.data

object DefaultState {
    private data class Row(val name: String, val amount: Double, val category: String, val type: String)

    private val rows = listOf(
        Row("MyCard CaixaBank",3922.29,"Débeda actual","Tarxeta"),
        Row("Oney / PCComponentes",898.45,"Débeda actual","Financiamento"),
        Row("iPad",1524.68,"Débeda actual","Financiamento"),
        Row("AEAT 9725T",394.67,"Débeda actual","AEAT"),
        Row("AEAT 0146F",515.13,"Débeda actual","AEAT"),
        Row("myKredit",230.0,"Débeda actual","Microcrédito"),
        Row("Dineo",535.33,"Débeda actual","Microcrédito"),
        Row("Prestamato",143.70,"Débeda actual","Microcrédito"),
        Row("Ali / Klarna",147.48,"Débeda actual","Financiamento"),
        Row("Wal / Klarna",60.83,"Débeda actual","Financiamento"),
        Row("Luzo",408.0,"Débeda actual","Microcrédito"),
        Row("MoneyMan",558.40,"Débeda actual","Microcrédito"),
        Row("Loaney",175.40,"Débeda actual","Microcrédito"),
        Row("Prestalight",370.0,"Débeda actual","Microcrédito"),
        Row("Real Crédito",130.0,"Débeda actual","Microcrédito"),
        Row("Ortuño",160.0,"Débeda actual","Persoal"),
        Row("Disco duro Sebas",50.0,"Débeda actual","Persoal"),
        Row("Monedo Now",2495.0,"Débeda actual","Microcrédito"),
        Row("TuPréstamoRápido",203.50,"Débeda antiga","Microcrédito"),
        Row("OkMoney",300.0,"Débeda antiga","Microcrédito"),
        Row("Cashper",360.0,"Débeda antiga","Microcrédito"),
        Row("CreditoMas",392.0,"Débeda antiga","Microcrédito"),
        Row("Twinero",405.0,"Débeda antiga","Microcrédito"),
        Row("OnlineCredit",577.22,"Débeda antiga","Microcrédito"),
        Row("Wonga",590.22,"Débeda antiga","Microcrédito"),
        Row("Movistar antigo",626.29,"Débeda antiga","Telecom"),
        Row("Via Conto",701.81,"Débeda antiga","Microcrédito"),
        Row("Kizoo",780.0,"Débeda antiga","Microcrédito"),
        Row("Zaplo",1285.22,"Débeda antiga","Microcrédito"),
        Row("Sabadell",2706.35,"Débeda antiga","Banco"),
        Row("Santander",2855.93,"Débeda antiga","Banco"),
        Row("Préstamo10",358.0,"Débeda antiga","Microcrédito"),
        Row("Contante",442.40,"Débeda antiga","Microcrédito"),
        Row("CréditoCajero",633.44,"Débeda antiga","Microcrédito"),
        Row("QuéBueno",584.33,"Débeda antiga","Microcrédito"),
        Row("Ouro",1039.72,"Recuperacións","Outro"),
        Row("Mac",512.0,"Recuperacións","Outro"),
        Row("Filtro Suso",49.90,"Pendentes","Persoal"),
        Row("Álbum de Cris",30.0,"Pendentes","Persoal"),
        Row("Recibo Movistar actual pendente",46.95,"Pendentes","Telecom")
    )

    fun create(): CoreState {
        val now = StateCodec.nowIso()
        return CoreState(
            debts = rows.map { r ->
                Debt(
                    id = StateCodec.uid(),
                    name = r.name,
                    amount = r.amount,
                    category = r.category,
                    type = r.type,
                    paid = false,
                    createdAt = now,
                    updatedAt = now
                )
            }
        )
    }
}
