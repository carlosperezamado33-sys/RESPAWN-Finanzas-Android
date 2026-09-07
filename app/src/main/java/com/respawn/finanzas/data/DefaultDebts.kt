package com.respawn.finanzas.data

data class SeedDebt(
    val name: String,
    val amountCents: Long,
    val category: String,
    val type: String
)

object DefaultDebts {
    val all = listOf(
    SeedDebt("MyCard CaixaBank", 392229L, "Débeda actual", "Tarxeta"),
    SeedDebt("Oney / PCComponentes", 89845L, "Débeda actual", "Financiamento"),
    SeedDebt("iPad", 152468L, "Débeda actual", "Financiamento"),
    SeedDebt("AEAT 9725T", 39467L, "Débeda actual", "AEAT"),
    SeedDebt("AEAT 0146F", 51513L, "Débeda actual", "AEAT"),
    SeedDebt("myKredit", 23000L, "Débeda actual", "Microcrédito"),
    SeedDebt("Dineo", 53533L, "Débeda actual", "Microcrédito"),
    SeedDebt("Prestamato", 14370L, "Débeda actual", "Microcrédito"),
    SeedDebt("Ali / Klarna", 14748L, "Débeda actual", "Financiamento"),
    SeedDebt("Wal / Klarna", 6083L, "Débeda actual", "Financiamento"),
    SeedDebt("Luzo", 40800L, "Débeda actual", "Microcrédito"),
    SeedDebt("MoneyMan", 55840L, "Débeda actual", "Microcrédito"),
    SeedDebt("Loaney", 17540L, "Débeda actual", "Microcrédito"),
    SeedDebt("Prestalight", 37000L, "Débeda actual", "Microcrédito"),
    SeedDebt("Real Crédito", 13000L, "Débeda actual", "Microcrédito"),
    SeedDebt("Ortuño", 16000L, "Débeda actual", "Persoal"),
    SeedDebt("Disco duro Sebas", 5000L, "Débeda actual", "Persoal"),
    SeedDebt("Monedo Now", 249500L, "Débeda actual", "Microcrédito"),
    SeedDebt("TuPréstamoRápido", 20350L, "Débeda antiga", "Microcrédito"),
    SeedDebt("OkMoney", 30000L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Cashper", 36000L, "Débeda antiga", "Microcrédito"),
    SeedDebt("CreditoMas", 39200L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Twinero", 40500L, "Débeda antiga", "Microcrédito"),
    SeedDebt("OnlineCredit", 57722L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Wonga", 59022L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Movistar antigo", 62629L, "Débeda antiga", "Telecom"),
    SeedDebt("Via Conto", 70181L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Kizoo", 78000L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Zaplo", 128522L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Sabadell", 270635L, "Débeda antiga", "Banco"),
    SeedDebt("Santander", 285593L, "Débeda antiga", "Banco"),
    SeedDebt("Préstamo10", 35800L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Contante", 44240L, "Débeda antiga", "Microcrédito"),
    SeedDebt("CréditoCajero", 63344L, "Débeda antiga", "Microcrédito"),
    SeedDebt("QuéBueno", 58433L, "Débeda antiga", "Microcrédito"),
    SeedDebt("Ouro", 103972L, "Recuperacións", "Outro"),
    SeedDebt("Mac", 51200L, "Recuperacións", "Outro"),
    SeedDebt("Filtro Suso", 4990L, "Pendentes", "Persoal"),
    SeedDebt("Álbum de Cris", 3000L, "Pendentes", "Persoal"),
    SeedDebt("Recibo Movistar actual pendente", 4695L, "Pendentes", "Telecom")
    )
}
