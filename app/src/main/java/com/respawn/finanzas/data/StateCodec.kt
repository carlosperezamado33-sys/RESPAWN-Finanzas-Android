package com.respawn.finanzas.data

import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

object StateCodec {
    private fun JSONObject.s(key: String, fallback: String = ""): String =
        optString(key, fallback).takeIf { it != "null" } ?: fallback

    private fun JSONObject.d(key: String, fallback: Double = 0.0): Double =
        if (has(key)) optDouble(key, fallback) else fallback

    private fun JSONArray.objects(): List<JSONObject> =
        (0 until length()).mapNotNull { optJSONObject(it) }

    fun encode(state: CoreState): String = toJson(state).toString()

    fun decode(text: String): CoreState = fromJson(JSONObject(text))

    fun toJson(state: CoreState): JSONObject = JSONObject().apply {
        put("app", state.app)
        put("version", state.version)
        put("createdAt", nowIso())
        put("debts", JSONArray(state.debts.map(::debtToJson)))
        put("trash", JSONArray(state.trash.map(::debtToJson)))
        put("history", JSONArray(state.history.map(::historyToJson)))
        put("settings", settingsToJson(state.settings))
        put("generalNotes", JSONArray(state.generalNotes.map(::noteToJson)))
        put("manualMissions", JSONArray(state.manualMissions.map(::missionToJson)))
        put("sources", JSONObject().apply {
            defaultSources().keys.forEach { key ->
                val src = state.sources[key] ?: SourceControl()
                put(key, sourceToJson(src))
            }
        })
        put("networthHistory", JSONArray(state.networthHistory.map(::netWorthToJson)))
    }

    fun fromJson(root: JSONObject): CoreState {
        require(root.optString("app", "RESPAWN_DEBEDAS") == "RESPAWN_DEBEDAS") {
            "Formato RESPAWN non compatible."
        }
        val debts = (root.optJSONArray("debts") ?: JSONArray()).objects().map(::debtFromJson)
        val trash = (root.optJSONArray("trash") ?: JSONArray()).objects().map(::debtFromJson)
        val history = (root.optJSONArray("history") ?: JSONArray()).objects().map(::historyFromJson)
            .sortedBy { it.at }
        val notes = (root.optJSONArray("generalNotes") ?: JSONArray()).objects().map(::noteFromJson)
        val missions = (root.optJSONArray("manualMissions") ?: JSONArray()).objects().map(::missionFromJson)
        val nw = (root.optJSONArray("networthHistory") ?: JSONArray()).objects().map(::netWorthFromJson)
            .sortedBy { it.date }

        val srcRoot = root.optJSONObject("sources") ?: JSONObject()
        val sources = defaultSources().keys.associateWith { key ->
            sourceFromJson(srcRoot.optJSONObject(key) ?: JSONObject())
        }

        return CoreState(
            app = "RESPAWN_DEBEDAS",
            version = root.optInt("version", 17),
            debts = debts,
            trash = trash,
            history = history,
            settings = settingsFromJson(root.optJSONObject("settings") ?: JSONObject()),
            generalNotes = notes,
            manualMissions = missions,
            sources = sources,
            networthHistory = nw
        )
    }

    private fun debtToJson(d: Debt): JSONObject = JSONObject().apply {
        put("id", d.id)
        put("name", d.name)
        put("amount", d.amount)
        put("category", d.category)
        put("type", d.type)
        put("paid", d.paid)
        put("createdAt", d.createdAt)
        put("updatedAt", d.updatedAt)
        put("closedAt", d.closedAt)
        put("notes", d.notes)
        put("priority", d.priority)
        put("dueDate", d.dueDate)
        put("apr", d.apr)
        put("nextAction", d.nextAction)
        put("legalStatus", d.legalStatus)
        put("creditor", JSONObject().apply {
            put("name", d.creditor.name)
            put("ref", d.creditor.ref)
            put("phone", d.creditor.phone)
            put("email", d.creditor.email)
        })
        put("agreement", JSONObject().apply {
            put("claimed", d.agreement.claimed)
            put("offer", d.agreement.offer)
            put("settled", d.agreement.settled)
            put("status", d.agreement.status)
            put("deadline", d.agreement.deadline)
            put("note", d.agreement.note)
        })
        put("docs", JSONObject().apply {
            put("contract", d.docs.contract)
            put("balance", d.docs.balance)
            put("creditor", d.docs.creditor)
            put("claims", d.docs.claims)
            put("judicial", d.docs.judicial)
        })
        put("investigation", JSONObject().apply {
            put("lastPayment", d.investigation.lastPayment)
            put("lastClaim", d.investigation.lastClaim)
            put("lastContact", d.investigation.lastContact)
            put("judicial", d.investigation.judicial)
            put("status", d.investigation.status)
            put("note", d.investigation.note)
        })
        put("payments", JSONArray(d.payments.map { p ->
            JSONObject().apply {
                put("id", p.id)
                put("date", p.date)
                put("amount", p.amount)
                put("note", p.note)
                put("createdAt", p.createdAt)
            }
        }))
        put("log", JSONArray(d.log.map { l ->
            JSONObject().apply {
                put("id", l.id)
                put("at", l.at)
                put("text", l.text)
            }
        }))
        if (d.trashedAt.isNotBlank()) put("trashedAt", d.trashedAt)
    }

    private fun debtFromJson(o: JSONObject): Debt {
        val paid = o.optBoolean("paid", false)
        val created = o.s("createdAt").ifBlank { nowIso() }
        val cred = o.optJSONObject("creditor") ?: JSONObject()
        val agr = o.optJSONObject("agreement") ?: JSONObject()
        val docs = o.optJSONObject("docs") ?: JSONObject()
        val inv = o.optJSONObject("investigation") ?: JSONObject()
        val payments = (o.optJSONArray("payments") ?: JSONArray()).objects().map { p ->
            Payment(
                id = p.s("id").ifBlank { uid() },
                date = p.s("date"),
                amount = p.d("amount"),
                note = p.s("note"),
                createdAt = p.s("createdAt")
            )
        }
        val logs = (o.optJSONArray("log") ?: JSONArray()).objects().map { l ->
            LogEntry(
                id = l.s("id").ifBlank { uid() },
                at = l.s("at").ifBlank { nowIso() },
                text = l.s("text")
            )
        }

        return Debt(
            id = o.s("id").ifBlank { uid() },
            name = o.s("name", "Sen nome"),
            amount = o.d("amount"),
            category = o.s("category", "Débeda actual"),
            type = o.s("type", "Outro"),
            paid = paid,
            createdAt = created,
            updatedAt = o.s("updatedAt").ifBlank { created },
            closedAt = o.s("closedAt"),
            notes = o.s("notes"),
            priority = o.s("priority", "Normal"),
            dueDate = o.s("dueDate"),
            apr = o.d("apr"),
            nextAction = o.s("nextAction"),
            legalStatus = o.s("legalStatus", if (paid) "Saldada" else "Por verificar"),
            creditor = Creditor(
                name = cred.s("name"),
                ref = cred.s("ref"),
                phone = cred.s("phone"),
                email = cred.s("email")
            ),
            agreement = Agreement(
                claimed = agr.d("claimed"),
                offer = agr.d("offer"),
                settled = agr.d("settled"),
                status = agr.s("status", "Sen negociación"),
                deadline = agr.s("deadline"),
                note = agr.s("note")
            ),
            docs = DocFlags(
                contract = docs.optBoolean("contract", false),
                balance = docs.optBoolean("balance", false),
                creditor = docs.optBoolean("creditor", false),
                claims = docs.optBoolean("claims", false),
                judicial = docs.optBoolean("judicial", false)
            ),
            investigation = Investigation(
                lastPayment = inv.s("lastPayment"),
                lastClaim = inv.s("lastClaim"),
                lastContact = inv.s("lastContact"),
                judicial = inv.s("judicial", "Descoñecido"),
                status = inv.s("status", "Non avaliado"),
                note = inv.s("note")
            ),
            payments = payments,
            log = logs,
            trashedAt = o.s("trashedAt")
        )
    }

    private fun historyToJson(h: HistoryEntry) = JSONObject().apply {
        put("date", h.date)
        put("live", h.live)
        put("total", h.total)
        put("resolved", h.resolved)
        put("reason", h.reason)
        put("at", h.at)
    }

    private fun historyFromJson(o: JSONObject): HistoryEntry {
        val total = o.d("total")
        val live = if (o.has("live")) o.d("live") else o.d("remaining")
        val date = o.s("date").ifBlank { todayKey() }
        return HistoryEntry(
            date = date,
            live = live,
            total = total,
            resolved = if (o.has("resolved")) o.d("resolved") else (total - live).coerceAtLeast(0.0),
            reason = o.s("reason"),
            at = o.s("at").ifBlank { "${date}T12:00:00" }
        )
    }

    private fun settingsToJson(s: AppSettings) = JSONObject().apply {
        put("budget", JSONObject().apply {
            put("income", s.budget.income)
            put("essentials", s.budget.essentials)
            put("safety", s.budget.safety)
            put("debt", s.budget.debt)
        })
        put("fund", JSONObject().apply {
            put("current", s.fund.current)
            put("target", s.fund.target)
        })
        put("net", JSONObject().apply {
            put("assets", s.net.assets)
            put("other", s.net.other)
        })
        put("baselineDate", s.baselineDate)
        put("baselineTotal", s.baselineTotal)
        put("_dirtySinceBackup", s.dirtySinceBackup)
        put("_lastBackupAt", s.lastBackupAt)
        put("_lastChangeAt", s.lastChangeAt)
        put("theme", s.theme)
        put("security", JSONObject().apply {
            put("lockEnabled", s.security.lockEnabled)
            put("lockOnStart", s.security.lockOnStart)
            put("lockSalt", s.security.lockSalt)
            put("lockHash", s.security.lockHash)
        })
    }

    private fun settingsFromJson(o: JSONObject): AppSettings {
        val budget = o.optJSONObject("budget") ?: JSONObject()
        val fund = o.optJSONObject("fund") ?: JSONObject()
        val net = o.optJSONObject("net") ?: JSONObject()
        val sec = o.optJSONObject("security") ?: JSONObject()
        return AppSettings(
            budget = BudgetSettings(
                income = budget.d("income", 2850.0),
                essentials = budget.d("essentials", 2057.44),
                safety = budget.d("safety", 200.0),
                debt = budget.d("debt", 500.0)
            ),
            fund = FundSettings(
                current = fund.d("current", 0.0),
                target = fund.d("target", 500.0)
            ),
            net = NetSettings(
                assets = net.d("assets", 215.0),
                other = net.d("other", 0.0)
            ),
            baselineDate = o.s("baselineDate", "2026-08-13"),
            baselineTotal = o.d("baselineTotal", 28199.64),
            dirtySinceBackup = if (o.has("_dirtySinceBackup")) o.optBoolean("_dirtySinceBackup") else true,
            lastBackupAt = o.s("_lastBackupAt"),
            lastChangeAt = o.s("_lastChangeAt"),
            theme = o.s("theme", "obsidian"),
            security = SecuritySettings(
                lockEnabled = sec.optBoolean("lockEnabled", false),
                lockOnStart = sec.optBoolean("lockOnStart", false),
                lockSalt = sec.s("lockSalt"),
                lockHash = sec.s("lockHash")
            )
        )
    }

    private fun missionToJson(m: ManualMission) = JSONObject().apply {
        put("id", m.id)
        put("text", m.text)
        put("date", m.date)
        put("priority", m.priority)
        put("done", m.done)
    }

    private fun missionFromJson(o: JSONObject) = ManualMission(
        id = o.s("id").ifBlank { uid() },
        text = o.s("text"),
        date = o.s("date").ifBlank { todayKey() },
        priority = o.s("priority", "Normal"),
        done = o.optBoolean("done", false)
    )

    private fun sourceToJson(s: SourceControl) = JSONObject().apply {
        put("date", s.date)
        put("status", s.status)
        put("note", s.note)
    }

    private fun sourceFromJson(o: JSONObject) = SourceControl(
        date = o.s("date"),
        status = o.s("status", "Non comprobado"),
        note = o.s("note")
    )

    private fun noteToJson(n: GeneralNote) = JSONObject().apply {
        put("id", n.id)
        put("title", n.title)
        put("category", n.category)
        put("tag", n.tag)
        put("body", n.body)
        put("bank", JSONObject().apply {
            put("name", n.bank.name)
            put("holder", n.bank.holder)
            put("iban", n.bank.iban)
            put("alias", n.bank.alias)
            put("purpose", n.bank.purpose)
        })
        put("archived", n.archived)
        put("createdAt", n.createdAt)
        put("updatedAt", n.updatedAt)
    }

    private fun noteFromJson(o: JSONObject): GeneralNote {
        val b = o.optJSONObject("bank") ?: JSONObject()
        val created = o.s("createdAt").ifBlank { nowIso() }
        return GeneralNote(
            id = o.s("id").ifBlank { uid() },
            title = o.s("title"),
            category = o.s("category", "Nota xeral"),
            tag = o.s("tag"),
            body = o.s("body"),
            bank = BankInfo(
                name = b.s("name"),
                holder = b.s("holder"),
                iban = b.s("iban"),
                alias = b.s("alias"),
                purpose = b.s("purpose")
            ),
            archived = o.optBoolean("archived", false),
            createdAt = created,
            updatedAt = o.s("updatedAt").ifBlank { created }
        )
    }

    private fun netWorthToJson(n: NetWorthEntry) = JSONObject().apply {
        put("date", n.date)
        put("assets", n.assets)
        put("debt", n.debt)
        put("net", n.net)
    }

    private fun netWorthFromJson(o: JSONObject) = NetWorthEntry(
        date = o.s("date").ifBlank { todayKey() },
        assets = o.d("assets"),
        debt = o.d("debt"),
        net = o.d("net")
    )

    fun uid(): String = UUID.randomUUID().toString()
    fun nowIso(): String = java.time.Instant.now().toString()
    fun todayKey(): String = java.time.LocalDate.now().toString()
}
