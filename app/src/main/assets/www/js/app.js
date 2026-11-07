(() => {
  "use strict";
  const VERSION = "10.2.0",
    STORAGE = "MAUSOLEO_PUNTO_CERO_V710_PC",
    OLD_STORAGE = "MAUSOLEO_PUNTO_CERO_V79_PC";
  const $ = (s) => document.querySelector(s),
    $$ = (s) => Array.from(document.querySelectorAll(s));
  const pad = (x) => String(x).padStart(2, "0");
  const localToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const addDays = (s, n) => {
    const d = new Date(`${s}T12:00:00`);
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const fmtDate = (s) => {
    if (!s) return "Sen data";
    const a = s.split("-");
    return a.length === 3 ? `${a[2]}/${a[1]}/${a[0]}` : s;
  };
  const fmt = (n) => {
    const a = Math.abs(n);
    return (
      (n < 0 ? "−" : "") + String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + pad(a % 100) + " €"
    );
  };
  const parseEuro = (v) => {
    let s = String(v).trim().replace(/\s/g, "").replace(/€/g, "");
    if (!/^-?(?:\d{1,9}|\d{1,3}(?:\.\d{3}){1,3})(?:,\d{1,2})?$/.test(s) && !/^-?\d{1,9}\.\d{1,2}$/.test(s))
      throw new Error("Introduce un importe válido. Exemplo: 123,45 ou 1.234,56");
    const neg = s.startsWith("-");
    if (neg) s = s.slice(1);
    if (s.includes(",")) s = s.replaceAll(".", "").replace(",", ".");
    else if (/^\d{1,9}(?:\.\d{1,2})?$/.test(s)) {
    } else s = s.replaceAll(".", "");
    const [whole, frac = ""] = s.split(".");
    return (neg ? -1 : 1) * (Number(whole) * 100 + Number((frac + "00").slice(0, 2)));
  };
  const fromCents = (n) => (n / 100).toFixed(2).replace(".", ",");
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const id = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `pc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const CURRENT_SEED = [
    {
      id: "A01",
      name: "AEAT · IRPF 2022",
      amountCents: 33603,
      owner: "Carlos",
      kind: "AEAT",
      confidence: "documental",
      notes: "Liquidación exportada 04/11/2026; pode coincidir con fraccionamento. Non duplicar cotas.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A02",
      name: "AEAT · IRPF 2021",
      amountCents: 29003,
      owner: "Carlos",
      kind: "AEAT",
      confidence: "documental",
      notes: "Liquidación exportada 04/11/2026; posible fraccionamento. Verificar sede.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A03",
      name: "AEAT · devolución 2022",
      amountCents: 10111,
      owner: "Carlos",
      kind: "AEAT",
      confidence: "documental",
      notes: "Pendencia administrativa ao corte. Comprobar sede.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A04",
      name: "AEAT · ingreso non realizado 2021",
      amountCents: 8179,
      owner: "Carlos",
      kind: "AEAT",
      confidence: "documental",
      notes: "Pendencia administrativa ao corte. Comprobar sede.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A05",
      name: "Monedo Now",
      amountCents: 249500,
      owner: "Carlos",
      kind: "Microcrédito",
      confidence: "declarado",
      notes: "Saldo da app persoal 31/10/2026, sen certificado contractual.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A06",
      name: "iPad",
      amountCents: 149623,
      owner: "Carlos",
      kind: "Financiamento",
      confidence: "declarado",
      notes: "Saldo declarado na app, non confirmado ao día de hoxe.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A07",
      name: "Dineo",
      amountCents: 77999,
      owner: "Carlos",
      kind: "Microcrédito",
      confidence: "declarado",
      notes: "Saldo declarado, non certificado.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A08",
      name: "Oney / PCComponentes",
      amountCents: 64175,
      owner: "Carlos",
      kind: "Financiamento",
      confidence: "declarado",
      notes: "Saldo declarado na app; confirmar cota e prazo.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A09",
      name: "Luzo",
      amountCents: 53925,
      owner: "Carlos",
      kind: "Microcrédito",
      confidence: "declarado",
      notes: "Contrato 300 € principal / 408 € a devolver; 539,25 € é anotación sen desglose.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A10",
      name: "Prestalight",
      amountCents: 44750,
      owner: "Carlos",
      kind: "Microcrédito",
      confidence: "declarado",
      notes: "447,50 € histórico da app, distinto das comunicacións de 370 € / 359,13 €. Non sumar.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A11",
      name: "Hucha",
      amountCents: 33500,
      owner: "Por confirmar",
      kind: "Outra",
      confidence: "declarado",
      notes: "Apunte da app; comprobar se é realmente débeda ou reserva persoal.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A12",
      name: "Gardar coche",
      amountCents: 10000,
      owner: "Por confirmar",
      kind: "Outra",
      confidence: "declarado",
      notes: "Apunte da app; comprobar natureza e titular, posible parecido co coche declarado.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A13",
      name: "Préstamo CaixaBank",
      amountCents: 1236205,
      owner: "Katy",
      kind: "Préstamo",
      confidence: "documental",
      notes:
        "Contrato CaixaBank: capital inicial 10.000 €, xuros previstos 2.362,05 €, total contractual 12.362,05 €; primeira fracción 56,12 € o 01/11/2026 e 42 cotas de referencia de 293 € do 01/12/2026 ao 01/05/2030. A suma aritmética das cotas redondeadas supera o total contractual en 0,07 €: axuste final de simulación, verificar recibo real. Este é o total do plan de pagamentos, NON o capital vivo nin unha certificación de saldo actual. Contrato 15/10/2026: principal inicial 10.000 €, prazo 42 mensualidades ata 01/05/2030; TIN fixo 12,05 %, TAE 12,74 %, xuros contractuais previstos 2.362,05 €, apertura 0 €. Primeira fracción 56,12 € e cotas posteriores 293,00 € a partir do 01/12/2026. O importe base da ficha é CAPITAL INICIAL, NON saldo vivo certificado; non engadir os xuros futuros ao saldo actual. Seguro VidaCaixa asociado: primeira prima 1,09 €; posteriores 2,02 €, gasto periódico separado.",
      status: "por_verificar",
      checkedAt: "2026-10-01",
      due: "",
      sourceDate: "2026-10-15",
      attachments: [],
      principalCents: 1000000,
      interestCents: 236205,
      feesCents: 0,
    },
    {
      id: "A14",
      name: "MyCard · crédito utilizado",
      amountCents: 195341,
      owner: "Katy",
      kind: "Tarxeta",
      confidence: "captura",
      notes:
        "Captura MyCard 05/11/2026: límite 4.000,00 €, dispoñible 2.046,59 €, utilizado por diferenza 1.953,41 €. Saldo calculado do crédito utilizado, NON saldo certificado de liquidación. Os cargos individuais do calendario poden estar xa incluídos nesta cifra; NON sumalos outra vez ao saldo da tarxeta. Servicash 910 € prev. 01/12/2026: consultar comisión exacta e forma de cargo.",
      status: "por_verificar",
      checkedAt: "2026-11-05",
      due: "",
      sourceDate: "2026-11-05",
      attachments: [],
    },
    {
      id: "A15",
      name: "El Corte Inglés · tarxeta",
      amountCents: 18900,
      owner: "Por confirmar",
      kind: "Tarxeta",
      confidence: "declarado",
      notes: "189 € comunicados 04/11/2026; vencemento por verificar.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A16",
      name: "Coche",
      amountCents: 10000,
      owner: "Por confirmar",
      kind: "Outra",
      confidence: "declarado",
      notes: "100 € comunicados 04/11/2026; non fusionar con Gardar coche sen proba.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A17",
      name: "imagin",
      amountCents: 10000,
      owner: "Por confirmar",
      kind: "Outra",
      confidence: "declarado",
      notes: "100 € comunicados 04/11/2026.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A18",
      name: "Klarna",
      amountCents: 800,
      owner: "Por confirmar",
      kind: "Financiamento",
      confidence: "declarado",
      notes: "8 € comunicados 04/11/2026.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A19",
      name: "Jazztel · Lenovo",
      amountCents: 77000,
      owner: "Por confirmar",
      kind: "Financiamento",
      confidence: "captura",
      notes: "Captura de financiamento de dispositivo. Titular non comprobado.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A20",
      name: "Jazztel · Sony",
      amountCents: 40000,
      owner: "Por confirmar",
      kind: "Financiamento",
      confidence: "captura",
      notes: "Captura de financiamento de dispositivo. Titular non comprobado.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
    {
      id: "A21",
      name: "Jazztel · aspirador",
      amountCents: 16000,
      owner: "Por confirmar",
      kind: "Financiamento",
      confidence: "captura",
      notes: "Captura de financiamento de dispositivo. Titular non comprobado.",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      sourceDate: "2026-11-04",
      attachments: [],
    },
  ];
  const V75_EVENTS = [
    {
      id: "v75-salario-katy-2026-11-30",
      name: "Nómina Katy · prevista",
      date: "2026-11-30",
      type: "entrada",
      amount: 162770,
      owner: "Katy",
      trust: "declarado",
      group: "nomina",
      done: false,
      accountSource: "caixabank",
      note: "Previsión, NON ingreso confirmado. Referencia: transferencias recorrentes 1.627,70 € (varios meses 2026) no extracto CaixaBank; última de xullo 1.627,50 €. Revisar importe cando ingrese.",
    },
    {
      id: "v75-salario-carlos-2026-11-30",
      name: "Nómina Carlos · estimación",
      date: "2026-11-30",
      type: "entrada",
      amount: 120000,
      owner: "Carlos",
      trust: "declarado",
      group: "nomina",
      done: false,
      accountSource: "caixabank",
      note: "Estimación achegada polo usuario (~1.200 €). Destino previsto: CaixaBank/imagin de Katy segundo a indicación do 05/11/2026. Non representa un ingreso efectivo ata que se reciba.",
    },
    {
      id: "v75-extra-carlos-2026-12-17",
      name: "Paga extra Nadal Carlos · referencia xullo",
      date: "2026-12-17",
      type: "entrada",
      amount: 120224,
      owner: "Carlos",
      trust: "declarado",
      group: "nomina",
      done: false,
      accountSource: "caixabank",
      note: "Proxección co NETO documentado na nómina extraordinaria xullo 2026: 1.202,24 €. Nadal 2026 aínda non acreditado. Destino previsto: CaixaBank/imagin de Katy segundo a indicación do 05/11/2026. Importante: a extra segue sendo unha estimación baseada en xullo.",
    },
  ];
  const V74_ACCOUNT = {
    id: "v74-katy-imagin-2026-11-05",
    name: "CaixaBank / imagin · Katy",
    owner: "Katy",
    role: "principal",
    amount: 151,
    date: "2026-11-05",
    trust: "declarado",
    note: "Saldo dispoñible declarado o 05/11/2026. Cotitularidade prevista, aínda sen confirmar. Saldo bancario, NON crédito MyCard.",
  };
  const V74_EVENTS = [
    {
      id: "v74-mycard-2026-11-07",
      name: "MyCard · cargos previstos",
      date: "2026-11-07",
      type: "saida",
      amount: 12338,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-08",
      name: "MyCard · cargos previstos",
      date: "2026-11-08",
      type: "saida",
      amount: 4747,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-09",
      name: "MyCard · cargos previstos",
      date: "2026-11-09",
      type: "saida",
      amount: 15711,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-10",
      name: "MyCard · cargos previstos",
      date: "2026-11-10",
      type: "saida",
      amount: 17055,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-11",
      name: "MyCard · cargos previstos",
      date: "2026-11-11",
      type: "saida",
      amount: 5348,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-12",
      name: "MyCard · cargos previstos",
      date: "2026-11-12",
      type: "saida",
      amount: 15645,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-13",
      name: "MyCard · cargos previstos",
      date: "2026-11-13",
      type: "saida",
      amount: 8760,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-11-14",
      name: "MyCard · cargos previstos",
      date: "2026-11-14",
      type: "saida",
      amount: 6494,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-mycard-2026-12-01",
      name: "MyCard · cargos previstos (Servicash)",
      date: "2026-12-01",
      type: "saida",
      amount: 91000,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Captura MyCard 05/11/2026: data prevista de cargo. Este movemento é CAIXA, non débeda nova. Non rexistrar tamén cada compra da tarxeta nin duplicar nun recibo global. Verificar cargo real, especialmente Servicash e posibles comisións.",
    },
    {
      id: "v74-loan-2026-12-01",
      name: "Préstamo CaixaBank · cota",
      date: "2026-12-01",
      type: "saida",
      amount: 29300,
      owner: "Katy",
      trust: "acreditado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Contrato préstamo 15/10/2026: 42 cotas mixtas 293 € desde 01/12/2026. Esta é unha saída prevista; NON incrementar por ela a débeda base de 10.000 €.",
    },
    {
      id: "v74-insurance-2026-12-01",
      name: "VidaCaixa · seguro préstamo",
      date: "2026-12-01",
      type: "saida",
      amount: 202,
      owner: "Katy",
      trust: "declarado",
      group: "financeiro",
      done: false,
      accountSource: "caixabank",
      note: "Póliza seguro préstamo 15/10/2026: importes posteriores 2,02 €. Data concreta da domiciliación pendente de contrastar; 01/12 utilízase provisionalmente para planificación. É gasto, non débeda adicional.",
    },
  ];
  const defaultTasks = () => [
    {
      id: id(),
      title: "Comprobar na Sede da AEAT os vencementos do 05/11 e os pagamentos anteriores",
      note: "A auditoría anterior indicaba vencementos para esta data; non supoñer impago sen comprobar o estado actual.",
      done: false,
    },
    {
      id: id(),
      title: "Confirmar o próximo cargo de MyCard e o seu importe real",
      note: "Consultar saldo, data, modalidade e se o cargo xa está incluído no saldo actual.",
      done: false,
    },
    {
      id: id(),
      title: "Anotar o saldo de CaixaBank de Katy e os pagamentos obrigatorios dos próximos 30 días",
      note: "Separar saldo actual, cobros futuros e pagos futuros. Sen contar dúas veces importes xa pagados.",
      done: false,
    },
  ];
  const MORAL_SEED = [
    {
      id: "MP-SEED-01",
      name: "Arincón / Arin",
      amountCents: 10000,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Arin e Tania: 100 € conxuntos, valoración orientativa para un posible detalle ou peche persoal. Tania ten ficha separada SEN importe para evitar dobre cómputo. Non hai obriga confirmada.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-02",
      name: "Tania",
      amountCents: null,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Vinculada ao conxunto Arin/Tania, cuxos 100 € orientativos figuran só na ficha de Arin. Non sumar de novo. Confirmar se hai algo que resolver.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-03",
      name: "Eva",
      amountCents: 15000,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Eva e Santi: referencia orientativa conxunta de 150 € (un rexistro anterior indicaba 100 €). O importe vai só nesta ficha para non duplicalo co de Santi. Non consta débeda acreditada.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-04",
      name: "Santi",
      amountCents: null,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Vinculado ao conxunto Eva/Santi: os 150 € orientativos figuran só na ficha de Eva. Non sumar de novo. Revisar se require unha acción.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-05",
      name: "Xan",
      amountCents: 15000,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Referencia orientativa histórica de 150 €. Verificar se corresponde a detalle, favor ou compensación voluntaria; non asumir obriga legal.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-06",
      name: "Sara",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-07",
      name: "Morán",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-08",
      name: "Verea",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-09",
      name: "Sebas",
      amountCents: 17000,
      owner: "Carlos",
      kind: "Devolución de ben",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Dúas referencias históricas persoais: día con Sebas 120 € e disco duro 50 €. Suma orientativa 170 €. Non confundir con crédito financeiro. Verificar se procede compensación ou devolución do ben.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-10",
      name: "Cris Repolo",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-11",
      name: "Madriña",
      amountCents: 15000,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes: "Detalle/compromiso persoal antigo: 150 € orientativos. Non consta importe esixible.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-12",
      name: "Pablete",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-13",
      name: "Maite Repolo",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-14",
      name: "Benito",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-15",
      name: "Bea Cancela",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-16",
      name: "Faco",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-17",
      name: "Cato",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-18",
      name: "Xane",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-19",
      name: "Manuel Soutullo",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-20",
      name: "Balsa",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-21",
      name: "Rubo",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-22",
      name: "Diego Otero",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-23",
      name: "Adur",
      amountCents: 12000,
      owner: "Carlos",
      kind: "Devolución de ben",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Nintendo 64 e dous mandos: valoración histórica orientativa 120 €. Priorizar devolución do ben ou acordo, non supoñer pagamento en efectivo.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-24",
      name: "Jhonny León",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-25",
      name: "Taxi David",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-26",
      name: "Taxi Ríos",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-27",
      name: "Anxo",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-28",
      name: "Juan e familia",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-29",
      name: "Marcos Lebrero",
      amountCents: null,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Inventario persoal RESPAWN 17/09/2026. Non se rexistrou importe fiable; revisar se procede algunha conversa, detalle, favor, compensación ou arquivo.",
      sourceDate: "2026-09-17",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "sen_importe",
    },
    {
      id: "MP-SEED-30",
      name: "Francis e señora",
      amountCents: 20000,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Referencia de 200 € orientativos para resolver ou agradecer situación persoal; segundo nota previa non é necesariamente débeda real.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-31",
      name: "Félix",
      amountCents: 12000,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes: "Referencia orientativa 120 € por revisar: pode ser favor ou detalle, non saldo certificado.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-32",
      name: "Tipo Luckia Rial",
      amountCents: 10000,
      owner: "Carlos",
      kind: "Compromiso persoal",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes: "Referencia histórica 100 € por revisar; non inferir contrato nin obrigación financeira.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-33",
      name: "Arzúa",
      amountCents: 20000,
      owner: "Carlos",
      kind: "Detalle",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes: "Detalles Arzúa: 200 € orientativos, non obrigación certificada.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-34",
      name: "Ortuño",
      amountCents: 16000,
      owner: "Carlos",
      kind: "Devolución de ben",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Nintendo 64, Smash Bros. e Mario 64: valoración histórica 160 €. Compromiso persoal/devolución en especie, NON débeda comercial.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
    {
      id: "MP-SEED-35",
      name: "Pensión 2018",
      amountCents: 150000,
      owner: "Carlos",
      kind: "Cartos pendentes",
      confidence: "declarado",
      status: "por_verificar",
      checkedAt: "",
      due: "",
      notes:
        "Referencia histórica a pensión do ano 2018: 1.500 €. Natureza, persoas e eventual pago pendentes de aclarar. NON concluír que existe débeda actual esixible.",
      sourceDate: "2026-08-12",
      principalCents: null,
      interestCents: null,
      feesCents: null,
      payments: [],
      attachments: [],
      reviewed: false,
      amountBasis: "orientativo",
    },
  ];
  function moralCopy(x) {
    return { ...x, attachments: [], payments: [] };
  }
  let data = {
    version: VERSION,
    createdAt: localToday(),
    accounts: [{ ...V74_ACCOUNT }],
    events: [...V74_EVENTS, ...V75_EVENTS].map((x) => ({ ...x })),
    tasks: defaultTasks(),
    includeDeclared: true,
    debtReviews: {},
    currentDebts: CURRENT_SEED.map((x) => ({ ...x })),
    moralDebts: MORAL_SEED.map(moralCopy),
    loanContractApplied: true,
    v75IncomeApplied: true,
  };
  let bridgeGap = null;
  let saveLocal = Boolean(window.MausoleoAndroid && typeof window.MausoleoAndroid.saveFile === "function"),
    showAmounts = true,
    activeTab = "inicio",
    dirty = false;
  let v97StorageError = "",
    v97LastSaved = "",
    v97LastRollback = null,
    v97LastWritten = "";
  try {
    const current = localStorage.getItem(STORAGE);
    const old =
      current ??
      localStorage.getItem(OLD_STORAGE) ??
      localStorage.getItem("MAUSOLEO_PUNTO_CERO_V75") ??
      localStorage.getItem("MAUSOLEO_PUNTO_CERO_V74") ??
      localStorage.getItem("MAUSOLEO_PUNTO_CERO_V73") ??
      localStorage.getItem("MAUSOLEO_PUNTO_CERO_V6") ??
      localStorage.getItem("MAUSOLEO_PUNTO_CERO_V2");
    if (old !== null) {
      const p = JSON.parse(old);
      if (!validate(p)) throw new Error("Rexistros locais incompatibles: non se sobrescribirán");
      data = { ...p, version: VERSION };
      data.debtReviews = data.debtReviews || {};
      data.currentDebts = Array.isArray(p.currentDebts) ? p.currentDebts : CURRENT_SEED.map((x) => ({ ...x }));
      saveLocal = saveLocal || Boolean(current !== null || localStorage.getItem(OLD_STORAGE) !== null);
    } else if (current !== null) {
      throw new Error("Rexistro baleiro inesperado");
    }
  } catch (e) {
    v97StorageError = "Lectura inicial fallida: " + e.message;
    saveLocal = false;
    console.warn(v97StorageError);
  }

  // V7.4: migración conservadora. Non sobrescribe saldos rexistrados, pagamentos nin fichas editadas.
  function upgradeV74() {
    if (typeof data.includeDeclared !== "boolean") data.includeDeclared = true;
    if (!Array.isArray(data.accounts)) data.accounts = [];
    if (!Array.isArray(data.events)) data.events = [];
    if (!Array.isArray(data.currentDebts)) data.currentDebts = CURRENT_SEED.map((x) => ({ ...x }));
    if (!data.accounts.some((x) => accountRole(x) === "principal")) data.accounts.push({ ...V74_ACCOUNT });
    for (const e of V74_EVENTS) {
      if ((data.suppressedSeedEventIds || []).includes(e.id)) continue;
      if (data.events.some((x) => x.id === e.id)) continue;
      if (
        data.events.some(
          (x) =>
            x.date === e.date &&
            x.type === e.type &&
            x.amount === e.amount &&
            String(x.name || "")
              .toLowerCase()
              .includes(String(e.name).toLowerCase().slice(0, 10)),
        )
      )
        continue;
      data.events.push({ ...e });
    }
    for (const k of ["A13", "A14"]) {
      const upd = CURRENT_SEED.find((x) => x.id === k),
        prev = data.currentDebts.find((x) => x.id === k);
      if (!prev) {
        data.currentDebts.push({ ...upd });
        continue;
      }
      if (
        k === "A14" &&
        prev.amountCents === 191252 &&
        String(prev.sourceDate || "") <= "2026-11-04" &&
        !(prev.payments || []).length &&
        !(prev.attachments || []).length
      ) {
        Object.assign(prev, {
          name: upd.name,
          amountCents: upd.amountCents,
          confidence: upd.confidence,
          notes: upd.notes,
          sourceDate: upd.sourceDate,
          checkedAt: upd.checkedAt,
        });
      }
      if (
        k === "A13" &&
        prev.amountCents === 1000000 &&
        !(prev.payments || []).length &&
        !(prev.attachments || []).length &&
        String(prev.notes || "").startsWith("Principal inicial 10.000")
      ) {
        Object.assign(prev, {
          notes: upd.notes,
          principalCents: upd.principalCents,
          checkedAt: upd.checkedAt,
          sourceDate: upd.sourceDate,
        });
      }
    }
  }

  /* V7.5: actualización de ingresos e referencia contractual, preservando calquera edición persoal. */
  function upgradeV75() {
    if (!Array.isArray(data.events)) data.events = [];
    if (!data.v75IncomeApplied) {
      for (const ev of V75_EVENTS) {
        if (data.events.some((x) => x.id === ev.id)) continue;
        // Nunca engadir un duplicado da mesma nómina / extra cando xa hai un movemento equivalente.
        if (
          data.events.some(
            (x) =>
              x.date === ev.date &&
              x.type === "entrada" &&
              x.owner === ev.owner &&
              Math.abs(x.amount - ev.amount) < 51 &&
              /(n[oó]mina|extra)/i.test(x.name || ""),
          )
        )
          continue;
        data.events.push({ ...ev });
      }
      data.v75IncomeApplied = true;
    }
    if (!data.loanContractApplied) {
      const x = (data.currentDebts || []).find((x) => x.id === "A13");
      if (x && x.amountCents === 1000000) {
        x.amountCents = 1236205;
        x.principalCents = 1000000;
        x.interestCents = 236205;
        x.feesCents = 0;
        x.confidence = "documental";
        x.checkedAt = "2026-10-01";
        x.notes = (
          "PLAN CONTRACTUAL TOTAL 12.362,05 € (principal 10.000 € + xuros futuros 2.362,05 €). Axuste técnico de 0,07 € na última cota por redondeo; comprobar coa entidade. " +
          String(x.notes || "")
        ).slice(0, 4000);
      }
      data.loanContractApplied = true;
    }
  }

  /* V7.5.1: os ingresos futuros sen destino confirmado pasan á previsión de CaixaBank.
   Non alterar importes, datas, ingresos xa cobrados nin outros movementos asignados expresamente a ABANCA. */
  function upgradeV751() {
    if (!Array.isArray(data.events)) return;
    for (const ev of data.events) {
      if (ev.type !== "entrada" || ev.done || !ev.date || ev.date < "2026-11-05") continue;
      if (["por_confirmar", "outro", "", null, undefined].includes(ev.accountSource)) {
        ev.accountSource = "caixabank";
        if (["v75-salario-carlos-2026-11-30", "v75-extra-carlos-2026-12-17"].includes(ev.id)) {
          ev.note = (
            String(ev.note || "")
              .replace(/Destino bancario por confirmar:[^.]*\./g, "")
              .replace(/Destino da conta por confirmar\./g, "")
              .trim() + " Destino previsto CaixaBank/imagin desde o 05/11/2026; ingreso non realizado."
          ).trim();
        }
      }
    }
  }

  // V7.12: mes do orzamento separado da data bancaria. Só os salarios
  // identificados do 30/11/26 son atribuídos por defecto a decembro.
  // Non modificar datas, saldos, estados, contas, importes nin asignacións previas explícitas.
  function budgetMonthFor(date, name, type) {
    const d = String(date || "");
    if (type === "entrada" && /^\d{4}-\d{2}-(2[5-9]|3[01])$/.test(d) && /n[oó]mina|salario/i.test(String(name || "")))
      return shiftMonth(d.slice(0, 7), 1);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.slice(0, 7) : localToday().slice(0, 7);
  }
  function upgradeV712() {
    if (!Array.isArray(data.events)) return;
    for (const ev of data.events) {
      if (ev.id === "v75-salario-katy-2026-11-30" || ev.id === "v75-salario-carlos-2026-11-30") {
        if (!ev.budgetMonth) ev.budgetMonth = "2026-12";
      }
    }
  }
  upgradeV74();
  upgradeV75();
  upgradeV751();
  upgradeV712();
  if (!Array.isArray(data.moralDebts)) data.moralDebts = MORAL_SEED.map(moralCopy);
  if (saveLocal && !v97StorageError) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE, serialized);
      v97LastWritten = serialized;
      v97LastSaved = new Date().toISOString();
    } catch (e) {
      v97StorageError = "A migración segue sen gardarse: " + e.message;
      saveLocal = false;
      console.warn(v97StorageError);
    }
  }
  function validate(p) {
    return (
      p &&
      typeof p === "object" &&
      Array.isArray(p.accounts) &&
      Array.isArray(p.events) &&
      Array.isArray(p.tasks) &&
      p.accounts.length <= 100 &&
      p.events.length <= 10000 &&
      p.tasks.length <= 1000 &&
      (!p.debtReviews ||
        (typeof p.debtReviews === "object" &&
          !Array.isArray(p.debtReviews) &&
          Object.keys(p.debtReviews).length <= 50)) &&
      (!p.currentDebts || (Array.isArray(p.currentDebts) && p.currentDebts.length <= 300)) &&
      (!p.moralDebts || (Array.isArray(p.moralDebts) && p.moralDebts.length <= 300))
    );
  }
  /* V9.7: setItem é atómico. XAMAIS eliminar a copia existente cando falle unha escritura.
   O gardado local segue na mesma chave da V9.6 para conservar as actualizacións. */
  function persist() {
    if (!saveLocal) return false;
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE, serialized);
      v97LastWritten = serialized;
      v97LastSaved = new Date().toISOString();
      v97StorageError = "";
      queueV97Snapshot(serialized);
      return true;
    } catch (e) {
      saveLocal = false;
      v97StorageError = "Non se puido gardar: " + e.message;
      console.error("MAUSOLEO: copia local anterior mantida sen tocar", e);
      alert(
        "ERRO DE GARDADO: a copia antiga NON foi borrada. Os cambios actuais están só en memoria. Exporta unha copia externa agora e non peches a páxina antes de facelo.",
      );
      updateV97Status();
      return false;
    }
  }
  function setData() {
    dirty = true;
    const ok = persist();
    render();
    updateV97Status();
    return ok;
  }

  /* V9.7: segundo punto de recuperación (IndexedDB) cando está dispoñible.
   É local ao perfil e NON substitúe unha copia externa ZIP/JSON. */
  let v97SnapshotQueue = Promise.resolve();
  function v97OpenDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("IndexedDB non dispoñible"));
      const req = indexedDB.open("MAUSOLEO_V97_RECOVERY", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("versions")) req.result.createObjectStore("versions");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB bloqueado"));
    });
  }
  async function v97ReadSnapshot(which = "current") {
    const db = await v97OpenDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("versions", "readonly"),
        req = tx.objectStore("versions").get(which);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }
  function v97WriteSnapshot(json) {
    return v97OpenDB().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction("versions", "readwrite"),
            store = tx.objectStore("versions");
          const get = store.get("current");
          get.onsuccess = () => {
            if (get.result?.json !== json) {
              if (get.result) store.put(get.result, "previous");
              store.put({ json, savedAt: new Date().toISOString(), fingerprint: v97Fingerprint(json) }, "current");
            }
          };
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error || new Error("Erro de escritura do historial"));
          };
          tx.onabort = () => {
            db.close();
            reject(tx.error || new Error("Copia interrompida"));
          };
        }),
    );
  }
  function queueV97Snapshot(json) {
    v97SnapshotQueue = v97SnapshotQueue.catch(() => {}).then(() => v97WriteSnapshot(json));
    v97SnapshotQueue.catch((e) => {
      console.warn("Non se puido actualizar a recuperación IndexedDB", e);
      updateV97Status();
    });
    return v97SnapshotQueue;
  }
  function v97Fingerprint(txt) {
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) {
      h ^= txt.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }
  function v97UniqueIds(rows, label) {
    const seen = new Set();
    for (const item of rows) {
      if (!item || typeof item !== "object" || typeof item.id !== "string" || !item.id.trim())
        throw new Error(label + ": rexistro sen ID válido");
      if (seen.has(item.id)) throw new Error(label + ": ID duplicado: " + item.id);
      seen.add(item.id);
    }
  }
  function v97CheckBackup(p) {
    if (!validate(p)) throw new Error("Estrutura incompleta ou dimensións non admitidas");
    for (const [key, label] of [
      ["accounts", "Saldos"],
      ["events", "Movementos"],
      ["tasks", "Tarefas"],
    ])
      v97UniqueIds(p[key], label);
    if (Array.isArray(p.currentDebts)) v97UniqueIds(p.currentDebts, "Débedas actuais");
    if (Array.isArray(p.moralDebts)) v97UniqueIds(p.moralDebts, "Compromisos persoais");
    if (p.moralDebts && safeMoralDebts(p.moralDebts).length !== p.moralDebts.length)
      throw new Error("Hai fichas de compromisos incompatibles nesta copia");
    if (p.moralDebts)
      for (const [i, x] of p.moralDebts.entries()) {
        if ((x.attachments || []).length !== (safeMoralDebts([x])[0]?.attachments || []).length)
          throw new Error("Anexos incompatibles no compromiso " + i);
      }
    for (const e of p.events) {
      if (
        !Number.isSafeInteger(e.amount) ||
        e.amount <= 0 ||
        !/^(19|20)\d{2}-\d{2}-\d{2}$/.test(e.date) ||
        !validTrust(e.trust) ||
        !["entrada", "saida"].includes(e.type)
      )
        throw new Error("Hai movementos inválidos");
    }
    for (const a of p.accounts) {
      if (!Number.isSafeInteger(a.amount) || !validTrust(a.trust)) throw new Error("Hai saldos inválidos");
    }
    // O importador histórico sanitiza algunhas fichas. Rexeitar se iso implicaría perda silenciosa.
    if (p.currentDebts && safeCurrentDebts(p.currentDebts).length !== p.currentDebts.length)
      throw new Error("Algunha débeda actual perderíase na importación");
    if (p.debtReviews && Object.keys(safeDebtReviews(p.debtReviews)).length !== Object.keys(p.debtReviews).length)
      throw new Error("A copia inclúe fichas que esta versión non coñece; non se importou nada");
    if (p.debtReviews) {
      const cleaned = safeDebtReviews(p.debtReviews);
      for (const [key, r] of Object.entries(p.debtReviews)) {
        if ((r.attachments || []).length !== (cleaned[key]?.attachments || []).length)
          throw new Error("Hai anexos incompatibles na ficha " + key + "; non se importou nada");
      }
    }
    if (p.currentDebts) {
      const cleaned = safeCurrentDebts(p.currentDebts);
      for (let i = 0; i < p.currentDebts.length; i++) {
        if ((p.currentDebts[i].attachments || []).length !== (cleaned[i]?.attachments || []).length)
          throw new Error("Hai anexos incompatibles na débeda " + p.currentDebts[i].id);
      }
    }
    if (p.v10 !== undefined) v10CheckModel(p);
    return true;
  }
  function updateV97Status() {
    const el = document.getElementById("v97StorageStatus");
    if (!el) return;
    const state = v97StorageError
      ? "Erro de gardado"
      : !saveLocal
        ? "Pausado / gardado externo necesario"
        : "Gardado local activo";
    el.textContent =
      state +
      (v97LastSaved ? " · " + new Date(v97LastSaved).toLocaleString("gl-ES") : "") +
      (v97StorageError ? " · " + v97StorageError : "");
    el.dataset.state = v97StorageError ? "error" : saveLocal ? "ok" : "idle";
  }
  async function v97Verify() {
    const out = document.getElementById("v97VerifyResult");
    if (!out) return;
    try {
      const raw = JSON.stringify(data);
      v97CheckBackup(data);
      const local = localStorage.getItem(STORAGE);
      const matches = local !== null && local === raw;
      let snap = null;
      try {
        await v97SnapshotQueue.catch(() => {});
        snap = await v97ReadSnapshot();
      } catch (_) {}
      const snapshotOK = !!snap && JSON.parse(snap.json) && validate(JSON.parse(snap.json));
      out.textContent = `Datos en memoria: válidos (${data.accounts.length} saldos, ${data.events.length} movementos, ${data.tasks.length} tarefas). Copia local: ${local === null ? "non existe" : matches ? "idéntica" : "distinta da sesión actual"}. Recuperación secundaria: ${snapshotOK ? "dispoñible" : "non dispoñible"}.`;
    } catch (e) {
      out.textContent = "ATENCIÓN: " + e.message;
    }
  }
  async function v97RestoreSnapshot(which) {
    const o = await v97ReadSnapshot(which);
    if (!o) throw new Error("Non hai copia automática " + which);
    const p = JSON.parse(o.json);
    v97CheckBackup(p);
    if (
      !confirm(
        `Recuperar a copia ${which === "previous" ? "anterior" : "máis recente"} do ${new Date(o.savedAt).toLocaleString("gl-ES")}? Substituirá a sesión actual, que se conservará temporalmente para desfacer.`,
      )
    )
      return;
    v97LastRollback = JSON.parse(JSON.stringify(data));
    data = { ...p, version: VERSION };
    if (!Array.isArray(data.moralDebts)) data.moralDebts = MORAL_SEED.map(moralCopy);
    upgradeV74();
    upgradeV75();
    upgradeV751();
    upgradeV712();
    setData();
    document.getElementById("v97UndoRestore").disabled = false;
    alert("Recuperación aplicada á sesión. Verifica saldos e movementos e exporta unha copia externa.");
  }

  function validTrust(v) {
    return ["acreditado", "declarado", "pendente"].includes(v);
  }
  function effective(x) {
    return x.trust === "acreditado" || (data.includeDeclared && x.trust === "declarado");
  }
  function inRange(s) {
    return s >= localToday() && s <= addDays(localToday(), 30);
  }
  function activeEvents() {
    return data.events.filter((x) => !x.done && inRange(x.date));
  }
  function includedEvents() {
    return activeEvents().filter(effective);
  }
  function accountRole(x) {
    if (x.role === "principal" || x.role === "auxiliar") return x.role;
    const n = String(x.name || "").toLowerCase();
    if (n.includes("abanca")) return "auxiliar";
    if (n.includes("caixabank") || n.includes("caixa bank")) return "principal";
    return "auxiliar";
  }
  function mainAccounts() {
    return data.accounts.filter((x) => accountRole(x) === "principal");
  }
  function balanceKnown() {
    return mainAccounts().some(effective);
  }
  function balance() {
    return mainAccounts()
      .filter(effective)
      .reduce((a, x) => a + x.amount, 0);
  }
  function income() {
    return includedEvents()
      .filter((x) => x.type === "entrada")
      .reduce((a, x) => a + x.amount, 0);
  }
  function expense() {
    return includedEvents()
      .filter((x) => x.type === "saida")
      .reduce((a, x) => a + x.amount, 0);
  }
  function bankEvents() {
    return includedEvents().filter((x) => x.accountSource === "caixabank");
  }
  function bankIncome() {
    return bankEvents()
      .filter((x) => x.type === "entrada")
      .reduce((a, x) => a + x.amount, 0);
  }
  function bankExpense() {
    return bankEvents()
      .filter((x) => x.type === "saida")
      .reduce((a, x) => a + x.amount, 0);
  }
  function forecast() {
    return balance() + bankIncome() - bankExpense();
  }
  const money = (v, known = true) => (known ? fmt(v) : "Pendente");
  const badge = (t) =>
    `<span class="pill ${t === "acreditado" ? "verified" : t === "declarado" ? "declared" : t === "feito" ? "paid" : "pending"}">${t === "acreditado" ? "Acreditado" : t === "declarado" ? "Declarado" : t === "feito" ? "Feito" : "Pendente"}</span>`;
  function render() {
    const has = balanceKnown();
    $("#calIn").textContent = money(income(), true);
    $("#calOut").textContent = money(expense(), true);
    $("#calFinal").textContent = money(forecast(), has);
    $("#includeDeclared").checked = !!data.includeDeclared;
    $("#saveLocal").checked = saveLocal;
    $("#storagePill").textContent = saveLocal ? "Activado" : "Desactivado";
    $("#storagePill").className = "pill " + (saveLocal ? "verified" : "pending");
    let warning = "";
    const notcounted = activeEvents().filter((x) => !effective(x));
    if (has) {
      let run = balance();
      let negativeDate = "";
      for (const ev of bankEvents().sort((a, b) => a.date.localeCompare(b.date))) {
        run += (ev.type === "entrada" ? 1 : -1) * ev.amount;
        if (run < 0 && !negativeDate) negativeDate = ev.date;
      }
      if (negativeDate) {
        warning = `<div class="note critical"><strong>Revisar liquidez prevista para o ${esc(fmtDate(negativeDate))}.</strong> A simulación pode quedar negativa nesa data; comproba datas e saldos antes de decidir un pago.</div>`;
      } else {
        warning = `<div class="note"><strong>Previsión sen saldo negativo detectado</strong> nos rexistros incluídos. Isto non garante que estean anotados todos os gastos.</div>`;
      }
    } else
      warning =
        '<div class="note warn"><strong>Primeiro paso:</strong> anota o saldo real de CaixaBank de Katy. Ata entón non calcularemos unha marxe de seguridade.</div>';
    if (notcounted.length)
      warning += `<div class="note warn">Hai ${notcounted.length} movemento(s) sen incluír na previsión por falta de confirmación ou polo filtro de declarados.</div>`;
    const noBank = activeEvents().filter((x) => effective(x) && x.accountSource !== "caixabank");
    if (noBank.length)
      warning += `<div class="note warn">Hai ${noBank.length} movemento(s) de ABANCA ou sen conta identificada que se ven na axenda do fogar, pero non se restan da previsión de CaixaBank. Se se financian desde CaixaBank, rexistra a transferencia real sen duplicar gastos.</div>`;
    $("#riskBanner").innerHTML = warning;
    const next = activeEvents()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
    $("#upcoming").innerHTML = next.length
      ? next.map((x) => eventItem(x)).join("")
      : '<div class="blank">Aínda non hai cobros ou pagamentos futuros. Comeza por engadir os imprescindibles.</div>';
    renderIncomePlan60();
    const pending = data.tasks.filter((x) => !x.done);
    $("#homeTasks").innerHTML = pending.length
      ? pending
          .slice(0, 3)
          .map((x) => taskItem(x))
          .join("")
      : '<div class="blank">As tres próximas actuacións están completadas.</div>';
    $("#allTasks").innerHTML =
      [...pending, ...data.tasks.filter((x) => x.done)].map((x) => taskItem(x, true)).join("") ||
      '<div class="blank">Non hai tarefas</div>';
    const arr = activeEvents().sort((a, b) => a.date.localeCompare(b.date));
    $("#calendarCoverage").textContent = `${arr.length} movementos non completados`;
    if (!arr.length)
      $("#calendarRows").innerHTML =
        '<div class="blank">Introduce os próximos cobros e pagamentos para crear o calendario.</div>';
    else {
      const groups = {};
      arr.forEach((x) => (groups[x.date] ??= []).push(x));
      $("#calendarRows").innerHTML = Object.entries(groups)
        .map(
          ([d, l]) =>
            `<div class="day"><div class="daydate">${esc(fmtDate(d))}</div><div>${l.map(eventItem).join("")}</div></div>`,
        )
        .join("");
    }
    $("#dataAccounts").innerHTML = data.accounts.length
      ? data.accounts
          .slice()
          .sort((a, b) => (accountRole(a) === "principal" ? 0 : 1) - (accountRole(b) === "principal" ? 0 : 1))
          .map((x) => accountItem(x, true))
          .join("")
      : '<div class="blank">Non se rexistraron saldos.</div>';
    const q = $("#searchRecords").value.trim().toLocaleLowerCase("gl");
    const filtered = data.events
      .filter((x) => [x.name, x.owner, x.note].join(" ").toLocaleLowerCase("gl").includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
    $("#eventCount").textContent = `${filtered.length} rexistros`;
    $("#dataEvents").innerHTML = filtered.length
      ? filtered
          .map(
            (x) =>
              `<tr><td>${esc(fmtDate(x.date))}</td><td class="wrap">${esc(x.name)}</td><td>${esc(x.owner)}<small style="display:block">${esc(bankLabel(x))}</small></td><td>${x.type === "entrada" ? "Cobro" : "Pagamento"}</td><td class="secret">${esc(fmt(x.amount))}</td><td>${eventBadge(x)}</td><td>${x.done ? badge("feito") : "Previsto"}</td><td><div class="actionset"><button class="btn sm" data-edit-event="${esc(x.id)}">Editar</button><button class="btn sm" data-toggle-event="${esc(x.id)}">${x.done ? "Desfacer" : "Feito"}</button><button class="btn sm danger" data-delete-event="${esc(x.id)}">×</button></div></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="8" class="blank">Sen rexistros que mostrar</td></tr>';
    $("#appRoot").classList.toggle("hideamount", !showAmounts);
    document.body.classList.toggle("hideamount", !showAmounts);
    $$(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === activeTab));
    renderDebts();
    renderCurrentDebts();
  }

  function renderIncomePlan60() {
    const holder = $("#incomePlan60");
    if (!holder) return;
    const horizon = addDays(localToday(), 65);
    const arr = data.events
      .filter((x) => x.type === "entrada" && !x.done && x.date >= localToday() && x.date <= horizon)
      .sort((a, b) => a.date.localeCompare(b.date) || a.owner.localeCompare(b.owner));
    holder.innerHTML = arr.length
      ? arr
          .map(
            (x) =>
              `<article class="income-plan-item"><span class="when">${esc(fmtDate(x.date))}</span><div class="what">${esc(x.name)}</div><div class="caption">${esc(x.accountSource === "caixabank" ? "Destino: CaixaBank · previsión" : "Destino por confirmar · fóra do cálculo CaixaBank")}</div><strong class="secret">${esc(fmt(x.amount))}</strong></article>`,
          )
          .join("")
      : '<p class="read-note">Non hai cobros previstos nos próximos 65 días.</p>';
  }

  function bankLabel(x) {
    return x.accountSource === "caixabank"
      ? "CaixaBank · conta principal"
      : x.accountSource === "abanca"
        ? "ABANCA · auxiliar"
        : "Conta por confirmar";
  }
  const eventBadge = (x) =>
    String(x.id || "").startsWith("v74-mycard-") && !x.done
      ? '<span class="pill declared">Captura · previsto</span>'
      : badge(x.trust);
  function eventItem(x) {
    return `<div class="item" data-edit-event="${esc(x.id)}"><span class="dot" style="background:${x.type === "entrada" ? "var(--pos)" : "var(--neg)"}"></span><div class="item-main"><div class="item-title">${esc(x.name)}</div><div class="item-sub">${esc(fmtDate(x.date))} · ${esc(x.owner)} · ${esc(x.group)} · ${esc(bankLabel(x))}</div><div class="dayrow">${eventBadge(x)}</div></div><div class="item-right"><div class="item-money secret ${x.type === "entrada" ? "plus" : "minus"}">${x.type === "entrada" ? "+" : "−"}${esc(fmt(x.amount))}</div><div class="actionset"><button class="btn sm" data-edit-event="${esc(x.id)}">Editar</button><button class="btn sm danger" data-delete-event="${esc(x.id)}">Borrar</button></div></div></div>`;
  }
  function accountItem(x, editing) {
    const main = accountRole(x) === "principal";
    return `<div class="account"><span class="dot" style="background:${main ? "var(--accent)" : "var(--text-3)"}"></span><div class="accname">${esc(x.name)} <span class="pill ${main ? "verified" : "pending"}">${main ? "Principal" : "Auxiliar"}</span><small>${esc(x.owner)} · ${esc(fmtDate(x.date))} · ${esc(x.trust)}${main ? "" : " · Non computa no saldo central"}</small></div><div class="accval secret">${main ? esc(fmt(x.amount)) : "—"}</div><button class="btn sm" data-edit-account="${esc(x.id)}">Editar</button>${editing ? `<button class="btn sm danger" data-delete-account="${esc(x.id)}">×</button>` : ""}</div>`;
  }
  function taskItem(x, more) {
    return `<div class="item taskbox ${x.done ? "completed" : ""}"><input type="checkbox" data-check-task="${esc(x.id)}" aria-label="Marcar tarefa" ${x.done ? "checked" : ""}/><div class="item-main"><div class="item-title">${esc(x.title)}</div>${more || !x.done ? `<div class="item-sub">${esc(x.note || "")}</div>` : ""}</div>${more ? `<div class="actionset"><button class="btn sm" data-edit-task="${esc(x.id)}">Editar</button><button class="btn sm danger" data-delete-task="${esc(x.id)}">×</button></div>` : ""}</div>`;
  }
  function go(t) {
    activeTab = t;
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openAccount(x) {
    const f = $("#accountForm");
    f.reset();
    f.elements.id.value = x?.id || "";
    f.elements.name.value = x?.name || "CaixaBank · Katy";
    f.elements.owner.value = x?.owner || "Katy";
    f.elements.role.value = x ? accountRole(x) : "principal";
    f.elements.amount.value = x ? fromCents(x.amount) : "";
    f.elements.date.value = x?.date || localToday();
    f.elements.trust.value = x?.trust || "acreditado";
    f.elements.note.value = x?.note || "";
    $("#accountDialogTitle").textContent = x ? "Editar saldo actual" : "Engadir saldo actual";
    $("#accountDialog").showModal();
  }
  function openEvent(x) {
    const f = $("#eventForm");
    f.reset();
    f.elements.id.value = x?.id || "";
    f.elements.name.value = x?.name || "";
    f.elements.date.value = x?.date || localToday();
    f.elements.budgetMonth.value =
      x?.budgetMonth || budgetMonthFor(x?.date || localToday(), x?.name || "", x?.type || "saida");
    f.elements.budgetMonth.dataset.auto = x?.budgetMonth ? "false" : "true";
    f.elements.type.value = x?.type || "saida";
    f.elements.amount.value = x ? fromCents(x.amount) : "";
    f.elements.owner.value = x?.owner || "Casa";
    f.elements.trust.value = x?.trust || "acreditado";
    f.elements.group.value = x?.group || "esencial";
    f.elements.budgetCategory.value = x?.budgetCategory || "";
    f.elements.done.value = x?.done ? "yes" : "no";
    f.elements.accountSource.value = x?.accountSource || "caixabank";
    f.elements.note.value = x?.note || "";
    f.elements.monthBlock.value = x?.monthBlock || "";
    f.elements.monthTemplateId.value = x?.monthTemplateId || "";
    $("#eventDialogTitle").textContent = x ? "Editar movemento" : "Engadir movemento";
    $("#deleteEventFromDialog").hidden = !x;
    $("#eventDialog").showModal();
  }
  function openTask(x) {
    const f = $("#taskForm");
    f.reset();
    f.elements.id.value = x?.id || "";
    f.elements.title.value = x?.title || "";
    f.elements.note.value = x?.note || "";
    $("#taskDialogTitle").textContent = x ? "Editar tarefa" : "Nova actuación";
    $("#taskDialog").showModal();
  }
  $("#accountForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const amount = parseEuro(f.elements.amount.value);
      const x = {
        id: f.elements.id.value || id(),
        name: f.elements.name.value.trim(),
        owner: f.elements.owner.value,
        role: f.elements.role.value,
        amount,
        date: f.elements.date.value,
        trust: f.elements.trust.value,
        note: f.elements.note.value.trim(),
      };
      if (!x.name || !x.date || !validTrust(x.trust)) throw new Error("Revisa os campos");
      if (x.role === "principal" && data.accounts.some((a) => a.id !== x.id && accountRole(a) === "principal"))
        throw new Error(
          "Xa existe unha conta principal. Edítaa en lugar de crear outra ou marca a anterior como auxiliar.",
        );
      const idx = data.accounts.findIndex((y) => y.id === x.id);
      if (idx >= 0) data.accounts[idx] = x;
      else data.accounts.push(x);
      $("#accountDialog").close();
      setData();
    } catch (err) {
      alert(err.message);
    }
  });
  $("#eventForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const amount = parseEuro(f.elements.amount.value);
      if (amount <= 0) throw new Error("O importe debe ser positivo; escolle entrada ou saída");
      const x = {
        id: f.elements.id.value || id(),
        name: f.elements.name.value.trim(),
        date: f.elements.date.value,
        type: f.elements.type.value,
        amount,
        owner: f.elements.owner.value,
        trust: f.elements.trust.value,
        group: f.elements.group.value,
        budgetCategory: f.elements.budgetCategory.value,
        budgetMonth: f.elements.budgetMonth.value,
        monthBlock: f.elements.monthBlock.value,
        monthTemplateId: f.elements.monthTemplateId.value,
        done: f.elements.done.value === "yes",
        accountSource: f.elements.accountSource.value,
        note: f.elements.note.value.trim(),
      };
      if (!x.name || !x.date || !validTrust(x.trust)) throw new Error("Revisa os campos");
      const idx = data.events.findIndex((y) => y.id === x.id);
      if (idx >= 0) data.events[idx] = x;
      else data.events.push(x);
      $("#eventDialog").close();
      setData();
    } catch (err) {
      alert(err.message);
    }
  });
  $("#taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const x = {
      id: f.elements.id.value || id(),
      title: f.elements.title.value.trim(),
      note: f.elements.note.value.trim(),
      done: false,
    };
    const idx = data.tasks.findIndex((y) => y.id === x.id);
    if (idx >= 0) {
      x.done = data.tasks[idx].done;
      data.tasks[idx] = x;
    } else data.tasks.push(x);
    $("#taskDialog").close();
    setData();
  });

  async function downloadJSON() {
    // Android WebView: gardar JSON no selector de documentos nativo; unha copia de datos NON é un ZIP.
    if (window.MausoleoAndroid && typeof window.MausoleoAndroid.saveFile === "function") {
      try {
        const p = JSON.parse(JSON.stringify(data));
        p.exportedAt = new Date().toISOString();
        p.format = "MAUSOLEO_PUNTO_CERO";
        p.backupType = "JSON_ANDROID_COMPLETO";
        p.backupVersion = 2;
        const json = JSON.stringify(p);
        if (new Blob([json]).size > 1200000) {
          alert(
            "Hai moitos anexos: esta copia supera o límite desta APK. NON desinstales nin borres datos; exporta os anexos cun navegador na web HTML antes de facer cambios.",
          );
          return;
        }
        window.MausoleoAndroid.saveFile("MAUSOLEO_PUNTO_CERO_" + localToday() + ".json", "application/json", json);
        alert(
          "Solicitouse o gardado JSON. Comproba no teléfono que o ficheiro se creou e que podes abrilo antes de actualizar.",
        );
        return;
      } catch (e) {
        alert("Non se puido preparar a copia JSON: " + e.message);
        return;
      }
    }
    try {
      const zip = new JSZip(),
        p = JSON.parse(JSON.stringify(data)),
        all = [];
      for (const r of Object.values(p.debtReviews || {})) for (const a of r.attachments || []) all.push(a);
      for (const r of p.currentDebts || []) for (const a of r.attachments || []) all.push(a);
      for (const r of p.moralDebts || []) for (const a of r.attachments || []) all.push(a);
      let unique = 0;
      for (const a of all) {
        if (!a.content) continue;
        const ab = atob(a.content.split(",")[1] || "");
        const bytes = new Uint8Array(ab.length);
        for (let i = 0; i < ab.length; i++) bytes[i] = ab.charCodeAt(i);
        a.filePath = "anexos/" + encodeURIComponent(a.id) + ".bin";
        zip.file(a.filePath, bytes);
        delete a.content;
        unique++;
      }
      p.exportedAt = new Date().toISOString();
      p.format = "MAUSOLEO_PUNTO_CERO";
      p.backupType = "ZIP";
      p.backupVersion = 3;
      const raw = JSON.stringify(p, null, 2);
      zip.file("datos.json", raw);
      zip.file(
        "integridade.json",
        JSON.stringify(
          {
            format: "MAUSOLEO_V97_INTEGRIDADE",
            algorithm: "FNV1A32_NOT_CRYPTOGRAPHIC",
            fingerprint: v97Fingerprint(raw),
            accounts: p.accounts.length,
            events: p.events.length,
            attachmentCount: unique,
            exportedAt: p.exportedAt,
          },
          null,
          2,
        ),
      );
      zip.file(
        "LEME.txt",
        "MAUSOLEO — Copia privada. Contén datos financeiros persoais. O control FNV detecta alteracións accidentais, non é unha sinatura criptográfica. Non publiques este ficheiro.\n",
      );
      const out = await zip.generateAsync({ type: "blob", compression: "STORE", streamFiles: true });
      saveBlob(out, "MAUSOLEO_" + localToday() + ".zip");
      alert(
        `Solicitouse a descarga ZIP con ${unique} anexo(s). Comproba que existe e que se pode restaurar antes de borrar ou actualizar nada.`,
      );
    } catch (e) {
      alert("Non se puido crear a copia: " + e.message);
    }
  }
  function saveBlob(blob, name) {
    if (window.MausoleoAndroid) {
      alert(
        "A descarga individual de documentos binarios non está soportada nesta APK. Os anexos pequenos poden formar parte da copia JSON; mantén tamén unha copia ZIP da versión web.",
      );
      return;
    }
    const u = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  }
  async function restoreBackup(file) {
    let p;
    if (file.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(file),
        entry = zip.file("datos.json");
      if (!entry) throw new Error("Non se atopa datos.json");
      const raw = await entry.async("string"),
        integrity = zip.file("integridade.json");
      if (integrity) {
        const meta = JSON.parse(await integrity.async("string"));
        if (
          meta.format !== "MAUSOLEO_V97_INTEGRIDADE" ||
          meta.algorithm !== "FNV1A32_NOT_CRYPTOGRAPHIC" ||
          meta.fingerprint !== v97Fingerprint(raw)
        )
          throw new Error("A verificación do ZIP fallou: datos.json foi modificado ou está danado");
      }
      p = JSON.parse(raw);
      const all = [
        ...Object.values(p.debtReviews || {}).flatMap((x) => x.attachments || []),
        ...(p.currentDebts || []).flatMap((x) => x.attachments || []),
        ...(p.moralDebts || []).flatMap((x) => x.attachments || []),
      ];
      for (const a of all) {
        if (!a.filePath) continue;
        const f = zip.file(a.filePath);
        if (!f) throw new Error("Falta un anexo: " + a.name);
        const b64 = await f.async("base64");
        a.content = `data:${a.type};base64,${b64}`;
        delete a.filePath;
      }
    } else p = JSON.parse(await file.text());
    if (p.format !== "MAUSOLEO_PUNTO_CERO") throw new Error("Formato incompatible ou incompleto");
    v97CheckBackup(p);
    const curr = safeCurrentDebts(p.currentDebts || CURRENT_SEED);
    if (
      !confirm(
        `Restaurar ${p.accounts.length} saldos, ${p.events.length} movementos, ${curr.length} obrigas actuais e ${Object.keys(p.debtReviews || {}).length} fichas históricas? Substituirá os rexistros desta sesión.`,
      )
    )
      return;
    v97LastRollback = JSON.parse(JSON.stringify(data));
    data = {
      ...p,
      version: VERSION,
      createdAt: p.createdAt || localToday(),
      accounts: p.accounts,
      events: p.events,
      tasks: p.tasks,
      includeDeclared: p.includeDeclared !== false,
      debtReviews: safeDebtReviews(p.debtReviews || {}),
      currentDebts: curr,
      moralDebts: Array.isArray(p.moralDebts) ? safeMoralDebts(p.moralDebts) : MORAL_SEED.map(moralCopy),
      loanContractApplied: !!p.loanContractApplied,
      v75IncomeApplied: !!p.v75IncomeApplied,
      bridgePlan: p.bridgePlan && typeof p.bridgePlan === "object" && !Array.isArray(p.bridgePlan) ? p.bridgePlan : {},
      v10: p.v10,
      suppressedSeedEventIds: Array.isArray(p.suppressedSeedEventIds)
        ? p.suppressedSeedEventIds.filter((k) => V74_EVENTS.some((e) => e.id === k)).slice(0, 100)
        : [],
    };
    upgradeV74();
    upgradeV75();
    upgradeV751();
    upgradeV712();
    setData();
    document.getElementById("v97UndoRestore").disabled = false;
    alert(
      "Copia restaurada na sesión. Verifica os importes, as fichas e os anexos; logo exporta unha nova copia. Podes desfacer esta restauración mentres non peches a páxina.",
    );
  }
  $("#importFile").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      await restoreBackup(f);
    } catch (ex) {
      alert("Non se puido restaurar: " + ex.message);
    } finally {
      e.target.value = "";
    }
  });
  $("#v97VerifyButton").addEventListener("click", v97Verify);
  $("#v97RecoverButton").addEventListener("click", async () => {
    try {
      await v97RestoreSnapshot("previous");
    } catch (e) {
      alert("Non se puido recuperar: " + e.message);
    }
  });
  $("#v97RecoverCurrent").addEventListener("click", async () => {
    try {
      await v97RestoreSnapshot("current");
    } catch (e) {
      alert("Non se puido recuperar: " + e.message);
    }
  });
  $("#v97UndoRestore").addEventListener("click", () => {
    if (!v97LastRollback || !confirm("Volver aos datos que había na sesión antes da última restauración?")) return;
    const tmp = JSON.parse(JSON.stringify(data));
    data = v97LastRollback;
    v97LastRollback = tmp;
    setData();
    alert("Restauración desfeita nesta sesión.");
  });
  $("#v97EraseLocal").addEventListener("click", async () => {
    if (
      prompt(
        "PERIGO: isto borra a copia local e as recuperacións automáticas. Garda antes un ZIP/JSON externo. Para confirmar escribe BORRAR:",
      ) !== "BORRAR"
    )
      return;
    try {
      await v97SnapshotQueue.catch(() => {});
      if (window.indexedDB) {
        await new Promise((resolve, reject) => {
          const r = indexedDB.deleteDatabase("MAUSOLEO_V97_RECOVERY");
          r.onsuccess = () => resolve();
          r.onerror = () => reject(r.error);
          r.onblocked = () => reject(new Error("Base de recuperación en uso"));
        });
      }
      for (const k of [
        STORAGE,
        OLD_STORAGE,
        "MAUSOLEO_PUNTO_CERO_V75",
        "MAUSOLEO_PUNTO_CERO_V74",
        "MAUSOLEO_PUNTO_CERO_V73",
        "MAUSOLEO_PUNTO_CERO_V6",
        "MAUSOLEO_PUNTO_CERO_V2",
      ])
        localStorage.removeItem(k);
      saveLocal = false;
      v97LastWritten = "";
      v97LastSaved = "";
      render();
      updateV97Status();
      alert(
        "Elimináronse as copias locais coñecidas deste navegador. Os datos desta sesión aínda están en memoria. O HTML da aplicación pode incluír referencias precargadas ao volver abrilo.",
      );
    } catch (e) {
      alert("Non se completou o borrado: " + e.message);
    }
  });
  if (v97LastWritten) queueV97Snapshot(v97LastWritten);
  updateV97Status();
  $("#includeDeclared").addEventListener("change", (e) => {
    data.includeDeclared = e.target.checked;
    setData();
  });
  $("#saveLocal").addEventListener("change", (e) => {
    if (e.target.checked && v97StorageError && /Lectura inicial fallida/.test(v97StorageError)) {
      alert(
        "Hai datos locais que non se puideron ler. Para non sobrescribilos, recupera unha copia primeiro ou exporta e revisa os ficheiros.",
      );
      e.target.checked = false;
      return;
    }
    saveLocal = e.target.checked;
    if (saveLocal) persist();
    render();
    updateV97Status();
  });
  $("#searchRecords").addEventListener("input", render);
  $("#debtSearch").addEventListener("input", renderDebts);
  $("#debtFilter").addEventListener("change", renderDebts);
  $("#debtType").addEventListener("change", renderDebts);
  $("#debtOrder").addEventListener("change", renderDebts);
  $("#archiveSearch").addEventListener("input", renderDebts);
  $("#archiveOrder").addEventListener("change", renderDebts);
  $("#debtPrint").addEventListener("click", () => window.print());
  $("#maskBtn").addEventListener("click", () => {
    showAmounts = !showAmounts;
    render();
  });
  $("#backupBtn").addEventListener("click", downloadJSON);
  $("#exportBtn").addEventListener("click", downloadJSON);
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#resetBtn").addEventListener("click", () => {
    if (confirm("Vas borrar os datos desta sesión. Fixeches unha copia ZIP?")) {
      data = {
        version: VERSION,
        createdAt: localToday(),
        accounts: [{ ...V74_ACCOUNT }],
        events: [...V74_EVENTS, ...V75_EVENTS].map((x) => ({ ...x })),
        tasks: defaultTasks(),
        includeDeclared: true,
        debtReviews: {},
        currentDebts: CURRENT_SEED.map((x) => ({ ...x })),
        moralDebts: MORAL_SEED.map(moralCopy),
        loanContractApplied: true,
        v75IncomeApplied: true,
      };
      setData();
      go("inicio");
    }
  });
  $("#addDataAccount").onclick = () => openAccount();
  $("#addEvent").onclick = () => openEvent();
  $("#addDataEvent").onclick = () => openEvent();
  $("#addTask").onclick = () => openTask();
  document.addEventListener("click", (e) => {
    const b = e.target.closest(
      "[data-debt-open],[data-unarchive],[data-current-restore],[data-tab],[data-go],[data-close],[data-edit-event],[data-edit-account],[data-edit-task],[data-delete-event],[data-delete-account],[data-delete-task],[data-toggle-event]",
    );
    if (!b) return;
    if (b.dataset.debtOpen) {
      openDebt(b.dataset.debtOpen);
      return;
    }
    if (b.dataset.currentRestore) {
      const x = data.currentDebts.find((q) => q.id === b.dataset.currentRestore);
      if (x && x.status === "arquivada") {
        x.status = "por_verificar";
        setData();
      }
      return;
    }
    if (b.dataset.unarchive) {
      const k = b.dataset.unarchive;
      if (data.debtReviews?.[k]) {
        data.debtReviews[k].archived = false;
        data.debtReviews[k].changedAt = new Date().toISOString();
        setData();
      }
      return;
    }
    if (b.dataset.tab || b.dataset.go) return go(b.dataset.tab || b.dataset.go);
    if (b.dataset.close) {
      document.getElementById(b.dataset.close).close();
      return;
    }
    if (b.dataset.editEvent) {
      const x = data.events.find((x) => x.id === b.dataset.editEvent);
      if (x) openEvent(x);
    }
    if (b.dataset.editAccount) {
      const x = data.accounts.find((x) => x.id === b.dataset.editAccount);
      if (x) openAccount(x);
    }
    if (b.dataset.editTask) {
      const x = data.tasks.find((x) => x.id === b.dataset.editTask);
      if (x) openTask(x);
    }
    if (b.dataset.deleteEvent) {
      removeEventSafely(b.dataset.deleteEvent);
    }
    if (b.dataset.deleteAccount) {
      if (confirm("Eliminar este saldo?")) {
        data.accounts = data.accounts.filter((x) => x.id !== b.dataset.deleteAccount);
        setData();
      }
    }
    if (b.dataset.deleteTask) {
      if (confirm("Eliminar esta tarefa?")) {
        data.tasks = data.tasks.filter((x) => x.id !== b.dataset.deleteTask);
        setData();
      }
    }
    if (b.dataset.toggleEvent) {
      const x = data.events.find((x) => x.id === b.dataset.toggleEvent);
      if (x) {
        x.done = !x.done;
        setData();
      }
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.dataset.checkTask) {
      const x = data.tasks.find((x) => x.id === e.target.dataset.checkTask);
      if (x) {
        x.done = e.target.checked;
        setData();
      }
    }
  });

  const HISTORICAL_DEBTS = [
    {
      id: "H03",
      name: "TuPréstamoRápido",
      amountCents: 20350,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Identificar entidade xurídica, referencia e vencemento antes de enviar ningunha solicitude.",
      limitation: "Alias demasiado xenérico para comprobar o estado por nome.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 0,
      company: "Non identificada",
      situation:
        "O alias «TuPréstamoRápido» non identifica por si só unha sociedade concreta; varias marcas comparten expresións similares.",
      possible: "Non se pode deducir se a marca segue activa nin se se transmitiu o contrato.",
      signal:
        "Sen entidade e datas identificadas, non existe unha base seria para ordenar a probabilidade de reclamación.",
      nextStep: "Buscar email orixinal de contratación, contrato, CIF e transferencia bancaria.",
      sources: [],
      riskLabel: "Non valorable sen identificar",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H04",
      name: "OkMoney",
      amountCents: 30000,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Buscar contrato, comunicacións e cargos bancarios; solicitar histórico de saldo antes de pactar nada.",
      limitation: "Non hai probas de situación actual no backup.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "Rápido Finance / OK Money (relación referida por fontes secundarias)",
      situation:
        "Directorios e despachos vinculan a antiga marca OK Money a Rápido Finance e relatan cesamento ou problemas societarios; non se contrastou o teu contrato nin unha inscrición mercantil concreta.",
      possible: "Posible cesión de carteira; non consta titular actual do teu crédito.",
      signal:
        "A marca antiga tería menor actividade comercial, pero a existencia dun cesionario pode permitir reclamacións.",
      nextStep: "Solicitar identificación do prestamista contractual e consultar actuacións xudiciais que recibises.",
      sources: [
        ["Directorio sectorial (secundaria)", "https://prestametro.com/financieras/"],
        ["Revisión xurídica (secundaria)", "https://www.noguesabogados.com/prestamos-rapidos/"],
      ],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H05",
      name: "Cashper",
      amountCents: 36000,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Comprobar contrato e operación, últimas comunicacións e eventual amortización.",
      limitation: "Falta a data do último pagamento e reclamación.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 2,
      company: "Cashper · Bank DiMare Limited (antes Novum Bank en condicións antigas)",
      situation:
        "A web oficial Cashper mantén información de préstamos, atención ao cliente e condicións. O prestamista que figure no teu contrato pode responder á denominación antiga Novum.",
      possible: "As condicións publicadas contemplan cesión de dereitos; non hai proba de cesión do teu expediente.",
      signal:
        "Existe un prestamista localizable e servizo de cobro; isto xustifica revisar a ficha, non predicir demanda.",
      nextStep: "Solicitar contrato, histórico de pagos, liquidación desagregada e titular actual.",
      sources: [
        ["Cashper · quen somos", "https://www.cashper.es/about"],
        ["Cashper · condicións", "https://www.cashper.es/rights/t%C3%A9rminos-y-condiciones"],
      ],
      riskLabel: "Atención documental",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H06",
      name: "CreditoMas",
      amountCents: 39200,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Comprobar identificación da entidade e se a reclamación foi cedida; solicitar contrato e conta de pagamentos.",
      limitation: "O nome está no backup, non acompañado de documentación contractual.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "CréditoMás · vinculación secundaria con Sistemas Financieros Móviles",
      situation:
        "As fontes abertas son contraditorias sobre se a marca concede novos créditos; a identidade mercantil e a situación exacta necesitan contrastarse co contrato.",
      possible: "Non se atopou documento fiable de cesión do teu expediente.",
      signal: "A marca aparece en directorios, mais non se puido verificar actividade actual nin unha cesión concreta.",
      nextStep: "Comprobar a razón social no correo de contratación e localizar a referencia bancaria.",
      sources: [
        ["Directorio sectorial (contraditorio)", "https://misolvencia.es/empresas-prestamos-espana"],
        ["Repertorio xurídico (secundaria)", "https://www.noguesabogados.com/prestamos-rapidos/"],
      ],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H07",
      name: "Twinero",
      amountCents: 40500,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Contrastar se hai contrato, transferencia inicial e cargos posteriores, despois solicitar histórico ao acreedor acreditado.",
      limitation: "O banco non localizou coincidencia inequívoca polo nome literal.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "Twinero, S.L. (denominación histórica recollida en directorios)",
      situation:
        "A web twinero.es funciona actualmente como comparador de produtos alleos; isto non proba que o prestamista orixinal siga concedendo. Directorios sitúan o cese de novos préstamos con anterioridade.",
      possible: "Non se identificou unha cesión relacionada co teu contrato.",
      signal: "Hai unha sociedade histórica identificable, pero non proba de reclamación actual.",
      nextStep: "Recuperar o contrato co NIF, último pagamento e calquera carta de cobro.",
      sources: [
        ["Twinero.es · portal actual", "https://twinero.es/"],
        ["Ficha societaria (secundaria)", "https://cincodias.elpais.com/directorio-empresas/empresa/5428717/twinero"],
      ],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H08",
      name: "OnlineCredit",
      amountCents: 57722,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Buscar o nome legal e referencias en correo/extractos; contrastar cesións e reclamacións posteriores.",
      limitation: "A coincidencia dun nome comercial non identifica a débeda esixible.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "OnlineCredit · Europa Firme, S.L. (atribución de fonte secundaria)",
      situation:
        "Repertorios xurídicos sinalan que a sociedade asociada á marca se disolveu. Non se verificou directamente no BORME nin se identificou o teu contrato.",
      possible: "A disolución non exclúe cesión de dereitos anterior ou ulterior; sen proba concreta.",
      signal: "Marca histórica pouco visible, sen evidencia suficiente para descartala.",
      nextStep: "Buscar escritura/contrato co NIF e posibles comunicacións de cesión.",
      sources: [["Repertorio xurídico (secundaria)", "https://www.noguesabogados.com/prestamos-rapidos/"]],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H09",
      name: "Wonga",
      amountCents: 59022,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Buscar correo ou contrato histórico e verificar a entidade titular actual; non deducir extinción pola situación comercial da marca.",
      limitation: "Que unha marca cambie ou deixe de operar non acredita que a débeda estea cancelada.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "Wonga Consumer Finance Spain, S.L. · sociedade extinguida",
      situation:
        "A sociedade española figura como extinguida no Rexistro Mercantil en xaneiro de 2022 segundo recompilación de anuncios BORME.",
      possible:
        "Existen noticias e casos particulares de reclamacións por empresas compradoras de carteiras, pero non consta cesión da túa.",
      signal:
        "O prestamista orixinal non opera, mais a débeda podería ter sido transmitida. A súa antigüidade fai imprescindible revisar prescrición e interrupcións.",
      nextStep:
        "Pedir cadea documental de cesión e comprobar data do último acto interruptivo se aparece unha reclamación.",
      sources: [
        ["Anuncios BORME recompilados", "https://www.empresia.es/empresa/wonga-consumer-finance-spain/"],
        ["Caso de cesión (non xeneralizable)", "https://www.abogadosbancarios.es/wonga-consumer-finance-spain/"],
      ],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H10",
      name: "Movistar antigo",
      amountCents: 62629,
      type: "Telecom",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Pedir facturas, liña/contrato, baixa e detalle de regularización. Comparar coas compras e recibos actuais.",
      limitation:
        "Hai movementos MOVISTAR nos CSV, pero non é posible separalos con seguridade deste expediente antigo.",
      priority: "Media para obter documentos",
      reviewNeeds: [
        "Contrato/servizo e facturas",
        "Data de baixa e liquidación",
        "Reclamacións posteriores",
        "Identidade do titular do crédito",
      ],
      tier: 3,
      company: "Movistar / Telefónica · operador activo",
      situation:
        "Telefónica mantén servizos operativos; unha factura histórica pode proceder de baixa, terminal ou servizo. Existen cargos bancarios Movistar, sen que se demostrase a súa relación con esta ficha.",
      possible:
        "As facturas poden ser xestionadas por departamentos de cobro ou terceiros; sen proba da túa operación.",
      signal: "O operador está plenamente identificable e hai indicios bancarios indirectos; convén aclaralo cedo.",
      nextStep:
        "Solicitar facturas, baixa, histórico e información do eventual xestor; separar facturación actual de antiga.",
      sources: [
        [
          "Dereitos e reclamacións telecom (Goberno)",
          "https://www.dsca.gob.es/es/consumo/preguntas-frecuentes/me-he-dado-baja-operador-sigue-cobrandome-facturas-que-puedo-hacer",
        ],
        ["Reclamación telecom (AEPD)", "https://www.aepd.es/areas-de-actuacion/reclamaciones-de-telecomunicaciones"],
      ],
      riskLabel: "Prioridade alta de comprobar",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H11",
      name: "Via Conto",
      amountCents: 70181,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Verificar a identidade do prestamista, a referencia contractual e se houbo prórrogas ou pagos.",
      limitation: "O apelativo comercial non proba por si só o titular actual.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 2,
      company: "Viaconto Minicredit, S.L.",
      situation:
        "A web propia segue publicada con condicións, datos fiscais e canle de contacto. Algúns directorios clasifican a marca como pechada, en contradición coa fonte directa.",
      possible: "O contrato prevé condicións e dereitos do prestamista; non existe proba de venda do teu expediente.",
      signal: "Prestamista localizable con web de atención ao cliente; revisar antes de supoñer extinción.",
      nextStep:
        "Pedir copia do contrato, recibos e un saldo á data actual; verificar condicións da época da contratación.",
      sources: [
        ["Viaconto · web oficial", "https://www.viaconto.es/"],
        ["Viaconto · condicións", "https://www.viaconto.es/contrato"],
      ],
      riskLabel: "Atención documental",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H12",
      name: "Kizoo",
      amountCents: 78000,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Localizar contrato e posible cesionario; comprobar a última reclamación fehaciente antes de valorar prescrición.",
      limitation: "Non hai datas documentadas de esixibilidade nin interrupción.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 0,
      company: "Kizoo / Kyzoo · marca non identificada de forma inequívoca",
      situation:
        "Fontes secundarias citan Kyzoo e relacións con outras marcas de microcrédito, pero non permiten identificar con seguridade esta ficha Kizoo.",
      possible: "Calquera referencia a venda de carteira sería especulativa sen NIF/contrato.",
      signal: "Primeiro resolver a identidade. Non se pode puntuar de maneira útil o risco desta débeda.",
      nextStep:
        "Recuperar correos, extracto de ingreso e NIF do prestamista; comprobar se «Kizoo» foi escrito correctamente.",
      sources: [["Directorio histórico (secundaria)", "https://misolvencia.es/empresas-prestamos-espana"]],
      riskLabel: "Non valorable sen identificar",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H13",
      name: "Zaplo",
      amountCents: 128522,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Localizar contrato e data de vencemento; solicitar histórico de pagos e desglose de capital, xuros e comisións.",
      limitation: "A cifra histórica é unha anotación, non unha liquidación do acredor.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 2,
      company: "Zaplo · grupo 4finance / Vivus (marca actual de referencia)",
      situation:
        "Zaplo anuncia oficialmente que xa non concede préstamos baixo esa marca e remite ao servizo Vivus para consultas.",
      possible: "A continuidade dunha canle de atención non proba cesión nin saldo do teu préstamo.",
      signal: "Hai un canal oficial onde solicitar información da operación antiga; non é evidencia de demanda actual.",
      nextStep: "Pedir ao servizo indicado por Zaplo a identificación do contrato e do titular do crédito.",
      sources: [["Aviso oficial de Zaplo", "https://www.zaplo.es/"]],
      riskLabel: "Atención documental",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H14",
      name: "Sabadell",
      amountCents: 270635,
      type: "Banca",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Dous cargos de ABANCA en 2020 conteñen SABADELL. Contrastar referencias, contrato e destinatario para saber se pertencen a esta ficha.",
      limitation:
        "03/08/2020: −250,00 €; 30/09/2020: −37,03 €. Son coincidencias textuais, non identificación do préstamo nin proba de saldo.",
      priority: "Alta para aclarar indicios",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 3,
      company: "Banco Sabadell, S.A. · banco en actividade",
      situation:
        "Banco comercial activo e identificable. Hai dous cargos ABANCA de 2020 con texto Sabadell; non demostran que correspondan ao mesmo contrato.",
      possible: "Posibles cesións de carteiras no sector, pero non se identificou ningunha do teu expediente.",
      signal: "Banca identificable + movementos que paga a pena contrastar; prioridade alta documental.",
      nextStep: "Cruzar os dous cargos co seu concepto completo e pedir copia de contrato e situación do préstamo.",
      sources: [
        [
          "Registros Banco de España",
          "https://www.bde.es/wbe/es/punto-informacion/contenidos/registros/registros-entidades/",
        ],
      ],
      riskLabel: "Prioridade alta de comprobar",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H15",
      name: "Santander",
      amountCents: 285593,
      type: "Banca",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Primeiro contraste CIRBE e documentación bancaria; comprobar se existe unha cesión ou procedemento xudicial.",
      limitation: "A ausencia en CIRBE non certifica cancelación se o crédito foi cedido ou non é declarable.",
      priority: "Alta para obter documentación",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 3,
      company: "Banco Santander, S.A. · banco en actividade",
      situation:
        "Banco activo e con carteira de crédito. Non consta saldo individual nin contrato na documentación revisada.",
      possible: "O sector bancario pode ceder créditos, pero non consta cesión desta anotación.",
      signal:
        "Entidade perfectamente identificable e importe histórico relativamente elevado; revisar documentalmente primeiro.",
      nextStep: "Solicitar CIRBE e copia de contrato; investigar se hai expediente xudicial ou cesionario comunicado.",
      sources: [
        [
          "Banco de España · rexistros",
          "https://www.bde.es/wbe/es/punto-informacion/contenidos/registros/registros-entidades/",
        ],
        ["Santander · información corporativa", "https://www.santander.com/"],
      ],
      riskLabel: "Prioridade alta de comprobar",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H16",
      name: "Préstamo10",
      amountCents: 35800,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action:
        "Primeiro identificar denominación social e referencia do contrato: o alias xenérico impide localizar con seguridade o acreedor.",
      limitation: "O nome da ficha non identifica inequivocamente a entidade xurídica.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "Préstamo10 · P10 Finance, S.L. (atribución secundaria)",
      situation:
        "Fontes sectoriais indican que deixou de conceder créditos e que a web deixou de funcionar arredor de 2022. O estado societario concreto require rexistro.",
      possible: "Unha carteira antiga podería ser cedida; non hai proba de cesión do teu préstamo.",
      signal: "Prestamista orixinal con actividade comercial cesada, sen dato actual do expediente.",
      nextStep: "Buscar contrato, NIF, referencias e última comunicación antes de dirixirse a terceiras empresas.",
      sources: [
        ["Estado histórico (Roams, secundaria)", "https://roams.es/finanzas/prestamos/prestamo-rapido/prestamo10/"],
      ],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H17",
      name: "Contante",
      amountCents: 44240,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Reconstruír capital e recargos, con datas de cada prórroga; solicitar liquidación actual.",
      limitation: "Non se pode valorar o importe nin a prescrición sen vencemento.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 2,
      company: "Contante · AvaFin Spain, S.L.U. (web actual)",
      situation:
        "A propia páxina de Contante identifica AvaFin Spain como empresa responsable e mantén área de cliente, atención e información contractual. O contrato antigo pode identificar outra denominación do grupo.",
      possible:
        "As condicións publicadas contemplan cesión en caso de mora; non demostran transmisión do teu préstamo.",
      signal: "Existe un canal actual e entidade identificable para verificar o contrato.",
      nextStep: "Pedir copia das condicións concretas da data da sinatura e liquidación actual.",
      sources: [
        ["Contante · contacto oficial", "https://www.contante.es/contacto"],
        ["Contante · información normalizada", "https://www.contante.es/standardinformation"],
      ],
      riskLabel: "Atención documental",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H18",
      name: "CréditoCajero",
      amountCents: 63344,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Solicitar copia de contrato e movementos; comprobar se existen distintas operacións baixo o mesmo nome.",
      limitation: "Falta referencia para saber se se trata dun ou varios contratos.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 1,
      company: "CréditoCajero · Friendly Group Spain (atribución secundaria)",
      situation:
        "Repertorios xurídicos vinculan a marca con Friendly Group Spain e directorios describen cesamento da concesión; a situación mercantil non foi verificada directamente.",
      possible: "A posible cesión non consta para o teu expediente.",
      signal: "Marca histórica cunha sociedade candidata; sen evidencia actual de reclamación.",
      nextStep: "Localizar contrato e comprobar o destinatario da transferencia e o NIF.",
      sources: [
        ["Repertorio xurídico (secundaria)", "https://www.noguesabogados.com/prestamos-rapidos/"],
        ["Censo sectorial (secundaria)", "https://prestametro.com/financieras/"],
      ],
      riskLabel: "Seguimento de marca histórica",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
    {
      id: "H19",
      name: "QuéBueno",
      amountCents: 58433,
      type: "Microcrédito",
      source: "OMEUMUNDO finance.debts bucket=REVIEW (31/10/2026); coincide con RESPAWN (26/09/2026)",
      sourceDate: "2026-10-31",
      currentBalanceCents: null,
      dateDue: null,
      dateLastDemand: null,
      dateLastPayment: null,
      creditorConfirmed: false,
      contractsAvailable: false,
      certifiedBalance: false,
      judicialStatusKnown: false,
      initialStatus: "SEN_DETERMINAR",
      action: "Localizar contrato e xustificantes de cobro; comprobar comisións e saldo desagregado.",
      limitation: "Non constan pagamentos nin saldo certificado na ficha.",
      priority: "Media documental",
      reviewNeeds: [
        "Contrato ou identificador do servizo",
        "Vencemento e último pagamento",
        "Reclamacións con proba de recepción",
        "Titular actual e posible cesión",
        "Liquidación actual e xustificantes",
        "Comprobación xudicial se procede",
      ],
      tier: 2,
      company: "QuéBueno · NBQ FUND ONE S.L.U. (prestamista); NBQ Technology (intermediaria)",
      situation: "A web oficial ofrece créditos e distingue nas condicións xerais a prestamista da intermediaria.",
      possible: "O contrato particular e un posible cesionario non están verificados.",
      signal: "Entidade operativa e localizable, o que xustifica solicitude documental.",
      nextStep: "Solicitar ao prestamista e intermediaria copia contractual, pagamentos e saldo á data.",
      sources: [
        ["QuéBueno · empresa oficial", "https://www.quebueno.es/quienes-somos"],
        ["QuéBueno · condicións xerais", "https://www.quebueno.com/condiciones-generales"],
      ],
      riskLabel: "Atención documental",
      collectionAssessment: "Non valorable: faltan datas, contrato, eventuais interrupcións e estado procesual.",
      dateResearched: "2026-11-05",
      disclaimer:
        "Orientación por trazabilidade e actividade da entidade, NON probabilidade de demanda, cobrabilidade nin vencemento xurídico.",
    },
  ];
  const PERSONAL_CASE_IDS = new Set(["H01", "H02"]);
  // Fichas por entidade: estado operativo separado do estado da documentación e da situación legal.
  const REVIEW_STATES = {
    sen_revisar: "Por revisar",
    solicitada: "Doc. solicitada",
    recibida: "Doc. recibida",
    asesoria: "En análise",
    resolto: "Revisión resolta",
  };
  const CASE_STATES = {
    aberto: "En revisión",
    pagada: "Pagada · declarado",
    morta: "Morta / inactiva · persoal",
    extinta: "Extinción documentada · por validar",
    sen_conclusion: "Aparcada · sen conclusión",
  };
  const MAX_FILE_BYTES = 120 * 1024 * 1024; // Seguridade por ficheiro; sen tope global de 20 MB
  const MAX_FILES_BYTES = Number.MAX_SAFE_INTEGER;
  const TYPES = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    txt: "text/plain",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  let pendingAttachments = [],
    activeCaseId = null;
  function sumAttachmentBytes(map) {
    let n = 0;
    for (const r of Object.values(map || {})) {
      for (const a of r.attachments || []) n += Number(a.size) || 0;
    }
    return n;
  }
  function cleanFiles(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const a of arr.slice(0, 45)) {
      if (!a || typeof a !== "object") continue;
      const ext = String(a.name || "")
        .split(".")
        .pop()
        .toLowerCase();
      if (
        !TYPES[ext] ||
        typeof a.content !== "string" ||
        !a.content.startsWith("data:" + TYPES[ext] + ";base64,") ||
        !Number.isSafeInteger(a.size) ||
        a.size <= 0 ||
        a.size > MAX_FILE_BYTES ||
        a.content.length > 170_000_000
      )
        continue;
      out.push({
        id: String(a.id || id()).slice(0, 90),
        name: String(a.name).slice(0, 160),
        type: TYPES[ext],
        size: a.size,
        addedAt: String(a.addedAt || "").slice(0, 40),
        content: a.content,
      });
    }
    return out;
  }
  function safeDebtReviews(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out = {};
    for (const [k, r] of Object.entries(v)) {
      if (!(HISTORICAL_DEBTS.some((x) => x.id === k) || PERSONAL_CASE_IDS.has(k)) || !r || typeof r !== "object")
        continue;
      out[k] = {
        status: REVIEW_STATES[r.status] ? r.status : "sen_revisar",
        caseState: CASE_STATES[r.caseState] ? r.caseState : "aberto",
        archived: Boolean(r.archived),
        changedAt: String(r.changedAt || "").slice(0, 40),
        reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(r.reviewDate || "") ? r.reviewDate : "",
        docReference: String(r.docReference || "").slice(0, 160),
        notes: String(r.notes || "").slice(0, 2200),
        payments: cleanPayments(r.payments),
        autoClosedByPayment: String(r.autoClosedByPayment || "").slice(0, 90),
        baseBalanceCents:
          Number.isSafeInteger(r.baseBalanceCents) && r.baseBalanceCents >= 0 ? r.baseBalanceCents : null,
        principalCents: validBreakdownCents(r.principalCents),
        interestCents: validBreakdownCents(r.interestCents),
        feesCents: validBreakdownCents(r.feesCents),
        attachments: PERSONAL_CASE_IDS.has(k) ? [] : cleanFiles(r.attachments),
      };
    }
    return out;
  }
  function isArchived(x) {
    return Boolean(data.debtReviews?.[x.id]?.archived);
  }
  function caseTag(k) {
    const r = data.debtReviews?.[k];
    const st = r?.caseState || "aberto";
    return `<span class="debt-status ${st === "pagada" || st === "extinta" ? "state-done" : "state-review"}">${esc(CASE_STATES[st] || CASE_STATES.aberto)}</span>`;
  }
  function riskPill(x) {
    return `<span class="risk-pill tier${x.tier}">Revisión ${x.tier === 3 ? "prioritaria" : x.tier === 2 ? "media" : x.tier === 1 ? "limitada" : "sen valorar"}</span>`;
  }
  function sorter(order) {
    return (a, b) => {
      const nameCmp = a.name.localeCompare(b.name, "gl");
      if (order === "amount_desc") return b.amountCents - a.amountCents || nameCmp;
      if (order === "amount_asc") return a.amountCents - b.amountCents || nameCmp;
      if (order === "name") return nameCmp;
      if (order === "risk_asc") return a.tier - b.tier || b.amountCents - a.amountCents || nameCmp;
      if (order === "recent")
        return (
          String(data.debtReviews?.[b.id]?.changedAt || "").localeCompare(
            String(data.debtReviews?.[a.id]?.changedAt || ""),
          ) || nameCmp
        );
      return b.tier - a.tier || b.amountCents - a.amountCents || nameCmp;
    };
  }
  function compactDebt(x, archived) {
    const r = data.debtReviews?.[x.id] || {};
    const short = x.nextStep || x.action || "Comprobar contrato e vencemento";
    const paid = paymentsTotal(r.payments);
    const base = histBase(x, r);
    const progress = base > 0 ? Math.min(100, Math.round((paid * 100) / base)) : 0;
    return `<article class="debt-card ${archived ? "archive-card" : ""}"><div class="head"><div><div class="eyebrow">${esc(x.type)} · ${esc(x.id)}</div><div class="name">${esc(x.name)}</div></div><div class="historical secret">${fmt(x.amountCents)}</div></div><div class="meta">${caseTag(x.id)}${riskPill(x)}${r.attachments?.length ? `<span class="pill">${r.attachments.length} anexo(s)</span>` : ""}${activePayments(r.payments).length ? `<span class="pill">${activePayments(r.payments).length} pagos</span>` : ""}</div><p class="explain">${esc(short)}</p><div class="mini-debt-progress" title="Pagado rexistrado sobre base histórica, non certificado"><i style="width:${progress}%"></i></div><div class="foot"><span class="small muted">Pagado rexistrado: <b>${fmt(paid)}</b> · progreso ${progress}%</span><div class="actionset">${archived ? `<button class="btn sm" data-unarchive="${esc(x.id)}">Recuperar</button>` : ""}<button class="btn sm ${archived ? "" : "electric"}" data-debt-open="${esc(x.id)}">Abrir ficha</button></div></div></article>`;
  }
  function renderDebts() {
    if (!$("#debtCards")) return;
    const filter = $("#debtFilter").value,
      kind = $("#debtType").value,
      q = $("#debtSearch").value.trim().toLocaleLowerCase("gl"),
      order = $("#debtOrder").value;
    const list = HISTORICAL_DEBTS.filter((x) => !isArchived(x));
    const matched = list
      .filter((x) => {
        const state = data.debtReviews?.[x.id]?.status || "sen_revisar";
        return (
          (filter === "all" || filter === state) &&
          (kind === "all" || kind === x.type) &&
          [x.name, x.type, x.action, x.company, x.situation, x.possible].join(" ").toLocaleLowerCase("gl").includes(q)
        );
      })
      .sort(sorter(order));
    $("#debtCards").innerHTML =
      matched.map((x) => compactDebt(x, false)).join("") ||
      '<div class="panel blank">Non hai expedientes con eses filtros. Comproba tamén Arquivadas.</div>';
    $("#dsTotal").textContent = String(list.length);
    $("#dsHistorical").textContent = fmt(HISTORICAL_DEBTS.reduce((a, x) => a + x.amountCents, 0));
    $("#dsReviewed").textContent =
      HISTORICAL_DEBTS.filter((x) => data.debtReviews?.[x.id] && data.debtReviews[x.id].status !== "sen_revisar")
        .length + "/17";
    $("#debtFilterCount").textContent =
      `${matched.length} expedientes visibles · ${list.length} sen arquivar. O sinal de risco é orientativo, non unha probabilidade de cobro.`;
    const historicalArchive = HISTORICAL_DEBTS.filter(isArchived),
      currentArchive = (data.currentDebts || []).filter((x) => x.status === "arquivada");
    const archiveCount = historicalArchive.length + currentArchive.length;
    $("#archiveCountBadge").textContent = archiveCount;
    $("#arcTotal").textContent = currentArchive.length;
    $("#arcHistoric").textContent = historicalArchive.length;
    $("#arcSum").textContent = fmt(historicalArchive.reduce((a, x) => a + x.amountCents, 0));
    const aq = $("#archiveSearch").value.trim().toLocaleLowerCase("gl"),
      ao = $("#archiveOrder").value;
    const matchH = historicalArchive
      .filter((x) => [x.name, x.type, x.company].join(" ").toLocaleLowerCase("gl").includes(aq))
      .sort(sorter(ao));
    const matchC = currentArchive
      .filter((x) => [x.name, x.kind, x.owner].join(" ").toLocaleLowerCase("gl").includes(aq))
      .sort((a, b) =>
        ao === "name"
          ? a.name.localeCompare(b.name, "gl")
          : ao === "amount_asc"
            ? remainingCurrent(a) - remainingCurrent(b)
            : remainingCurrent(b) - remainingCurrent(a),
      );
    const currHtml = matchC
      .map(
        (x) =>
          `<article class="current-card archive-card"><div class="left"><div class="title">${esc(x.name)}</div><div class="minor">${esc(x.owner)} · ${esc(x.kind)}</div><span class="pill pending">Arquivada · actual</span></div><div class="right"><strong class="sum secret">${fmt(remainingCurrent(x))}</strong><div class="actionset"><button class="btn sm" data-current-restore="${esc(x.id)}">Recuperar</button><button class="btn sm electric" data-current-open="${esc(x.id)}">Ficha</button></div></div></article>`,
      )
      .join("");
    const histHtml = matchH.map((x) => compactDebt(x, true)).join("");
    $("#archiveCards").innerHTML =
      (matchC.length ? '<div class="archive-group-title">Actuais arquivadas</div>' + currHtml : "") +
        (matchH.length ? '<div class="archive-group-title">Antigas arquivadas</div>' + histHtml : "") ||
      '<div class="panel blank">Aínda non hai expedientes arquivados con este filtro.</div>';
  }
  function getCase(k) {
    return HISTORICAL_DEBTS.find((x) => x.id === k);
  }
  function renderAttachments() {
    const el = $("#attachmentList");
    if (!el) return;
    el.innerHTML =
      pendingAttachments
        .map((a) => {
          const img = a.type.startsWith("image/");
          return `<div class="attachment-card">${img ? `<img class="attachment-thumb" alt="Miniatura" src="${a.content}">` : `<span class="attachment-icon">${a.type === "application/pdf" ? "PDF" : a.name.split(".").pop().toUpperCase()}</span>`}<div class="attachment-meta"><strong title="${esc(a.name)}">${esc(a.name)}</strong><small>${(a.size / 1024).toFixed(0)} KB</small><div class="attachment-actions"><button type="button" class="btn sm" data-attach-open="${esc(a.id)}">Ver</button><button type="button" class="btn sm" data-attach-save="${esc(a.id)}">Gardar</button><button type="button" class="btn sm danger" data-attach-del="${esc(a.id)}">Quitar</button></div></div></div>`;
        })
        .join("") ||
      '<div class="blank" style="text-align:left">Sen anexos. Engade o contrato, captura, carta ou xustificante que corresponda.</div>';
    const bytes = pendingAttachments.reduce((s, a) => s + a.size, 0);
    $("#attachCapacity").textContent =
      `${pendingAttachments.length} ficheiro(s) · ${(bytes / 1024 / 1024).toFixed(1)} MB nesta ficha. Sen límite global fixo. Exporta o ZIP completo antes de pechar; con anexos grandes, o navegador pode quedar sen memoria. Non gardes datos sensibles no PC da oficina.`;
  }
  function openDebt(k) {
    const x = getCase(k);
    if (!x) return;
    activeCaseId = k;
    const r = data.debtReviews?.[k] || {},
      f = $("#debtForm");
    f.reset();
    f.elements.caseId.value = x.id;
    f.elements.caseState.value = CASE_STATES[r.caseState] ? r.caseState : "aberto";
    f.elements.reviewStatus.value = REVIEW_STATES[r.status] ? r.status : "sen_revisar";
    f.elements.reviewDate.value = r.reviewDate || "";
    f.elements.docReference.value = r.docReference || "";
    f.elements.notes.value = r.notes || "";
    f.elements.archived.checked = !!r.archived;
    f.elements.baseBalance.value = r.baseBalanceCents == null ? "" : fromCents(r.baseBalanceCents);
    f.elements.principal.value = r.principalCents == null ? "" : fromCents(r.principalCents);
    f.elements.interest.value = r.interestCents == null ? "" : fromCents(r.interestCents);
    f.elements.fees.value = r.feesCents == null ? "" : fromCents(r.feesCents);
    pendingAttachments = cleanFiles(r.attachments);
    renderAttachments();
    $("#debtDialogTitle").textContent = x.name;
    $("#debtDocSummary").innerHTML =
      `<h3>Importe histórico: <span class="secret">${esc(fmt(x.amountCents))}</span></h3><p>Saldo actual: <strong>non acreditado</strong>. Fonte: ${esc(x.source)}. ${esc(x.limitation)}</p>`;
    const links = (x.sources || [])
      .map((v) => {
        try {
          const u = new URL(v[1]);
          if (u.protocol !== "https:" && u.protocol !== "http:") return "";
          return `<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(v[0])} ↗</a>`;
        } catch (e) {
          return "";
        }
      })
      .join("");
    $("#debtResearch").innerHTML =
      `<div class="research-block"><h4>Empresa / marca</h4><p>${esc(x.company)}</p><h4>Situación pública da empresa</h4><p>${esc(x.situation)}</p><h4>Posibles cesións</h4><p>${esc(x.possible)}</p><h4>Prioridade de comprobación</h4><p>${riskPill(x)} ${esc(x.signal)}</p><h4>Cobro xudicial</h4><p>${esc(x.collectionAssessment)}</p><h4>O seguinte que comprobar</h4><p>${esc(x.nextStep)}</p><div class="source-links">${links || '<span class="small muted">Non hai ligazón fiable para esta marca.</span>'}</div></div>`;
    $("#debtNeeds").innerHTML = "<ul>" + x.reviewNeeds.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>";
    $("#debtDialog").showModal();
    setDebtMode("historic", "read");
  }
  function bytesToBlob(a) {
    const b64 = a.content.slice(a.content.indexOf(",") + 1);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: a.type });
  }
  function useAttachment(id, mode) {
    const a = pendingAttachments.find((a) => a.id === id);
    if (!a) return;
    if (mode === "delete") {
      if (confirm("Quitar este anexo da ficha? A copia ZIP anterior non cambia.")) {
        pendingAttachments = pendingAttachments.filter((x) => x.id !== id);
        renderAttachments();
      }
      return;
    }
    const url = URL.createObjectURL(bytesToBlob(a));
    if (mode === "view") {
      if (a.type.startsWith("image/") || a.type === "application/pdf" || a.type === "text/plain") {
        const w = window.open(url, "_blank", "noopener,noreferrer");
        if (!w) alert("O navegador bloqueou a vista previa. Usa Gardar para descargar o documento.");
      } else mode = "save";
    }
    if (mode === "save") {
      const el = document.createElement("a");
      el.href = url;
      el.download = a.name;
      document.body.append(el);
      el.click();
      el.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function readFile(f, mime) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error("Erro de lectura"));
      r.onload = () => {
        const content = String(r.result);
        if (!content.startsWith("data:" + mime + ";base64,")) reject(new Error("Formato do anexo non admitido"));
        else resolve(content);
      };
      r.readAsDataURL(f);
    });
  }
  $("#attachBtn").addEventListener("click", () => $("#attachFiles").click());
  $("#attachFiles").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    let count = 0;
    for (const f of files) {
      try {
        const ext = f.name.split(".").pop().toLowerCase(),
          mime = TYPES[ext];
        if (!mime) throw new Error("Formato non admitido");
        if (f.size <= 0 || f.size > MAX_FILE_BYTES)
          throw new Error(
            "O ficheiro supera o máximo preventivo de 120 MB; convén gardar documentos moi grandes fóra do navegador",
          );
        const oldForCase = data.debtReviews?.[activeCaseId]?.attachments?.reduce((a, x) => a + x.size, 0) || 0;
        const other = Math.max(0, sumAttachmentBytes(data.debtReviews) - oldForCase);
        const now = pendingAttachments.reduce((a, x) => a + x.size, 0);
        if (pendingAttachments.length >= 45) throw new Error("Límite de 45 anexos por ficha");
        const content = await readFile(f, mime);
        pendingAttachments.push({
          id: id(),
          name: f.name.slice(0, 160),
          type: mime,
          size: f.size,
          addedAt: new Date().toISOString(),
          content,
        });
        dirty = true;
        count++;
      } catch (ex) {
        alert(`${f.name}: ${ex.message}`);
      }
    }
    renderAttachments();
    if (count) $("#attachCapacity").textContent += " · Gardar expediente e exportar un ZIP para conservar os cambios.";
  });
  $("#attachmentList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-attach-open],[data-attach-save],[data-attach-del]");
    if (!b) return;
    const mode = b.dataset.attachOpen ? "view" : b.dataset.attachSave ? "save" : "delete";
    useAttachment(b.dataset.attachOpen || b.dataset.attachSave || b.dataset.attachDel, mode);
  });
  $("#caseState").addEventListener("change", (e) => {
    const st = e.target.value;
    if (["pagada", "morta", "extinta", "sen_conclusion"].includes(st)) $("#archiveCase").checked = true;
    else $("#archiveCase").checked = false;
  });
  $("#debtForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget,
      k = f.elements.caseId.value;
    if (!getCase(k)) return;
    const status = f.elements.reviewStatus.value,
      caseState = f.elements.caseState.value;
    if (!REVIEW_STATES[status] || !CASE_STATES[caseState]) return;
    const docReference = f.elements.docReference.value.trim(),
      notes = f.elements.notes.value.trim();
    let split;
    let newBase;
    try {
      newBase = readOptionalEuro(f.elements.baseBalance.value);
      if (newBase !== null && newBase < 0) throw new Error("A base non pode ser negativa");
      split = {
        principalCents: readOptionalEuro(f.elements.principal.value),
        interestCents: readOptionalEuro(f.elements.interest.value),
        feesCents: readOptionalEuro(f.elements.fees.value),
      };
      validateBreakdown(split, newBase ?? getCase(k).amountCents);
      const prev = data.debtReviews?.[k] || {};
      if (
        activePayments(prev.payments).length &&
        (newBase ?? getCase(k).amountCents) !== (prev.baseBalanceCents ?? getCase(k).amountCents)
      )
        throw new Error(
          "Hai pagamentos rexistrados. Para modificar a base sen dobre resta, revisa e anula primeiro eses apuntes ou crea unha referencia documental separada.",
        );
    } catch (ex) {
      alert(ex.message);
      return;
    }
    if ((caseState === "extinta" || status === "resolto") && !docReference && !pendingAttachments.length) {
      alert(
        "Para marcar extinción ou revisión resolta, indica unha referencia documental ou engade un ficheiro. A validez segue pendente de comprobar.",
      );
      return;
    }
    if (
      caseState === "morta" &&
      !confirm(
        "«Morta» significa só que decides aparcar este caso. Non implica prescrición nin extinción legal. Continuar?",
      )
    )
      return;
    if (
      caseState === "pagada" &&
      !docReference &&
      !pendingAttachments.length &&
      !confirm(
        "Non hai xustificante. Gardarase como pagamento DECLARADO por ti, non como saldo cero certificado. Continuar?",
      )
    )
      return;
    data.debtReviews = data.debtReviews || {};
    data.debtReviews[k] = {
      status,
      caseState,
      archived: f.elements.archived.checked,
      changedAt: new Date().toISOString(),
      reviewDate: f.elements.reviewDate.value || "",
      docReference,
      notes,
      payments: cleanPayments(data.debtReviews?.[k]?.payments),
      autoClosedByPayment: data.debtReviews?.[k]?.autoClosedByPayment || "",
      baseBalanceCents: newBase,
      ...split,
      attachments: pendingAttachments.slice(),
    };
    $("#debtDialog").close();
    setData();
    if (!saveLocal && pendingAttachments.length)
      alert("Anexos incorporados á sesión. Antes de pechar, exporta a COPIA ZIP para non perdelos.");
  });

  const CURRENT_STATUSES = {
    por_verificar: "Por verificar",
    en_xestion: "En xestión",
    pagada: "Pagada · declarada",
    arquivada: "Arquivada · persoal",
  };
  const CURRENT_CONFIDENCE = {
    declarado: "Declarado · sen contraste",
    documental: "Documento con data concreta",
    captura: "Captura con data",
    verificado_actual: "Saldo actual certificado",
  };
  function safeCurrentDebts(arr) {
    if (!Array.isArray(arr)) return CURRENT_SEED.map((x) => ({ ...x }));
    return arr
      .slice(0, 300)
      .filter((x) => x && typeof x.name === "string" && Number.isSafeInteger(x.amountCents) && x.amountCents >= 0)
      .map((x) => ({
        id: String(x.id || id()).slice(0, 90),
        name: String(x.name).slice(0, 100),
        amountCents: x.amountCents,
        owner: ["Carlos", "Katy", "Casa", "Por confirmar"].includes(x.owner) ? x.owner : "Por confirmar",
        kind: String(x.kind || "Outra").slice(0, 60),
        confidence: CURRENT_CONFIDENCE[x.confidence] ? x.confidence : "declarado",
        status: CURRENT_STATUSES[x.status] ? x.status : "por_verificar",
        checkedAt: /^\d{4}-\d{2}-\d{2}$/.test(x.checkedAt || "") ? x.checkedAt : "",
        due: /^\d{4}-\d{2}-\d{2}$/.test(x.due || "") ? x.due : "",
        notes: String(x.notes || "").slice(0, 4000),
        sourceDate: String(x.sourceDate || "2026-11-04").slice(0, 10),
        principalCents: validBreakdownCents(x.principalCents),
        interestCents: validBreakdownCents(x.interestCents),
        feesCents: validBreakdownCents(x.feesCents),
        payments: cleanPayments(x.payments),
        autoClosedByPayment: String(x.autoClosedByPayment || "").slice(0, 90),
        attachments: cleanFiles(x.attachments || []),
      }));
  }
  function validBreakdownCents(n) {
    return Number.isSafeInteger(n) && n >= 0 && n <= 99999999999 ? n : null;
  }
  function readOptionalEuro(v) {
    return String(v).trim() ? parseEuro(v) : null;
  }
  function validateBreakdown(o, total) {
    const a = [o.principalCents, o.interestCents, o.feesCents];
    if (a.some((v) => v !== null && v < 0)) throw new Error("O desglose non pode ter importes negativos");
    if (a.every((v) => v !== null) && a.reduce((x, y) => x + y, 0) !== total)
      throw new Error(
        "Se completas principal, xuros e comisións, a suma debe cadrar co importe total. Se falta un concepto déixao baleiro.",
      );
    if (a.reduce((s, v) => s + (v ?? 0), 0) > total)
      throw new Error(
        "O desglose indicado supera o importe total. Estes conceptos son partes do total, non cantidades que se engaden automaticamente.",
      );
  }
  let activeCurrentId = null,
    currentPendingAttachments = [];
  const activeCurrent = () => data.currentDebts.filter((x) => !["pagada", "arquivada"].includes(x.status));
  function renderCurrentDebts() {
    if (!$("#currentCards")) return;
    data.currentDebts = safeCurrentDebts(data.currentDebts || CURRENT_SEED);
    const listed = activeCurrent();
    const all = listed.reduce((n, x) => n + remainingCurrent(x), 0),
      docs = listed.filter((x) => x.confidence !== "declarado").reduce((n, x) => n + remainingCurrent(x), 0),
      decl = all - docs;
    $("#currentTotal").textContent = fmt(all);
    $("#currentDocumented").textContent = fmt(docs);
    $("#currentDeclared").textContent = fmt(decl);
    const q = $("#currentSearch").value.toLocaleLowerCase("gl"),
      f = $("#currentFilter").value,
      sort = $("#currentSort").value;
    let rows = data.currentDebts
      .filter(
        (x) =>
          f === "all" ||
          (f === "abertas" && !["pagada", "arquivada"].includes(x.status)) ||
          (f === "pagada" && x.status === "pagada") ||
          (f === "arquivada" && x.status === "arquivada") ||
          (f === "documental" && x.confidence !== "declarado") ||
          (f === "declarado" && x.confidence === "declarado"),
      )
      .filter((x) => [x.name, x.notes, x.owner].join(" ").toLocaleLowerCase("gl").includes(q));
    rows.sort((a, b) =>
      sort === "amount_asc"
        ? remainingCurrent(a) - remainingCurrent(b)
        : sort === "name"
          ? a.name.localeCompare(b.name, "gl")
          : sort === "owner"
            ? a.owner.localeCompare(b.owner, "gl")
            : remainingCurrent(b) - remainingCurrent(a),
    );
    $("#currentCards").innerHTML =
      rows
        .map((x) => {
          const progress =
            x.amountCents > 0 ? Math.min(100, Math.round((paymentsTotal(x.payments) * 100) / x.amountCents)) : 0;
          return `<article class="current-card ${x.status === "arquivada" ? "archived" : ""}"><div class="left"><div class="title">${esc(x.name)}</div><div class="minor">${esc(x.owner)} · ${esc(x.kind)} · ${esc(CURRENT_CONFIDENCE[x.confidence])}</div><div style="margin-top:7px"><span class="pill ${x.status === "pagada" ? "paid" : x.status === "arquivada" ? "pending" : "declared"}">${esc(CURRENT_STATUSES[x.status])}</span>${x.attachments?.length ? ` <span class="pill">${x.attachments.length} anexo(s)</span>` : ""}</div><div class="mini-debt-progress" title="Pagado rexistrado sobre a base"><i style="width:${progress}%"></i></div><div class="minor" style="margin-top:8px">Progreso rexistrado: ${progress}%</div></div><div class="right"><div class="sum secret">${fmt(remainingCurrent(x))}</div><button class="btn sm" data-current-open="${esc(x.id)}">Ficha →</button></div></article>`;
        })
        .join("") || '<div class="panel blank">Sen obrigas para este filtro.</div>';
    $("#currentCount").textContent =
      `${rows.length} visibles · ${data.currentDebts.length} rexistros totais. As obrigas pagadas ou arquivadas non figuran no importe de referencia das abertas.`;
  }
  function openCurrent(k) {
    const x = data.currentDebts.find((y) => y.id === k) || null;
    activeCurrentId = k || null;
    const f = $("#currentDebtForm");
    f.reset();
    f.elements.id.value = x?.id || "";
    f.elements.name.value = x?.name || "";
    f.elements.amount.value = x ? fromCents(x.amountCents) : "";
    f.elements.amount.readOnly = !!(x && x.id === "A13" && x.amountCents === LOAN_TOTAL);
    f.elements.amount.title =
      x?.id === "A13"
        ? "Total contractual fixado polo contrato. Para cambialo cómpre revisar o calendario de cotas."
        : "";
    f.elements.owner.value = x?.owner || "Carlos";
    f.elements.kind.value = x?.kind || "Outra";
    f.elements.confidence.value = x?.confidence || "declarado";
    f.elements.status.value = x?.status || "por_verificar";
    f.elements.checkedAt.value = x?.checkedAt || "";
    f.elements.due.value = x?.due || "";
    f.elements.notes.value = x?.notes || "";
    f.elements.principal.value = x?.principalCents == null ? "" : fromCents(x.principalCents);
    f.elements.interest.value = x?.interestCents == null ? "" : fromCents(x.interestCents);
    f.elements.fees.value = x?.feesCents == null ? "" : fromCents(x.feesCents);
    currentPendingAttachments = cleanFiles(x?.attachments || []);
    renderCurrentAttachments();
    $("#currentDebtTitle").textContent = x?.name || "Nova obrigación";
    $("#currentDebtDialog").showModal();
    setDebtMode("current", x ? "read" : "edit");
  }
  function renderCurrentAttachments() {
    const el = $("#currentAttachList");
    el.innerHTML =
      currentPendingAttachments
        .map(
          (a) =>
            `<div class="attachment-card"><span class="attachment-icon">${a.type === "application/pdf" ? "PDF" : a.type.startsWith("image/") ? "IMG" : "DOC"}</span><div class="attachment-meta"><strong>${esc(a.name)}</strong><small>${(a.size / 1024 / 1024).toFixed(2)} MB</small><div class="attachment-actions"><button type="button" class="btn sm" data-current-file-open="${esc(a.id)}">Ver</button><button type="button" class="btn sm" data-current-file-save="${esc(a.id)}">Gardar</button><button type="button" class="btn sm danger" data-current-file-del="${esc(a.id)}">Quitar</button></div></div></div>`,
        )
        .join("") || '<div class="blank">Sen documentos engadidos</div>';
    $("#currentAttachHint").textContent =
      `${currentPendingAttachments.length} anexos · exportar ZIP antes de pechar. Sen límite global de 20 MB; o navegador pode limitar o tamaño práctico.`;
  }
  $("#currentSearch").addEventListener("input", renderCurrentDebts);
  $("#currentFilter").addEventListener("change", renderCurrentDebts);
  $("#currentSort").addEventListener("change", renderCurrentDebts);
  $("#addCurrentDebt").addEventListener("click", () => openCurrent());
  document.addEventListener("click", (e) => {
    const b = e.target.closest(
      "[data-current-open],[data-current-file-open],[data-current-file-save],[data-current-file-del]",
    );
    if (!b) return;
    if (b.dataset.currentOpen) {
      openCurrent(b.dataset.currentOpen);
      return;
    }
    const k = b.dataset.currentFileOpen || b.dataset.currentFileSave || b.dataset.currentFileDel;
    const a = currentPendingAttachments.find((x) => x.id === k);
    if (!a) return;
    if (b.dataset.currentFileDel) {
      if (confirm("Retirar o anexo da ficha?")) {
        currentPendingAttachments = currentPendingAttachments.filter((x) => x.id !== k);
        renderCurrentAttachments();
      }
      return;
    }
    const blob = bytesToBlob(a),
      u = URL.createObjectURL(blob);
    if (b.dataset.currentFileOpen) {
      const w = window.open(u, "_blank", "noopener,noreferrer");
      if (!w) alert("O navegador bloqueou a vista previa; utiliza Gardar.");
    } else saveBlob(blob, a.name);
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  });
  $("#currentAttachBtn").addEventListener("click", () => $("#currentAttachFiles").click());
  $("#currentAttachFiles").addEventListener("change", async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    for (const f of files) {
      try {
        const ext = f.name.split(".").pop().toLowerCase(),
          mime = TYPES[ext];
        if (!mime) throw new Error("Formato non admitido");
        if (f.size < 1 || f.size > MAX_FILE_BYTES) throw new Error("Anexo superior ao máximo preventivo de 120 MB");
        const content = await readFile(f, mime);
        currentPendingAttachments.push({
          id: id(),
          name: f.name.slice(0, 160),
          type: mime,
          size: f.size,
          addedAt: new Date().toISOString(),
          content,
        });
      } catch (err) {
        alert(`${f.name}: ${err.message}`);
      }
    }
    renderCurrentAttachments();
  });
  $("#currentDebtForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    try {
      const amount = parseEuro(f.elements.amount.value);
      if (amount < 0) throw new Error("O importe non pode ser negativo");
      const split = {
        principalCents: readOptionalEuro(f.elements.principal.value),
        interestCents: readOptionalEuro(f.elements.interest.value),
        feesCents: readOptionalEuro(f.elements.fees.value),
      };
      validateBreakdown(split, amount);
      const existing = f.elements.id.value ? data.currentDebts.find((q) => q.id === f.elements.id.value) : null;
      if (existing && activePayments(existing.payments).length && amount !== existing.amountCents)
        throw new Error(
          "Non modifiques a base mentres existan pagos activos: evitaría unha posible dobre resta. Revisa primeiro o historial de pagamentos.",
        );
      if (!f.elements.name.value.trim()) throw new Error("Falta o nome");
      if (
        f.elements.status.value === "pagada" &&
        !confirm("Marcarase pagada por anotación persoal, non como cancelación certificada. Continuar?")
      )
        return;
      const k = f.elements.id.value || id();
      const old = data.currentDebts.findIndex((x) => x.id === k);
      const obj = {
        id: k,
        name: f.elements.name.value.trim(),
        amountCents: amount,
        owner: f.elements.owner.value,
        kind: f.elements.kind.value,
        confidence: f.elements.confidence.value,
        status: f.elements.status.value,
        checkedAt: f.elements.checkedAt.value,
        due: f.elements.due.value,
        notes: f.elements.notes.value.trim(),
        sourceDate: old >= 0 ? data.currentDebts[old].sourceDate : localToday(),
        ...split,
        payments: old >= 0 ? cleanPayments(data.currentDebts[old].payments) : [],
        autoClosedByPayment: old >= 0 ? data.currentDebts[old].autoClosedByPayment || "" : "",
        attachments: currentPendingAttachments.slice(),
      };
      if (old >= 0) data.currentDebts[old] = obj;
      else data.currentDebts.push(obj);
      $("#currentDebtDialog").close();
      setData();
      if (currentPendingAttachments.length && !saveLocal)
        alert("Os anexos desta sesión só estarán seguros cando descargues a copia ZIP.");
    } catch (err) {
      alert(err.message);
    }
  });

  // ===== MAUSOLEO VI: libro de pagamentos e modo consulta =====

  /* V7.5 · Cotas do préstamo CaixaBank. Fonte: contrato, non cadro de amortización certificado. */
  const LOAN_ID = "A13",
    LOAN_TOTAL = 1236205,
    LOAN_PRINCIPAL = 1000000,
    LOAN_INTEREST = 236205;
  const LOAN_SCHEDULE = (() => {
    const list = [
      {
        id: "L-2026-11-F",
        date: "2026-11-01",
        amountCents: 5612,
        description: "Fracción inicial (xuros)",
        note: "56,12 € · primeira fracción",
      },
    ];
    for (let i = 0; i < 42; i++) {
      const month = 11 + i;
      const y = 2026 + Math.floor(month / 12),
        m = (month % 12) + 1;
      const ym = `${y}-${String(m).padStart(2, "0")}`;
      list.push({
        id: `L-${ym}`,
        date: ym + "-01",
        amountCents: i === 41 ? 29293 : 29300,
        description: `Cota ${i + 1} de 42`,
        note:
          i === 41
            ? "292,93 €: axuste estimado de 0,07 € por redondeo; verificar recibo final"
            : "293,00 € · principal + xuros sen desglose por cota",
      });
    }
    return list;
  })();
  function loanLinkedPayments(x, row) {
    return activePayments(x.payments).filter((p) => p.installmentId === row.id);
  }
  function loanRowPaid(x, row) {
    return loanLinkedPayments(x, row).reduce((v, p) => v + p.amountCents, 0);
  }
  function loanScheduleMarkup(x) {
    const enabled = x.amountCents === LOAN_TOTAL;
    const verified = LOAN_SCHEDULE.reduce((v, row) => v + Math.min(row.amountCents, loanRowPaid(x, row)), 0);
    const paidRows = LOAN_SCHEDULE.filter((row) => loanRowPaid(x, row) >= row.amountCents).length;
    const ledgerPaid = paymentsTotal(x.payments);
    const groups = [...new Set(LOAN_SCHEDULE.map((x) => x.date.slice(0, 4)))];
    return `<section class="loan-module"><div class="loan-title-row"><h3>Plan de 43 vencementos · préstamo CaixaBank</h3><span class="pill declared">${paidRows} / 43 cotas completas</span></div>
  <p class="loan-sub">Total previsto segundo contrato: <b class="secret">${fmt(LOAN_TOTAL)}</b> (10.000 € de principal + 2.362,05 € de xuros). Inclúe a primeira fracción de 56,12 € e 42 cotas de referencia. Isto NON é o capital vivo nin un saldo certificado polo banco.</p>
  <div class="loan-stats"><div class="loan-stat"><div class="what">TOTAL DO CONTRATO</div><div class="val secret">${fmt(LOAN_TOTAL)}</div></div><div class="loan-stat"><div class="what">PAGAMENTOS REXISTRADOS</div><div class="val secret">${fmt(ledgerPaid)}</div></div><div class="loan-stat"><div class="what">POR CUBRIR NO PLAN</div><div class="val secret">${fmt(Math.max(0, LOAN_TOTAL - ledgerPaid))}</div></div></div>
  <div class="loan-list" id="loanInstallments">${groups
    .map((year) => {
      const rows = LOAN_SCHEDULE.filter((r) => r.date.startsWith(year)),
        done = rows.filter((r) => loanRowPaid(x, r) >= r.amountCents).length;
      const open = year === localToday().slice(0, 4);
      return `<details class="loan-year" ${open ? "open" : ""}><summary><span>${year} · ${rows.length} vencementos</span><span>${done} feitos</span></summary><div class="loan-rows">${rows
        .map((row) => {
          const paid = loanRowPaid(x, row),
            fully = paid >= row.amountCents,
            future = row.date > localToday();
          return `<div class="loan-row ${fully ? "done" : ""}"><div class="loan-desc"><strong>${esc(row.description)} · ${esc(fmtDate(row.date))}</strong><small>${esc(row.note)}</small>${paid > 0 && !fully ? `<span class="loan-partial">Abonado parcial: ${fmt(paid)}</span>` : ""}</div><div class="loan-sum secret">${fmt(row.amountCents)}</div><label class="loan-check"><input type="checkbox" data-loan-check="${esc(row.id)}" ${fully ? "checked" : ""} ${future && !fully ? "disabled" : ""} ${!enabled ? "disabled" : ""} aria-label="${fully ? "Desmarcar" : "Confirmar"} a cota de ${esc(fmtDate(row.date))}"/><span>${fully ? "Pagada" : future ? "Futura" : "Confirmar"}</span></label></div>`;
        })
        .join("")}</div></details>`;
    })
    .join("")}</div>
  <p class="loan-disclaimer">Marcar unha cota abre unha confirmación coa data e o importe efectivamente pagados. O apunte queda no historial da débeda e reduce o total pendente do plan, pero non resta de novo o banco nin o calendario. Os importes das últimas cotas poden variar por redondeo ou cambios contractuais. O desglose principal/xuros de cada recibo require o cadro de amortización oficial. ${!enabled ? "ATENCIÓN: o importe base foi editado e non coincide co plan contractual; non se poden marcar cotas ata revisar a ficha." : ""}</p>
 </section>`;
  }
  let pendingInstallment = null;
  function requestLoanCheck(key) {
    const x = data.currentDebts.find((v) => v.id === LOAN_ID),
      row = LOAN_SCHEDULE.find((v) => v.id === key);
    if (!x || !row) return;
    if (x.amountCents !== LOAN_TOTAL) {
      alert("Revisa primeiro o total base deste contrato; non coincide co plan de cotas.");
      renderDebtRead("current");
      return;
    }
    const linked = loanLinkedPayments(x, row),
      sum = linked.reduce((a, p) => a + p.amountCents, 0);
    if (sum >= row.amountCents) {
      if (
        !confirm(
          `Desmarcar ${row.description} do ${fmtDate(row.date)}? Os pagamentos creados co check quedarán anulados (con historial).`,
        )
      ) {
        renderDebtRead("current");
        return;
      }
      for (const p of x.payments || []) {
        if (p.installmentId !== row.id || p.voidedAt) continue;
        if (p.source === "loan-installment") {
          p.voidedAt = new Date().toISOString();
          p.voidReason = "Check desmarcado por usuario";
        } else p.installmentId = "";
      }
      if (x.autoClosedByPayment && remainingCurrent(x) > 0) {
        x.status = "en_xestion";
        x.autoClosedByPayment = "";
      }
      const top = $("#currentReadView").scrollTop;
      setData();
      renderDebtRead("current");
      $("#currentReadView").scrollTop = top;
      return;
    }
    if (row.date > localToday()) {
      alert(
        "Esta cota aínda non venceu. Non a marques como pagada por anticipado sen rexistrar un pago anticipado real.",
      );
      renderDebtRead("current");
      return;
    }
    // Reutiliza unha anotación existente para non duplicar un cargo se o importe coincide.
    const unlinked = activePayments(x.payments).find(
      (p) =>
        !p.installmentId &&
        p.amountCents === row.amountCents - sum &&
        Math.abs((new Date(p.date) - new Date(row.date)) / 86400000) <= 20,
    );
    if (
      unlinked &&
      confirm(
        `Hai un pagamento de ${fmt(unlinked.amountCents)} o ${fmtDate(unlinked.date)} xa rexistrado nesta ficha. Vinculalo á cota sen volver descontalo?`,
      )
    ) {
      const match = (x.payments || []).find((p) => p.id === unlinked.id);
      match.installmentId = row.id;
      const top = $("#currentReadView").scrollTop;
      setData();
      renderDebtRead("current");
      $("#currentReadView").scrollTop = top;
      return;
    }
    pendingInstallment = row;
    $("#installmentIntro").textContent =
      `${row.description} · vencemento ${fmtDate(row.date)}. Confirma un pago real, non un cargo futuro.`;
    $("#installmentDate").value = row.date;
    $("#installmentDate").min = "2026-10-01";
    $("#installmentDate").max = localToday();
    $("#installmentAmount").value = fromCents(row.amountCents - sum);
    $("#installmentMethod").value = "Domiciliación";
    $("#installmentDialog").showModal();
  }
  $("#installmentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pendingInstallment) return;
    const row = pendingInstallment,
      x = data.currentDebts.find((v) => v.id === LOAN_ID);
    if (!x) return;
    try {
      const date = $("#installmentDate").value,
        amount = parseEuro($("#installmentAmount").value),
        remaining = row.amountCents - loanRowPaid(x, row);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > localToday() || date < "2026-10-01")
        throw new Error("Data de pago non válida ou futura.");
      if (amount <= 0 || amount > remaining)
        throw new Error("Introduce un importe real positivo que non supere o pendente desa cota.");
      if (amount > remainingCurrent(x)) throw new Error("Supera o pendente total do contrato nesta ficha.");
      const entry = {
        id: id(),
        date,
        amountCents: amount,
        method: $("#installmentMethod").value,
        mode: "partial",
        reference: "Cota " + fmtDate(row.date),
        note: "Pagamento confirmado desde o plan contractual. Non deducir de novo do saldo bancario.",
        createdAt: new Date().toISOString(),
        voidedAt: "",
        voidReason: "",
        receiptId: "",
        balanceEligible: true,
        statusBefore: "",
        installmentId: row.id,
        source: "loan-installment",
      };
      x.payments = cleanPayments(x.payments);
      x.payments.push(entry);
      if (remainingCurrent(x) === 0) {
        entry.statusBefore = x.status || "por_verificar";
        x.status = "pagada";
        x.autoClosedByPayment = entry.id;
      }
      pendingInstallment = null;
      $("#installmentDialog").close();
      const top = $("#currentReadView").scrollTop;
      setData();
      renderDebtRead("current");
      $("#currentReadView").scrollTop = top;
      if (!saveLocal)
        alert("Cota rexistrada. Descarga agora un ZIP de respaldo se o gardado automático está desactivado.");
    } catch (ex) {
      alert(ex.message);
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-loan-check]")) requestLoanCheck(e.target.dataset.loanCheck);
  });

  const PAYMENT_METHODS = new Set(["Transferencia", "Tarxeta", "Domiciliación", "Efectivo", "Outro"]);
  function cleanPayments(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .slice(0, 2500)
      .filter(
        (x) =>
          x &&
          typeof x === "object" &&
          Number.isSafeInteger(x.amountCents) &&
          x.amountCents > 0 &&
          x.amountCents <= 99999999999 &&
          /^\d{4}-\d{2}-\d{2}$/.test(x.date || ""),
      )
      .map((x) => ({
        id: String(x.id || id()).slice(0, 90),
        date: String(x.date).slice(0, 10),
        amountCents: x.amountCents,
        method: PAYMENT_METHODS.has(x.method) ? x.method : "Outro",
        mode: x.mode === "full" ? "full" : "partial",
        reference: String(x.reference || "").slice(0, 180),
        note: String(x.note || "").slice(0, 1000),
        createdAt: String(x.createdAt || "").slice(0, 40),
        voidedAt: String(x.voidedAt || "").slice(0, 40),
        voidReason: String(x.voidReason || "").slice(0, 180),
        receiptId: String(x.receiptId || "").slice(0, 90),
        balanceEligible: x.balanceEligible !== false,
        statusBefore: String(x.statusBefore || "").slice(0, 50),
        installmentId: String(x.installmentId || "").slice(0, 25),
        source: String(x.source || "").slice(0, 40),
      }));
  }
  function activePayments(p) {
    return cleanPayments(p).filter((x) => !x.voidedAt);
  }
  function paymentsTotal(p, eligibleOnly = true) {
    return activePayments(p).reduce((v, x) => v + (!eligibleOnly || x.balanceEligible ? x.amountCents : 0), 0);
  }
  function remainingCurrent(x) {
    return Math.max(0, x.amountCents - paymentsTotal(x.payments));
  }
  function histBase(x, r) {
    return Number.isSafeInteger(r.baseBalanceCents) && r.baseBalanceCents >= 0 ? r.baseBalanceCents : x.amountCents;
  }
  function remainingHistoric(x, r) {
    return Math.max(0, histBase(x, r) - paymentsTotal(r.payments));
  }
  const pValue = (s) => `<strong class="secret">${fmt(s)}</strong>`;
  function payLine(p, kind, debtId) {
    const past = !p.balanceEligible;
    return `<article class="payment-line ${p.voidedAt ? "voided" : ""}"><div><div><strong>${esc(fmtDate(p.date))}</strong> <span class="read-pill">${p.mode === "full" ? "Total" : "Parcial"}</span> ${past ? '<span class="read-pill">Non descontado · anterior ao saldo base</span>' : ""}</div><div class="small">${esc(p.method)}${p.reference ? " · Ref.: " + esc(p.reference) : ""}${p.note ? " · " + esc(p.note) : ""}</div>${p.voidedAt ? '<div class="small">Anulado ' + esc(fmtDate(p.voidedAt.slice(0, 10))) + " · " + esc(p.voidReason) + "</div>" : ""}</div><div><div class="payment-value secret">${esc(fmt(p.amountCents))}</div>${!p.voidedAt ? `<button type="button" class="btn sm" data-void-payment="${esc(p.id)}" data-payment-kind="${kind}" data-payment-debt="${esc(debtId)}">Anular apunte</button>` : ""}</div></article>`;
  }
  function paymentTimeline(payments, kind, debtId) {
    const a = cleanPayments(payments);
    return a.length
      ? `<div class="payment-history">${a
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((p) => payLine(p, kind, debtId))
          .join("")}</div>`
      : '<p class="read-note">Aínda non se rexistraron pagamentos nesta ficha.</p>';
  }
  function setDebtMode(kind, mode) {
    const el = $(kind === "current" ? "#currentDebtDialog" : "#debtDialog");
    el.classList.toggle("mode-read", mode === "read");
    el.classList.toggle("mode-edit", mode === "edit");
    if (mode === "read") renderDebtRead(kind);
  }
  function progressMarkup(base, paid) {
    const safe = base > 0 ? Math.min(100, Math.round((Math.min(base, paid) * 100) / base)) : 0;
    return `<div class="debt-progress"><div class="progress-head"><strong>Avance dos pagamentos rexistrados</strong><span>${base > 0 ? safe + " %" : "Sen base"}</span></div><div class="progress-track" role="progressbar" aria-label="Porcentaxe de pagamentos rexistrados sobre a referencia" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${safe}"><i style="width:${safe}%"></i></div><div class="progress-caption">${base > 0 ? "Sobre o importe base da ficha" : "Precísase un importe base"} · Non certifica a extinción legal.</div></div>`;
  }
  function evolutionMarkup(base, payments) {
    const a = activePayments(payments)
      .filter((p) => p.balanceEligible)
      .sort((x, y) => x.date.localeCompare(y.date) || x.createdAt.localeCompare(y.createdAt));
    if (!a.length)
      return `<div class="graph-empty">A evolución aparecerá cando rexistres o primeiro pagamento posterior á data base.</div>`;
    let v = base;
    const p = [{ date: "Inicio", value: base }];
    for (const t of a) {
      v = Math.max(0, v - t.amountCents);
      if (p.length > 1 && p[p.length - 1].date === t.date) p[p.length - 1].value = v;
      else p.push({ date: t.date, value: v });
    }
    const w = 670,
      h = 174,
      l = 24,
      r = 24,
      t = 20,
      b = 36,
      innerW = w - l - r,
      innerH = h - t - b;
    const max = Math.max(1, base);
    const px = (i) => l + (i * innerW) / Math.max(1, p.length - 1);
    const py = (z) => t + (1 - z / max) * innerH;
    const points = p.map((z, i) => `${px(i).toFixed(1)},${py(z.value).toFixed(1)}`).join(" ");
    const dots = p
      .map(
        (z, i) =>
          `<circle cx="${px(i).toFixed(1)}" cy="${py(z.value).toFixed(1)}" r="${i === p.length - 1 ? 5 : 3.5}"><title>${esc(z.date === "Inicio" ? "Saldo base" : fmtDate(z.date))}: ${esc(fmt(z.value))}</title></circle>`,
      )
      .join("");
    return `<div class="debt-graph"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolución do saldo de seguimento, desde ${esc(fmt(base))} ata ${esc(fmt(v))}"><line x1="${l}" y1="${py(base)}" x2="${w - r}" y2="${py(base)}" class="graph-rule"/><line x1="${l}" y1="${py(0)}" x2="${w - r}" y2="${py(0)}" class="graph-rule"/><polyline points="${points}" class="graph-line"/>${dots}<text x="${l}" y="${h - 10}" class="graph-label">Inicio</text><text x="${w - r}" y="${h - 10}" text-anchor="end" class="graph-label">${esc(fmtDate(p[p.length - 1].date))}</text></svg></div><div class="graph-legend"><span>Base <b class="secret">${esc(fmt(base))}</b></span><span>Saldo interno <b class="secret">${esc(fmt(v))}</b></span></div>`;
  }
  function debtFigure(kind, x, r, base, paid, rem) {
    const parts = [
      ["Principal", r.principalCents ?? null],
      ["Xuros", r.interestCents ?? null],
      ["Comisións", r.feesCents ?? null],
    ];
    const a = parts
      .map(
        ([label, value]) =>
          `<div class="debt-figure"><span>${label}</span><strong class="${value === null ? "unknown" : "secret"}">${value === null ? "Sen desglosar" : esc(fmt(value))}</strong></div>`,
      )
      .join("");
    return `<section class="finance-visual"><div class="finance-figures"><div class="debt-figure featured"><span>Importe total base</span><strong class="secret">${esc(fmt(base))}</strong></div>${a}<div class="debt-figure"><span>Pagado rexistrado</span><strong class="secret positive">${esc(fmt(paid))}</strong></div><div class="debt-figure"><span>Pendente no seguimento</span><strong class="secret">${esc(fmt(rem))}</strong></div></div>${progressMarkup(base, paid)}${kind === "current" && x.id === LOAN_ID ? loanScheduleMarkup(x) : ""}<div class="read-section"><h3>Evolución dos pagamentos</h3>${evolutionMarkup(base, r.payments)}<p class="read-note">Só se descontan os pagos activos posteriores á data base. Os anteriores e os anulados consérvanse no historial.</p></div></section>`;
  }
  function renderDebtRead(kind) {
    const current = kind === "current",
      x = current ? data.currentDebts.find((v) => v.id === activeCurrentId) : getCase(activeCaseId);
    if (!x) return;
    const r = current ? x : data.debtReviews?.[x.id] || {},
      pay = activePayments(r.payments),
      paid = paymentsTotal(r.payments),
      old = paymentsTotal(r.payments, false) - paid,
      rem = current ? remainingCurrent(x) : remainingHistoric(x, r),
      base = current ? x.amountCents : histBase(x, r);
    const files = cleanFiles(r.attachments),
      el = $(current ? "#currentReadView" : "#historicReadView");
    const label = current
      ? x.id === LOAN_ID
        ? "Plan contractual pendente (non capital vivo)"
        : x.status === "pagada" && !pay.length
          ? "Importe de referencia · pago declarado"
          : "Saldo de seguimento · por verificar"
      : "Saldo orientativo (NON certificado)";
    const signal = current ? CURRENT_CONFIDENCE[x.confidence] : "Histórico · " + (x.priority || "estado por comprobar");
    const status = current
      ? CURRENT_STATUSES[x.status] || x.status
      : CASE_STATES[r.caseState || "aberto"] || "Por revisar";
    const source = current
      ? `Fonte de referencia: ${esc(x.sourceDate || "sen data")} · ${esc(signal)}.`
      : `${esc(x.source || "")} · A cifra orixinal pode NON ser saldo vivo.`;
    el.innerHTML = `<div class="read-header"><div><span class="read-label">${label}</span><div class="read-amount secret">${esc(fmt(rem))}</div><p class="read-note">${source}</p></div><span class="read-pill">${esc(status)}</span></div>
 <div class="read-actions"><button type="button" class="btn electric" data-start-payment="${current ? "current" : "historic"}">Rexistrar pagamento</button><button type="button" class="btn" data-edit-case="${current ? "current" : "historic"}">Editar ficha</button></div>
 ${debtFigure(kind, x, r, base, paid, rem)}<div class="read-grid read-meta"><div class="read-stat"><div class="read-label">Titular / tipo</div><strong>${esc(current ? x.owner + " · " + x.kind : x.type)}</strong></div><div class="read-stat"><div class="read-label">Fiabilidade</div><strong>${current ? esc(signal) : "Pend. contrato / saldo actualizado"}</strong></div></div>
 <div class="read-section"><h3>Historial de pagamentos ${pay.length ? `· ${pay.length} activo(s)` : ""}</h3>${paymentTimeline(r.payments, current ? "current" : "historic", x.id)}</div>
 <div class="read-section"><h3>Documentos e xustificantes · ${files.length}</h3><div class="read-files">${files.map((a) => `<button class="btn sm" type="button" ${current ? "data-current-file-save" : "data-attach-save"}="${esc(a.id)}">${a.type === "application/pdf" ? "▤" : "▣"} ${esc(a.name)}</button>`).join("") || '<p class="read-note">Aínda non se incorporaron anexos.</p>'}</div></div>
 <div class="read-section"><h3>${current ? "Notas e próximo paso" : "Investigación e situación da empresa"}</h3><p class="read-note">${current ? esc(x.notes || "Sen anotacións") : esc(x.situation || "Por verificar")}</p>${!current ? `<p class="read-note"><strong>Seguinte comprobación:</strong> ${esc(x.nextStep || "Solicitar documentación")}</p>` : ""}</div>
 <div class="note warn" style="margin-top:15px">${current ? "Os importes son de referencia e poden necesitar contraste coa entidade." : "Este saldo é unha resta orientativa desde unha cifra HISTÓRICA, non un saldo xurídico certificado."} Un pagamento rexistrado non se resta tamén do saldo bancario nin do calendario.</div>`;
  }
  let paymentContext = null;
  function paymentBaseDate(kind, x) {
    return kind === "current"
      ? x.id === LOAN_ID
        ? "2026-10-01"
        : x.checkedAt || x.sourceDate || "2026-11-04"
      : x.sourceDate || "2026-10-31";
  }
  function openPayment(kind) {
    const current = kind === "current",
      k = current ? activeCurrentId : activeCaseId,
      x = current ? data.currentDebts.find((v) => v.id === k) : getCase(k);
    if (!x) return;
    const r = current ? x : data.debtReviews?.[k] || {},
      rem = current ? remainingCurrent(x) : remainingHistoric(x, r);
    if (rem <= 0) {
      alert("O saldo de seguimento é cero. Se precisas corrixilo, utiliza Editar ficha e comproba a base documental.");
      return;
    }
    paymentContext = { kind, k, remaining: rem, baseDate: paymentBaseDate(kind, x) };
    const f = $("#paymentForm");
    f.reset();
    f.elements.date.value = localToday();
    f.elements.mode.value = "partial";
    $("#paymentAmount").value = "";
    $("#paymentAvailable").textContent = fmt(rem);
    $("#paymentDialogTitle").textContent = "Rexistrar pagamento";
    $("#paymentDebtName").textContent = x.name;
    const link = $("#loanPaymentLinkWrap"),
      sel = $("#loanPaymentInstallment");
    link.hidden = !(current && x.id === LOAN_ID);
    sel.innerHTML = '<option value="">Sen asociar a unha cota concreta</option>';
    if (!link.hidden) {
      for (const row of LOAN_SCHEDULE) {
        const pending = row.amountCents - loanRowPaid(x, row);
        if (pending > 0)
          sel.insertAdjacentHTML(
            "beforeend",
            `<option value="${esc(row.id)}">${fmtDate(row.date)} · ${row.description} · ${fmt(pending)}</option>`,
          );
      }
    }
    updatePaymentPreview();
    $("#paymentDialog").showModal();
  }
  function updatePaymentPreview() {
    if (!paymentContext) return;
    const f = $("#paymentForm"),
      mode = f.elements.mode.value,
      rem = paymentContext.remaining;
    if (mode === "full") {
      $("#paymentAmount").value = fromCents(rem);
      $("#paymentAmount").readOnly = true;
    } else {
      $("#paymentAmount").readOnly = false;
    }
    let am = 0;
    try {
      am = parseEuro($("#paymentAmount").value || "0,00");
    } catch (e) {}
    const eligible = f.elements.date.value >= paymentContext.baseDate;
    $("#paymentPreview").innerHTML =
      `<div><strong>${mode === "full" ? "Pagamento total" : "Pagamento parcial"}</strong> · saldo despois: <strong class="secret">${fmt(Math.max(0, rem - (eligible ? am : 0)))}</strong></div><div class="small">${eligible ? "Descontarase do saldo de seguimento." : "A data é anterior á referencia do saldo: gardarase no historial, pero NON se descontará automaticamente para evitar dúas restas."} Base: ${fmtDate(paymentContext.baseDate)}.</div>`;
  }
  $("#paymentMode").addEventListener("change", updatePaymentPreview);
  $("#paymentAmount").addEventListener("input", updatePaymentPreview);
  $("#paymentForm").elements.date.addEventListener("change", updatePaymentPreview);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-edit-case],[data-start-payment],[data-void-payment]");
    if (!btn) return;
    if (btn.dataset.editCase) {
      setDebtMode(btn.dataset.editCase, "edit");
      return;
    }
    if (btn.dataset.startPayment) {
      openPayment(btn.dataset.startPayment);
      return;
    }
    const k = btn.dataset.paymentDebt,
      kind = btn.dataset.paymentKind,
      pid = btn.dataset.voidPayment;
    const r = kind === "current" ? data.currentDebts.find((x) => x.id === k) : data.debtReviews?.[k];
    if (!r) return;
    const p = (r.payments || []).find((x) => x.id === pid && !x.voidedAt);
    if (!p) return;
    const reason = prompt("Motivo da anulación deste apunte (quedará no historial):", "Apunte duplicado ou incorrecto");
    if (reason === null || !reason.trim()) return;
    p.voidedAt = new Date().toISOString();
    p.voidReason = reason.trim().slice(0, 180);
    if (r.autoClosedByPayment === pid) {
      if (kind === "current") r.status = p.statusBefore || "en_xestion";
      else r.caseState = p.statusBefore || "aberto";
      r.autoClosedByPayment = "";
    } else if (r.autoClosedByPayment) {
      const remaining = kind === "current" ? remainingCurrent(r) : remainingHistoric(getCase(k), r);
      if (remaining > 0) {
        const closing = (r.payments || []).find((x) => x.id === r.autoClosedByPayment);
        if (kind === "current") r.status = closing?.statusBefore || "en_xestion";
        else r.caseState = closing?.statusBefore || "aberto";
        r.autoClosedByPayment = "";
      }
    }
    setData();
    renderDebtRead(kind);
  });
  $("#paymentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!paymentContext) return;
    const { kind, k, remaining, baseDate } = paymentContext;
    const current = kind === "current",
      x = current ? data.currentDebts.find((v) => v.id === k) : getCase(k),
      r = current ? x : data.debtReviews[k] || (data.debtReviews[k] = {});
    if (!x || !r) return;
    const f = e.currentTarget;
    try {
      const amount = parseEuro(f.elements.amount.value),
        mode = f.elements.mode.value,
        date = f.elements.date.value;
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("O pagamento debe ser maior ca cero.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Data incorrecta.");
      if (date > localToday())
        throw new Error("Non rexistres como pagado un cargo futuro. Engádeo ao calendario como previsto.");
      const eligible = date >= baseDate;
      if (mode === "full" && !eligible)
        throw new Error(
          "Para pechar o saldo, utiliza un pagamento posterior á data base. Os anteriores só se gardan no historial.",
        );
      if (eligible && amount > remaining)
        throw new Error("O importe excede o saldo de seguimento. Revisa primeiro o saldo base.");
      if (mode === "full" && amount !== remaining)
        throw new Error(
          "O pagamento total debe coincidir co saldo restante. Para un acordo con desconto, rexistra o importe realmente pagado e conserva a carta de cancelación; non se dará por saldado automaticamente.",
        );
      const attach = f.elements.receipt.files?.[0];
      let receiptId = "";
      if (attach) {
        const ext = attach.name.split(".").pop().toLowerCase(),
          mime = TYPES[ext];
        if (!mime || attach.size > MAX_FILE_BYTES || attach.size < 1)
          throw new Error("Xustificante de formato ou tamaño non admitido");
        const content = await readFile(attach, mime);
        const v = {
          id: id(),
          name: attach.name.slice(0, 160),
          type: mime,
          size: attach.size,
          addedAt: new Date().toISOString(),
          content,
        };
        r.attachments = r.attachments || [];
        if (r.attachments.length >= 45) throw new Error("A ficha ten xa o máximo preventivo de anexos");
        r.attachments.push(v);
        receiptId = v.id;
      }
      r.payments = cleanPayments(r.payments);
      const ilink = current && x.id === LOAN_ID ? $("#loanPaymentInstallment").value : "";
      if (ilink) {
        const row = LOAN_SCHEDULE.find((z) => z.id === ilink);
        if (!row) throw new Error("Cota non válida");
        if (amount > row.amountCents - loanRowPaid(x, row))
          throw new Error("Ese importe supera o pendente da cota seleccionada.");
      }
      const entry = {
        id: id(),
        date,
        amountCents: amount,
        method: f.elements.method.value,
        mode,
        reference: f.elements.reference.value.trim().slice(0, 180),
        note: f.elements.note.value.trim().slice(0, 1000),
        createdAt: new Date().toISOString(),
        voidedAt: "",
        voidReason: "",
        receiptId,
        balanceEligible: eligible,
        statusBefore: "",
        installmentId: ilink,
        source: "manual",
      };
      if (mode === "full" && eligible) {
        entry.statusBefore = current ? r.status || "por_verificar" : r.caseState || "aberto";
        if (current) r.status = "pagada";
        else r.caseState = "pagada";
        r.autoClosedByPayment = entry.id;
      }
      r.payments.push(entry);
      if (!current) {
        r.changedAt = new Date().toISOString();
        r.reviewDate = localToday();
      }
      if (current) {
        currentPendingAttachments = cleanFiles(r.attachments);
      } else {
        pendingAttachments = cleanFiles(r.attachments);
      }
      $("#paymentDialog").close();
      paymentContext = null;
      setData();
      renderDebtRead(kind);
      if (!saveLocal)
        alert(
          "Pagamento rexistrado nesta sesión. EXPORTA UNHA COPIA ZIP antes de pechar; o gardado automático está desactivado.",
        );
    } catch (ex) {
      alert("Non se puido gardar o pagamento: " + ex.message);
    }
  });
  // ===== fin módulo V6 =====

  window.addEventListener("beforeunload", (e) => {
    if (dirty && !saveLocal) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* MAUSOLEO V7.7 PC — Non modifica a contabilidade nin a estrutura do libro de pagamentos. */
  (function () {
    "use strict";
    const FIXED_SALARY = "2026-11-30";
    const CLOSING_DAY = "2026-11-29";
    const MYCARD_PREFIX = "v74-mycard-2026-11-";
    const FIELDS = { food: "bridgeFood", travel: "bridgeTravel", other: "bridgeOther" };
    function bridgeState() {
      if (!data.bridgePlan || typeof data.bridgePlan !== "object" || Array.isArray(data.bridgePlan))
        data.bridgePlan = {};
      return data.bridgePlan;
    }
    function bridgeMoney(c) {
      return c === null || typeof c === "undefined" ? "Por calcular" : fmt(c);
    }
    function getInputs() {
      const p = bridgeState();
      return ["food", "travel", "other"].map((k) => (Number.isSafeInteger(p[k]) && p[k] >= 0 ? p[k] : null));
    }
    function readEuro(str) {
      return parseEuro(String(str).trim());
    }
    function buildEvents() {
      return data.events
        .filter(
          (x) => x.id && String(x.id).startsWith(MYCARD_PREFIX) && x.date >= "2026-11-07" && x.date <= "2026-11-14",
        )
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    function bridgePreview() {
      const arr = buildEvents();
      const sum = arr.reduce((a, x) => a + x.amount, 0),
        remaining = arr.filter((x) => !x.done).reduce((a, x) => a + x.amount, 0);
      $("#bridgeBank").textContent = balanceKnown() ? fmt(balance()) : "Sen confirmar";
      const bankSnapshot = mainAccounts().find(effective);
      $("#bridgeBankSub").textContent = bankSnapshot
        ? "Saldo con data " +
          fmtDate(bankSnapshot.date) +
          (bankSnapshot.date !== localToday() ? " · comproba se segue vixente" : "") +
          " · sen crédito"
        : "Falta anotar o saldo principal";
      $("#bridgeMyCard").textContent = fmt(sum);
      $("#bridgeMyCardSub").textContent = arr.length + " cargo(s) na captura · " + fmt(remaining) + " aínda previstos";
      const list = $("#bridgeCharges");
      list.innerHTML = arr.length
        ? arr
            .map(
              (x) =>
                '<div class="bridge-charge ' +
                (x.done ? "paid" : "") +
                '"><span class="bridge-charge-date">' +
                esc(fmtDate(x.date).slice(0, 5)) +
                '</span><strong class="bridge-charge-amount secret">' +
                esc(fmt(x.amount)) +
                '</strong><span class="bridge-charge-status">' +
                (x.done ? "Feito · declarado" : "Previsto · captura") +
                '</span><button type="button" class="btn sm" data-edit-event="' +
                esc(x.id) +
                '" aria-label="Revisar cargo MyCard ' +
                esc(fmtDate(x.date)) +
                '">Revisar</button></div>',
            )
            .join("")
        : '<div class="blank">Non hai cargos da captura; revisa o calendario e a copia importada.</div>';
      const mainBankEvents = data.events
        .filter(
          (x) =>
            !x.done &&
            x.accountSource === "caixabank" &&
            effective(x) &&
            x.date >= localToday() &&
            x.date <= CLOSING_DAY,
        )
        .sort((a, b) => a.date.localeCompare(b.date) || (a.type === "saida" ? 1 : -1));
      const needs = mainBankEvents.reduce((a, e) => a + (e.type === "saida" ? e.amount : -e.amount), 0);
      const minGap = Math.max(0, needs - (balanceKnown() ? balance() : 0));
      if (localToday() > CLOSING_DAY) {
        $("#bridgeGap").textContent = "Pechar período";
        $("#bridgeGapSub").textContent = "Esta ponte era para novembro de 2026; revisa a axenda actual.";
      } else {
        $("#bridgeGap").textContent = balanceKnown() ? fmt(minGap) : "Sen saldo";
        $("#bridgeGapSub").textContent =
          "Base: " + mainBankEvents.length + " movementos da conta ata o 29/11; necesidades adicionais á parte";
      }
      const p = bridgeState();
      const vals = getInputs();
      Object.entries(FIELDS).forEach(([k, inputId], i) => {
        const el = $("#" + inputId);
        if (document.activeElement !== el) el.value = vals[i] === null ? "" : fromCents(vals[i]);
      });
      const complete = vals.every((x) => x !== null);
      const total = vals.reduce((a, x) => a + (x || 0), 0);
      $("#bridgeEssentials").textContent = fmt(total) + (complete ? "" : " · mínimo (hai campos sen estimar)");
      bridgeGap =
        balanceKnown() && localToday() <= CLOSING_DAY
          ? { cents: Math.max(0, needs + total - balance()), complete }
          : null;
      $("#bridgeFullGap").textContent =
        balanceKnown() && localToday() <= CLOSING_DAY
          ? (complete ? "" : "≥ ") + fmt(Math.max(0, needs + total - balance()))
          : "Sen saldo vixente";
      $("#bridgeBillsReviewed").checked = !!p.billsReviewed;
      $("#bridgeReviewTag").textContent = p.billsReviewed ? "Revisados · declarado" : "Por revisar";
      $("#bridgeReviewTag").className = "pill " + (p.billsReviewed ? "verified" : "pending");
      $("#bridgeReviewText").textContent = p.billsReviewed
        ? "Revisión anotada " +
          (p.reviewedOn ? "o " + fmtDate(p.reviewedOn) : "") +
          ". Non significa que os recibos estean pagados."
        : "Por revisar: comproba se faltan recibos ou gastos imprescindibles. Ningún se considera pagado por defecto.";
    }
    function bridgeFee() {
      let amount = 0,
        rate = 0,
        min = 0,
        valid = true;
      try {
        amount = readEuro($("#bridgeTransfer").value);
        rate = readEuro($("#bridgeFeeRate").value);
        min = readEuro($("#bridgeFeeMin").value);
        if (amount < 0 || rate < 0 || rate > 10000 || min < 0) valid = false;
      } catch (e) {
        valid = false;
      }
      if (!valid) {
        $("#bridgeFee").textContent = "Revisa valores";
        $("#bridgeFeeTotal").textContent = "Usa importes positivos, por exemplo 100,00";
        return;
      }
      const fee = amount === 0 ? 0 : Math.max(min, Math.round((amount * rate) / 10000));
      $("#bridgeFee").textContent = fmt(fee);
      $("#bridgeFeeTotal").textContent = fmt(amount) + " de crédito + " + fmt(fee) + " de comisión";
    }
    function renderBridge() {
      if (!$("#ponteAte30")) return;
      bridgePreview();
      bridgeFee();
    }
    const baseRender = render;
    render = function () {
      baseRender();
      renderBridge();
    };
    for (const [key, elemId] of Object.entries(FIELDS)) {
      $("#" + elemId).addEventListener("change", (e) => {
        try {
          const raw = e.target.value.trim();
          const amount = raw === "" ? null : readEuro(raw);
          if (amount !== null && amount < 0) throw new Error("O importe non pode ser negativo");
          const p = bridgeState();
          p[key] = amount;
          setData();
        } catch (err) {
          alert("Importe incorrecto: " + err.message);
          renderBridge();
        }
      });
    }
    $("#bridgeBillsReviewed").addEventListener("change", (e) => {
      const p = bridgeState();
      p.billsReviewed = e.target.checked;
      p.reviewedOn = e.target.checked ? localToday() : "";
      setData();
    });
    for (const k of ["bridgeTransfer", "bridgeFeeRate", "bridgeFeeMin"])
      $("#" + k).addEventListener("input", bridgeFee);
    // Simulador deliberadamente sen mutación da caixa ou do crédito.
  })();

  /* ═════════════════════ MAUSOLEO V7.8 · PLAN MENSUAL ═══════════════════ */
  // Os movementos reais/previstos continúan nunha única fonte: data.events.
  // bridgePlan conserva orzamentos en céntimos, separados dos movementos bancarios.
  function upgradeV78() {
    if (!data.bridgePlan || typeof data.bridgePlan !== "object" || Array.isArray(data.bridgePlan)) data.bridgePlan = {};
    const p = data.bridgePlan;
    if (!Number.isSafeInteger(p.food)) p.food = 35000; // estimación do usuario ata 30/11/2026
    if (!Number.isSafeInteger(p.travel)) p.travel = 12000;
    if (typeof p.other === "undefined") p.other = null; // non inventar importes
  }
  upgradeV78();
  const MONTH_NAMES = [
    "xaneiro",
    "febreiro",
    "marzo",
    "abril",
    "maio",
    "xuño",
    "xullo",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "decembro",
  ];
  let selectedMonth = localToday().slice(0, 7);
  function monthEnd(ym) {
    const [y, m] = ym.split("-").map(Number);
    return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  }
  function shiftMonth(ym, diff) {
    const [y, m] = ym.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1 + diff, 1)).toISOString().slice(0, 7);
  }
  function budgetEligible(x) {
    return (
      x.type === "saida" &&
      ["food", "travel", "other"].includes(x.budgetCategory) &&
      x.date >= "2026-11-05" &&
      x.date <= "2026-11-30"
    );
  }
  function budgetInfo() {
    const p = data.bridgePlan || {};
    const rows = [
      { key: "food", title: "Alimentación", target: p.food },
      { key: "travel", title: "Gasolina e transporte", target: p.travel },
      { key: "other", title: "Outros imprescindibles", target: p.other },
    ];
    return rows.map((r) => {
      const spent = data.events
        .filter((e) => budgetEligible(e) && e.budgetCategory === r.key)
        .reduce((n, e) => n + e.amount, 0);
      return { ...r, used: spent, left: Number.isSafeInteger(r.target) ? Math.max(0, r.target - spent) : null };
    });
  }
  function currentBudgetReserve() {
    return budgetInfo().reduce((t, x) => t + (x.left || 0), 0);
  }
  function monthBankEvents(from, to) {
    return data.events.filter(
      (x) => !x.done && x.accountSource === "caixabank" && effective(x) && x.date >= from && x.date <= to,
    );
  }
  function calcMonth(ym) {
    const current = localToday(),
      start = ym + "-01",
      end = monthEnd(ym),
      future = ym >= current.slice(0, 7),
      from = current > start ? current : start;
    const included = monthBankEvents(from, end);
    const inMonth = included.filter((x) => x.type === "entrada").reduce((s, x) => s + x.amount, 0);
    const outMonth = included.filter((x) => x.type === "saida").reduce((s, x) => s + x.amount, 0);
    const reserve = ym === "2026-11" && current <= "2026-11-30" ? currentBudgetReserve() : 0;
    // Para futuros meses, cálculo acumulado desde o saldo da data actual, non saldo inicial suposto para o mes.
    const allToEnd = monthBankEvents(current, end);
    const flow = allToEnd.reduce((s, x) => s + (x.type === "entrada" ? x.amount : -x.amount), 0);
    const includeNovemberReserve = ym >= "2026-11" && current <= "2026-11-30" && end >= "2026-11-30";
    const endBalance =
      balanceKnown() && future ? balance() + flow - (includeNovemberReserve ? currentBudgetReserve() : 0) : null;
    return {
      current,
      start,
      end,
      from,
      has: balanceKnown(),
      future,
      inMonth,
      outMonth,
      reserve,
      endBalance,
      included,
      includeNovemberReserve,
    };
  }
  function renderBudgetQuick() {
    const p = data.bridgePlan;
    for (const [key, id] of [
      ["food", "budgetFoodQuick"],
      ["travel", "budgetFuelQuick"],
    ]) {
      const el = $("#" + id);
      if (document.activeElement !== el) el.value = Number.isSafeInteger(p[key]) ? fromCents(p[key]) : "";
    }
    const rows = budgetInfo();
    $("#budgetProgressHome").textContent =
      "Por anotar / gastar: " +
      rows
        .filter((r) => r.key !== "other")
        .map((r) => r.title + ": " + fmt(r.left || 0))
        .join(" · ");
  }
  function drawMonthGraph(ym, r) {
    const slot = $("#monthTimelineGraph");
    if (!r.future || !r.has) {
      slot.innerHTML =
        '<p class="desc">Non se pode calcular un saldo histórico con só a fotografía actual. Revisa os movementos do mes.</p>';
      return;
    }
    const horizon = monthBankEvents(localToday(), r.end);
    const daily = {};
    for (const e of horizon) (daily[e.date] ??= []).push(e);
    if (r.includeNovemberReserve && currentBudgetReserve() > 0) {
      // A reserva ten data hipotética 29/11, antes das nóminas do 30/11.
      // Ao ter a reserva no seu propio día, o gráfico mostra a tensión de liquidez e non oculta o burato previo ás nóminas.
      const hypothetical = localToday() > "2026-11-29" ? localToday() : "2026-11-29";
      if (hypothetical <= r.end)
        (daily[hypothetical] ??= []).push({ type: "saida", amount: currentBudgetReserve(), virtualReserve: true });
    }
    const days = Object.keys(daily).sort();
    let total = balance(),
      points = [{ date: localToday(), value: total }];
    for (const date of days) {
      total += daily[date].reduce((s, e) => s + (e.type === "entrada" ? e.amount : -e.amount), 0);
      points.push({ date, value: total });
    }
    if (!points.length) return;
    let values = points.map((p) => p.value);
    values.push(0);
    let lo = Math.min(...values),
      hi = Math.max(...values);
    if (hi === lo) {
      hi += 10000;
      lo -= 10000;
    }
    let span = hi - lo,
      pad = Math.max(1500, Math.round(span * 0.12));
    lo -= pad;
    hi += pad;
    span = hi - lo;
    const W = 640,
      H = 228,
      l = 25,
      rgt = 16,
      top = 22,
      bottom = 38;
    const X = (i) => l + (W - l - rgt) * (points.length === 1 ? 0.5 : i / (points.length - 1));
    const Y = (v) => top + ((H - top - bottom) * (hi - v)) / span;
    const coords = points.map((p, i) => [X(i), Y(p.value)]);
    const path = coords.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
    const zero = Y(0);
    const first = points[0],
      last = points[points.length - 1];
    slot.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Simulación da evolución de CaixaBank con ${points.length - 1} datas de movementos e reserva final estimada"><line class="guide-line" x1="${l}" x2="${W - rgt}" y1="${Y((lo + hi) / 2)}" y2="${Y((lo + hi) / 2)}"/><line class="zero-line" x1="${l}" x2="${W - rgt}" y1="${zero}" y2="${zero}"/><path class="balance-line" d="${path}"/>${coords.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join("")}<text x="${l}" y="14">${esc(fmt(Math.round(hi - pad)))}</text><text x="${W - rgt}" y="14" text-anchor="end">${esc(fmt(last.value))}</text><text x="${l}" y="${H - 10}">${esc(fmtDate(first.date))}</text><text x="${W - rgt}" y="${H - 10}" text-anchor="end">${esc(fmtDate(r.end))}</text></svg>`;
    $("#monthGraphNote").textContent =
      "Liña = saldo anotado + movementos de CaixaBank aínda pendentes. A reserva sen datas de comida/gasolina represéntase hipoteticamente o 29/11 para mostrar a tensión antes das nóminas; non é un cargo bancario real.";
  }
  function renderMonthScreen() {
    const ym = selectedMonth,
      r = calcMonth(ym),
      [year, num] = ym.split("-").map(Number);
    $("#monthSelected").textContent =
      MONTH_NAMES[num - 1][0].toUpperCase() + MONTH_NAMES[num - 1].slice(1) + " " + year;
    $("#monthIn").textContent = fmt(r.inMonth);
    $("#monthOut").textContent = fmt(r.outMonth);
    $("#monthReserve").textContent = ym === "2026-11" ? fmt(r.reserve) : "Sen reservas dese mes";
    $("#monthProjected").textContent = r.endBalance === null ? "Non calculable" : "≈ " + fmt(r.endBalance);
    $("#monthProjected").style.color = r.endBalance !== null && r.endBalance < 0 ? "var(--neg)" : "var(--accent)";
    const shown = data.events
      .filter((x) => x.date >= ym + "-01" && x.date <= r.end)
      .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    $("#monthCoverage").textContent = r.future ? "Proxección desde o saldo comprobado" : "Mes histórico: só rexistros";
    $("#monthMovementCount").textContent =
      shown.length +
      " rexistros; " +
      shown.filter((x) => !x.done && x.accountSource === "caixabank").length +
      " pendentes na conta";
    $("#monthMovements").innerHTML =
      shown
        .map(
          (x) =>
            `<div class="month-move"><span class="small muted">${esc(fmtDate(x.date))}</span><div><div class="mm-name">${esc(x.name)}</div><div class="mm-sub">${esc(bankLabel(x))} · ${x.done ? "Reflectido no saldo" : "Previsto"}${x.budgetCategory ? " · reserva " + (x.budgetCategory === "food" ? "comida" : x.budgetCategory === "travel" ? "gasolina" : "outros") : ""}</div></div><span class="mm-value secret ${x.type === "entrada" ? "plus" : "minus"}">${x.type === "entrada" ? "+" : "−"}${esc(fmt(x.amount))}</span><div class="ledger-row-actions"><button class="btn sm" data-edit-event="${esc(x.id)}">Editar</button><button class="btn sm danger" data-delete-event="${esc(x.id)}">Borrar</button></div></div>`,
        )
        .join("") || '<div class="blank">Non hai movementos neste mes.</div>';
    const rows = ym === "2026-11" ? budgetInfo() : [];
    $("#monthBudgetDetail").innerHTML =
      rows
        .map(
          (x) =>
            `<div class="month-budget-row"><div class="mb-head"><span>${esc(x.title)}</span><strong>${x.target === null ? "Sen estimar" : esc(fmt(x.left || 0))}</strong></div><div class="mb-meta"><span>Reservado ${x.target === null ? "?" : esc(fmt(x.target))}</span><span>Rexistrado ${esc(fmt(x.used))}</span></div><div class="mb-track"><i style="width:${x.target ? Math.min(100, (100 * x.used) / x.target) : 0}%"></i></div></div>`,
        )
        .join("") ||
      '<p class="desc">As reservas de 350 € e 120 € aplícanse só ao período novembro 2026. Para outros meses engade os movementos ao calendario; aínda non hai un orzamento mensual específico.</p>';
    drawMonthGraph(ym, r);
  }
  // Core render hook: does not alter historical, debt or credit calculations.
  const renderWithBridge = render;
  render = function () {
    renderWithBridge();
    renderBudgetQuick();
    renderMonthScreen();
  };
  function quickMove(type) {
    openEvent();
    const f = $("#eventForm");
    f.elements.type.value = type;
    f.elements.trust.value = "declarado";
    f.elements.done.value = "no";
    f.elements.accountSource.value = "caixabank";
    f.elements.group.value = "esencial";
    f.elements.budgetCategory.value = "";
    $("#eventDialogTitle").textContent =
      type === "entrada" ? "Anotar ingreso · previsto ou real" : "Anotar gasto · previsto ou real";
  }
  for (const id of ["homeAddExpense", "monthAddExpense"]) $("#" + id).addEventListener("click", () => quickMove("saida"));
  for (const id of ["homeAddIncome", "monthAddIncome"]) $("#" + id).addEventListener("click", () => quickMove("entrada"));
  for (const [id, k] of [
    ["budgetFoodQuick", "food"],
    ["budgetFuelQuick", "travel"],
  ])
    $("#" + id).addEventListener("change", (e) => {
      try {
        const raw = e.target.value.trim(),
          v = raw === "" ? null : parseEuro(raw);
        if (v !== null && v < 0) throw Error("Non pode ser negativo");
        data.bridgePlan[k] = v;
        setData();
      } catch (ex) {
        alert("Revisa a reserva: " + ex.message);
        render();
      }
    });
  $("#monthPrev").addEventListener("click", () => {
    selectedMonth = shiftMonth(selectedMonth, -1);
    renderMonthScreen();
  });
  $("#monthNext").addEventListener("click", () => {
    selectedMonth = shiftMonth(selectedMonth, 1);
    renderMonthScreen();
  });
  $("#monthNow").addEventListener("click", () => {
    selectedMonth = localToday().slice(0, 7);
    renderMonthScreen();
  });
  // Ao restaurar copias V7.7 ou anteriores, un render detecta un bridgePlan ausente e restablece só campos non indicados.
  const baseMonthRender = render;
  render = function () {
    upgradeV78();
    baseMonthRender();
  };

  /* ═════ V7.9 · BLOQUES VISUAIS DO FOGAR · referencia OMEUMUNDO outubro 2026 ═════ */
  const EASY_BLOCKS = [
    {
      id: "ingresos",
      name: "Ingresos",
      icon: "↗",
      items: [
        { id: "katy", name: "Nómina Katy", reference: null },
        { id: "carlos", name: "Nómina Carlos", reference: null },
        { id: "extra", name: "Extra Nadal", reference: null },
        { id: "amigo", name: "Achega do amigo", reference: 32600 },
      ],
    },
    {
      id: "vivenda",
      name: "Vivenda",
      icon: "⌂",
      items: [
        { id: "966c3300-58cc-420e-b6ca-f8b59e0b1fae", name: "Alugueiro", reference: 90000 },
        { id: "63edf9d2-05ca-490c-941a-df84cc55a08b", name: "Garaxe", reference: 7500 },
        { id: "4b4ea5fa-22a3-447b-afa0-469bd01f60e5", name: "Bombonas", reference: 3400 },
      ],
    },
    {
      id: "firu",
      name: "Firu",
      icon: "✦",
      items: [{ id: "7ef9f329-64cb-4adf-ad14-0f251e874507", name: "Firu", reference: 7000 }],
    },
    {
      id: "comunicacions",
      name: "Comunicacións",
      icon: "◉",
      items: [
        { id: "74487e37-979d-4866-8b09-45284e949059", name: "Jazztel principal", reference: 9068 },
        { id: "597db726-6c7e-4de0-ac40-749c99366af2", name: "Segunda liña/cota Jazztel", reference: 1295 },
        { id: "f0865b3e-13b9-497c-a0ca-159eb886a820", name: "Telefónica / Movistar", reference: 4695 },
      ],
    },
    {
      id: "seguros",
      name: "Seguros",
      icon: "◆",
      items: [
        { id: "cf7d122c-6f5e-40c3-8deb-ae37b28fae44", name: "UGT", reference: 1600 },
        { id: "a508df07-1785-433d-bca4-90f5178ddc1a", name: "Occident", reference: 2024 },
        { id: "ca8dcdcc-9924-4d48-85e5-972a5119043b", name: "Seguro vida/decesos Carlos", reference: 1700 },
        { id: "c7396948-80f1-4d97-bc47-ab59850a0ea2", name: "Seguro do coche", reference: 4566 },
      ],
    },
    {
      id: "financiamentos",
      name: "Financiamentos",
      icon: "▤",
      items: [
        { id: "e784f111-5814-41a5-bf20-70668cfaab1f", name: "Oney / PCComponentes", reference: 12835 },
        { id: "152d26ce-be0c-4c10-adcc-eb072dff81d8", name: "Financiamento iPad", reference: 3244 },
        { id: "3ecce66c-ee95-42b0-bd3c-decab6debaf0", name: "AEAT", reference: 11000 },
      ],
    },
    {
      id: "variables",
      name: "Variables necesarios",
      icon: "◌",
      items: [
        { id: "e8949592-e345-4d6a-a0b4-a272de56bca7", name: "Comida + casa", reference: 30000 },
        { id: "e5891aaf-e4e6-4bcb-8b18-2bdef3253eda", name: "Gasolina", reference: 16000 },
        { id: "04c5bb95-4a42-4470-abb3-d373c905c3c3", name: "Bus Carlos", reference: 1200 },
        { id: "edf11f65-0c61-41b8-b367-33289bf3c00d", name: "Medicinas Carlos", reference: 2000 },
        { id: "22d64f34-110f-42a6-b993-985c254e44e8", name: "Anticonceptiva Katy", reference: 1833 },
        { id: "d7dda80d-d5fe-4114-b684-41c257ed9c4b", name: "Via-T", reference: 4500 },
      ],
    },
    {
      id: "saude",
      name: "Saúde",
      icon: "✚",
      items: [
        { id: "0b9f8c2b-e62f-48d0-b859-a81dc868fc22", name: "Psicólogo", reference: 14000 },
        { id: "57ca7dcf-e424-4c8f-9911-3e64c336e7e7", name: "Psiquiatra", reference: 4000 },
      ],
    },
    {
      id: "subscricions",
      name: "Subscricións",
      icon: "◇",
      items: [
        { id: "d2c8945e-b4d6-4f4e-a0c9-aed6701c9119", name: "ChatGPT", reference: 2300 },
        { id: "0189488c-3919-481d-9d0c-91e21ff2b04a", name: "Gemini", reference: 1100 },
        { id: "c451cfc9-e85f-496f-b411-a996d2c43f7d", name: "Billance", reference: 284 },
        { id: "3605e231-da81-4347-bc5c-b6e2297901e7", name: "Disney+", reference: 1200 },
      ],
    },
    { id: "outros", name: "Outros movementos", icon: "＋", items: [] },
  ];
  const EASY_COLORS = {
    ingresos: "var(--pos)",
    vivenda: "var(--warn)",
    firu: "var(--accent)",
    comunicacions: "var(--info)",
    seguros: "var(--accent-2)",
    financiamentos: "var(--neg)",
    variables: "var(--pos)",
    saude: "var(--info)",
    subscricions: "var(--accent-2)",
    outros: "var(--text-2)",
  };
  let easyOpened = {};
  const cleanLabel = (t) =>
    String(t || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  function easyGroup(x) {
    if (x.type === "entrada") return "ingresos";
    if (EASY_BLOCKS.some((z) => z.id === x.monthBlock)) return x.monthBlock;
    const t = cleanLabel(x.name);
    if (x.budgetCategory === "food" || x.budgetCategory === "travel" || x.budgetCategory === "other")
      return "variables";
    if (/firu|gato|veterinar/.test(t)) return "firu";
    if (/alug|garaxe|bombona|vivenda|alquiler/.test(t)) return "vivenda";
    if (/jazztel|movistar|telefonica|internet|fibra|mobil|telefono/.test(t)) return "comunicacions";
    if (
      /mycard|prestam|credito|credit|one[y]|aeat|facenda|financ|klarna|ipad|dineo|luzo|servicash|corteingles|debeda/.test(
        t,
      )
    )
      return "financiamentos";
    if (/seguro|occident|ugt|vidacaixa/.test(t)) return "seguros";
    if (/psicolo|psiquiatr|terapia/.test(t)) return "saude";
    if (/comida|compra|supermercado|gasolina|bus|medicin|anticonceptiv|viat|transporte|farmacia/.test(t))
      return "variables";
    if (/chatgpt|gemini|disney|billance|subscric|spotify|netflix/.test(t)) return "subscricions";
    return "outros";
  }
  function easyEvents(ym) {
    return data.events
      .filter((x) => (x.budgetMonth || budgetMonthFor(x.date, x.name, x.type)) === ym)
      .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name, "gl"));
  }
  function easyMatch(x, it, bid) {
    if (x.monthTemplateId) return x.monthTemplateId === it.id;
    const a = cleanLabel(x.name),
      b = cleanLabel(it.name);
    if (!a || !b) return false;
    if (bid === "ingresos") {
      if (it.id === "katy") return /nomina/.test(a) && /katy/.test(a);
      if (it.id === "carlos") return /nomina/.test(a) && /carlos/.test(a);
      if (it.id === "extra") return /extra/.test(a);
      return /achega/.test(a);
    }
    return a === b || a.startsWith(b + "mensual") || (b === "alugueiro" && a === "aluguer");
  }
  function easyBlockStats(block, ym) {
    const groupEvents = easyEvents(ym).filter((e) => easyGroup(e) === block.id);
    const out = groupEvents.filter((e) => e.type === "saida").reduce((n, e) => n + e.amount, 0);
    const income = groupEvents.filter((e) => e.type === "entrada").reduce((n, e) => n + e.amount, 0);
    const done = groupEvents.filter((e) => e.done).length;
    return { events: groupEvents, total: block.id === "ingresos" ? income : out, done, count: groupEvents.length };
  }
  function easyPaymentRow(e, extra = false) {
    return `<div class="bucket-line ${e.done ? "done" : ""}"><input type="checkbox" data-easy-done="${esc(e.id)}" ${e.done ? "checked" : ""} aria-label="${e.done ? "Desmarcar" : "Confirmar"} ${esc(e.name)} como reflectido no saldo"><div class="concept" data-edit-event="${esc(e.id)}">${esc(e.name)}<small>${esc(fmtDate(e.date))} · ${e.done ? "Xa no saldo" : "Previsto"}${e.accountSource === "abanca" ? " · ABANCA" : ""}</small></div><strong class="concept-val secret">${esc(fmt(e.amount))}</strong><div class="ledger-row-actions"><button class="btn sm" data-edit-event="${esc(e.id)}" type="button">Editar</button><button class="btn sm danger" data-delete-event="${esc(e.id)}" type="button">Borrar</button></div></div>`;
  }
  function easyTemplateRow(block, item, ym, events) {
    const matched = events.filter((x) => easyMatch(x, item, block.id));
    if (matched.length) return matched.map((x) => easyPaymentRow(x)).join("");
    const ref = item.reference,
      special = block.id === "variables" && ym === "2026-11" && /comida|gasolina/i.test(item.name);
    let budget = null;
    if (special) {
      const bi = budgetInfo();
      budget = /comida/i.test(item.name) ? bi.find((x) => x.key === "food") : bi.find((x) => x.key === "travel");
    }
    const title = budget ? "Reserva " + item.name : item.name;
    const subtotal = budget
      ? `${esc(fmt(budget.left || 0))} restante`
      : ref === null
        ? "Sen referencia"
        : `Out. ${esc(fmt(ref))}`;
    const sign = budget ? "Reserva, non cargo" : ref === null ? "Por anotar" : "Por anotar · ref. outubro";
    return `<div class="bucket-line"><span class="placeholder" aria-hidden="true"></span><div class="concept">${esc(title)}<small>${esc(sign)}</small></div><span class="concept-val">${subtotal}</span><button class="btn sm" data-easy-add-template="${esc(block.id)}:${esc(item.id)}" type="button">${budget ? "Anotar compra" : "Anotar"}</button></div>`;
  }
  const BLOCK_ICONS = {
    ingresos: '<path d="M6 18 18 6M9 6h9v9"/>',
    vivenda: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
    firu: '<circle cx="7" cy="11" r="1.8"/><circle cx="10.5" cy="7" r="1.8"/><circle cx="14.5" cy="7" r="1.8"/><circle cx="18" cy="11" r="1.8"/><path d="M12.3 12.5c-2.9 0-4.8 2.6-4.8 4.6 0 1.7 2 2.1 4.8 2.1s4.8-.4 4.8-2.1c0-2-1.9-4.6-4.8-4.6z"/>',
    comunicacions: '<path d="M4.5 9.5a11 11 0 0 1 15 0M7.5 13a6.7 6.7 0 0 1 9 0M12 17h.01"/>',
    seguros: '<path d="M12 3.5 19.5 6v5.5c0 4.4-3.1 7.5-7.5 8.5-4.4-1-7.5-4.1-7.5-8.5V6z"/>',
    financiamentos: '<rect x="3.5" y="6" width="17" height="13" rx="2"/><path d="M3.5 10.5h17M7.5 15h4"/>',
    variables: '<path d="M3.5 4.5h2l2.2 10h10l2-7H6.5M9.5 19.5h.01M16.5 19.5h.01"/>',
    saude: '<path d="M12 19.5s-7.5-4.4-7.5-9.6A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.3c0 5.2-7.5 9.6-7.5 9.6z"/>',
    subscricions: '<path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9M19.5 4.5V9H15M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15M4.5 19.5V15H9"/>',
    outros: '<path d="M12 5.5v13M5.5 12h13"/>',
  };
  const blockIcon = (id) =>
    '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (BLOCK_ICONS[id] || BLOCK_ICONS.outros) + "</svg>";
  function easyFullBlock(block, ym) {
    const stat = easyBlockStats(block, ym);
    const color = EASY_COLORS[block.id] || "var(--accent)";
    const donePct = stat.count ? Math.round((stat.done * 100) / stat.count) : 0;
    let rows = "";
    const matched = new Set();
    for (const it of block.items) {
      const m = stat.events.filter((x) => easyMatch(x, it, block.id));
      m.forEach((x) => matched.add(x.id));
      rows += easyTemplateRow(block, it, ym, stat.events);
    }
    const extra = stat.events.filter((e) => !matched.has(e.id));
    if (extra.length) {
      const mycard = extra.filter((x) => /mycard/i.test(x.name)),
        other = extra.filter((x) => !/mycard/i.test(x.name));
      if (mycard.length > 1) {
        const auxKey = ym + ":mycard";
        const auxOpen = !!easyOpened[auxKey];
        rows += `<details class="easy-extra-list" data-easy-aux-open="${auxKey}" ${auxOpen ? "open" : ""}><summary>MyCard · ${mycard.length} cargos · ${esc(fmt(mycard.reduce((n, e) => n + e.amount, 0)))} · ver detalles</summary>${mycard.map((x) => easyPaymentRow(x, true)).join("")}</details>`;
      } else other.push(...mycard);
      if (other.length)
        rows +=
          `<div class="simple-signal" style="margin:10px 0 4px;font-size:10px">OUTROS REXISTROS DESTE BLOQUE</div>` +
          other.map((x) => easyPaymentRow(x, true)).join("");
    }
    if (!rows) rows = '<div class="bucket-empty">Sen movementos nesta categoría. Podes engadir un novo.</div>';
    const key = ym + ":" + block.id;
    const open = easyOpened[key] === true;
    return `<details name="mausoleo-mes-ledger" class="simple-bucket" data-easy-open="${esc(key)}" style="--bucket-accent:${color}" ${open ? "open" : ""}>
  <summary><span class="bucket-icon" aria-hidden="true">${blockIcon(block.id)}</span><span class="bucket-title">${esc(block.name)}<small>${stat.count ? stat.done + "/" + stat.count + (block.id === "ingresos" ? " cobrados" : " pagados") : "Sen anotar"}</small></span><span class="bucket-total secret">${esc(fmt(stat.total))}</span></summary>
  <div class="bucket-body">${rows}<div class="bucket-actions"><button class="btn sm" type="button" data-easy-add-block="${esc(block.id)}">Outro ${block.id === "ingresos" ? "ingreso" : "gasto"}</button><span class="small muted">${stat.count ? donePct + " % rexistros confirmados" : "Sen pagamentos anotados"}</span></div><div class="tile-meter"><i style="width:${donePct}%"></i></div></div></details>`;
  }
  function easyTile(block, ym) {
    const stat = easyBlockStats(block, ym),
      pct = stat.count ? Math.round((stat.done * 100) / stat.count) : 0,
      color = EASY_COLORS[block.id] || "var(--accent)";
    return `<button type="button" class="simple-tile" data-easy-view="${esc(block.id)}" style="--bucket-accent:${color}" aria-label="Abrir bloque ${esc(block.name)}">
 <div class="tile-head"><span class="tile-icon" aria-hidden="true">${esc(block.icon)}</span><span class="tile-label">${esc(block.name)}</span><strong class="tile-amount secret">${esc(fmt(stat.total))}</strong></div><div class="tile-meta"><span>${stat.count ? stat.count + " movementos rexistrados" : "Aínda sen anotar"}</span><span>${stat.done}/${stat.count} ✓</span></div><div class="tile-meter"><i style="width:${pct}%"></i></div></button>`;
  }
  function renderEasy() {
    const m = selectedMonth;
    const monthHint = $("#monthBudgetMonthHint");
    if (m === "2026-11")
      monthHint.textContent =
        "Novembro: as nóminas cobradas o 30/11 son do orzamento de DECEMBRO. Os salarios que financiaron novembro (finais de outubro) non están reconstruídos neste libro; por iso o resultado de novembro pode estar incompleto.";
    else if (m === "2026-12")
      monthHint.textContent =
        "Decembro: inclúe as dúas nóminas previstas para o 30/11 e a paga extra prevista para o 17/12. No calendario bancario seguen aparecendo os cobros coas súas datas reais. Importes pendentes de confirmar.";
    else
      monthHint.textContent =
        "Cada movemento pode ter mes de orzamento distinto da súa data bancaria; edítao desde a ficha. O balance mensual non é o saldo da conta.";
    const visibleBlocks = EASY_BLOCKS.filter((x) => x.id !== "outros" || easyBlockStats(x, m).count);
    $("#simpleMonthGroups").innerHTML = visibleBlocks.map((b) => easyFullBlock(b, m)).join("");
    const rowsForTotals = easyEvents(m).filter(
      (x) => Number.isSafeInteger(x.amount) && x.amount >= 0 && (x.type === "entrada" || x.type === "saida"),
    );
    const sum = (type, done) =>
      rowsForTotals
        .filter((x) => x.type === type && (done === undefined || x.done === done))
        .reduce((acc, x) => acc + x.amount, 0);
    const mIncome = sum("entrada"),
      mExpense = sum("saida"),
      mDiff = mIncome - mExpense;
    $("#monthLedgerIncome").textContent = fmt(mIncome);
    $("#monthLedgerExpense").textContent = fmt(mExpense);
    $("#monthLedgerDifference").textContent = fmt(mDiff);
    $("#monthLedgerIncomeDetail").textContent =
      "Cobrados " + fmt(sum("entrada", true)) + " · Previstos " + fmt(sum("entrada", false));
    $("#monthLedgerExpenseDetail").textContent =
      "Pagados " + fmt(sum("saida", true)) + " · Previstos " + fmt(sum("saida", false));
    const diffCard = $("#monthLedgerDiffCard");
    diffCard.classList.toggle("positive", mDiff > 0);
    diffCard.classList.toggle("negative", mDiff < 0);
    diffCard.querySelector(".month-ledger-sub").textContent =
      m === "2026-11" && mIncome === 0
        ? "Parcial: faltan ingresos dos finais de outubro"
        : "Ingresos − gastos rexistrados; faltan gastos por anotar";
    const tot = easyEvents(m);
    $("#simpleMonthlySummary").innerHTML =
      `<span><b>${esc(MONTH_NAMES[Number(m.split("-")[1]) - 1])} ${esc(m.slice(0, 4))}</b> · ${tot.length} movementos</span><span><b>${tot.filter((x) => x.done).length} confirmados</b> · ${tot.filter((x) => !x.done).length} pendentes ou previstos</span><span>Referencias de outubro non engadidas á previsión</span>`;
  }
  function easyNew(block, it = null) {
    openEvent();
    const f = $("#eventForm");
    f.elements.monthBlock.value = block.id;
    f.elements.monthTemplateId.value = it?.id || "";
    f.elements.type.value = block.id === "ingresos" ? "entrada" : "saida";
    f.elements.name.value = it?.name || "";
    f.elements.trust.value = "declarado";
    f.elements.accountSource.value = "caixabank";
    f.elements.owner.value =
      block.id === "ingresos" && it?.id === "katy"
        ? "Katy"
        : block.id === "ingresos" && it?.id === "carlos"
          ? "Carlos"
          : "Casa";
    f.elements.date.value = ""; // A data non se supón: debe comprobala a persoa.
    if (it?.reference !== null && it?.reference !== undefined) f.elements.amount.value = fromCents(it.reference);
    else f.elements.amount.value = "";
    if (block.id === "variables" && it) {
      if (/comida/i.test(it.name)) {
        f.elements.budgetCategory.value = "food";
        f.elements.amount.value = "";
      } else if (/gasolina/i.test(it.name)) {
        f.elements.budgetCategory.value = "travel";
        f.elements.amount.value = "";
      }
    }
    f.elements.note.value =
      it?.reference != null
        ? "Referencia do orzamento de outubro 2026: comprobar importe e vencemento antes de gardar."
        : "";
    $("#eventDialogTitle").textContent = it
      ? "Anotar " + it.name + " · comproba importe e data"
      : "Novo " + (block.id === "ingresos" ? "ingreso" : "gasto") + " · " + block.name;
    f.elements.date.focus();
  }
  $("#simpleAddCustom").addEventListener("click", () => quickMove("saida"));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-easy-view],[data-easy-add-template],[data-easy-add-block]");
    if (!b) return;
    if (b.dataset.easyView) {
      for (const k of Object.keys(easyOpened))
        if (k.startsWith(selectedMonth + ":") && !k.endsWith(":mycard")) easyOpened[k] = false;
      easyOpened[selectedMonth + ":" + b.dataset.easyView] = true;
      go("mes");
      const node = document.querySelector('[data-easy-open="' + selectedMonth + ":" + b.dataset.easyView + '"]');
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (b.dataset.easyAddTemplate) {
      const sep = b.dataset.easyAddTemplate.indexOf(":");
      const bid = b.dataset.easyAddTemplate.slice(0, sep),
        tid = b.dataset.easyAddTemplate.slice(sep + 1);
      const g = EASY_BLOCKS.find((z) => z.id === bid);
      const t = g?.items.find((i) => i.id === tid);
      if (g && t) easyNew(g, t);
      return;
    }
    if (b.dataset.easyAddBlock) {
      const g = EASY_BLOCKS.find((z) => z.id === b.dataset.easyAddBlock);
      if (g) easyNew(g);
    }
  });
  document.addEventListener("change", (e) => {
    const b = e.target.closest("[data-easy-done]");
    if (!b) return;
    const ev = data.events.find((z) => z.id === b.dataset.easyDone);
    if (!ev) return;
    if (
      b.checked &&
      !confirm(
        "Este movemento xa se cobrou ou pagou e está incluído no saldo real que tes anotado? Se non, actualiza primeiro o saldo da conta.",
      )
    ) {
      b.checked = false;
      return;
    }
    ev.done = b.checked;
    setData();
  });
  document.addEventListener(
    "toggle",
    (e) => {
      const node = e.target;
      if (node.matches?.("[data-easy-open]")) {
        const key = node.dataset.easyOpen;
        easyOpened[key] = node.open;
        if (node.open) {
          document.querySelectorAll("#simpleMonthGroups [data-easy-open]").forEach((other) => {
            if (other !== node && other.open) {
              other.open = false;
              easyOpened[other.dataset.easyOpen] = false;
            }
          });
        }
      }
      if (node.matches?.("[data-easy-aux-open]")) easyOpened[node.dataset.easyAuxOpen] = node.open;
    },
    true,
  );
  let lastDeletedEvent = null;
  function removeEventSafely(eventId) {
    const idx = data.events.findIndex((x) => x.id === eventId);
    if (idx < 0) return;
    const ev = data.events[idx];
    const tag = String(ev.id || "").startsWith("v74-mycard-")
      ? "\n\nEste cargo procede da captura de MyCard. Eliminar o seu vencemento NON cancela a débeda nin o cargo bancario."
      : "";
    if (
      !confirm(
        `Borrar «${ev.name}» (${fmtDate(ev.date)}, ${fmt(ev.amount)})?\n\nSó se elimina este movemento do calendario. Non cambia o saldo real, cotas de préstamos nin débedas.${tag}\n\nPoderás desfacer este borrado mentres manteñas aberta esta páxina.`,
      )
    )
      return;
    lastDeletedEvent = {
      event: { ...ev },
      index: idx,
      seedWasSuppressed: (data.suppressedSeedEventIds || []).includes(ev.id),
    };
    if (V74_EVENTS.some((x) => x.id === ev.id)) {
      data.suppressedSeedEventIds = [...new Set([...(data.suppressedSeedEventIds || []), ev.id])];
    }
    data.events.splice(idx, 1);
    $("#eventDialog").close?.();
    $("#deletedEventMessage").textContent = `Eliminado: ${ev.name} · ${fmt(ev.amount)}`;
    $("#undoDeletedEvent").hidden = false;
    setData();
  }
  $("#deleteEventFromDialog").addEventListener("click", () => {
    const k = $("#eventForm").elements.id.value;
    if (k) removeEventSafely(k);
  });
  $("#undoEventDelete").addEventListener("click", () => {
    if (!lastDeletedEvent) return;
    const saved = lastDeletedEvent;
    lastDeletedEvent = null;
    if (!data.events.some((x) => x.id === saved.event.id))
      data.events.splice(Math.min(saved.index, data.events.length), 0, saved.event);
    if (V74_EVENTS.some((x) => x.id === saved.event.id) && !saved.seedWasSuppressed)
      data.suppressedSeedEventIds = (data.suppressedSeedEventIds || []).filter((id) => id !== saved.event.id);
    $("#undoDeletedEvent").hidden = true;
    setData();
  });
  $("#dismissDeleted").addEventListener("click", () => {
    $("#undoDeletedEvent").hidden = true;
    lastDeletedEvent = null;
  });
  const easyOldRender = render;
  render = function () {
    easyOldRender();
    renderEasy();
  };
  const easyOldMonthRender = renderMonthScreen;
  renderMonthScreen = function () {
    easyOldMonthRender();
    renderEasy();
  };
  /* V7.12 · asignación asistida, sempre modificable. Os rexistros con mes
   explícito non se reasignan cando cambia a data, salvo decisión manual. */
  const budgetForm = $("#eventForm");
  for (const field of ["date", "name", "type"])
    budgetForm.elements[field].addEventListener("change", () => {
      const m = budgetForm.elements.budgetMonth;
      if (m.dataset.auto === "true")
        m.value = budgetMonthFor(
          budgetForm.elements.date.value,
          budgetForm.elements.name.value,
          budgetForm.elements.type.value,
        );
    });
  budgetForm.elements.budgetMonth.addEventListener("input", () => {
    budgetForm.elements.budgetMonth.dataset.auto = "false";
  });
  /* ═════ FIN V7.9 ═════ */

  /* MAUSOLEO V10.0 · evolución de V9.8 e V9.9. Inxectado dentro do IIFE financeiro,
   co mesmo modelo de datos e a mesma STORAGE. Non accede a redes externas. */
  const V10_LIMIT_RECONS = 500,
    V10_LIMIT_HOUSE = 500;
  function v10Ensure() {
    if (!data.v10 || typeof data.v10 !== "object" || Array.isArray(data.v10)) data.v10 = {};
    if (!Array.isArray(data.v10.reconciliations)) data.v10.reconciliations = [];
    if (!Array.isArray(data.v10.houseSnapshots)) data.v10.houseSnapshots = [];
    if (!Number.isSafeInteger(data.v10.houseGoalCents) || data.v10.houseGoalCents < 0) data.v10.houseGoalCents = null;
  }
  function v10CheckModel(p) {
    if (p.v10 === undefined) return true;
    const o = p.v10;
    if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error("Centro V10: estrutura incorrecta");
    if (
      o.houseGoalCents !== null &&
      o.houseGoalCents !== undefined &&
      (!Number.isSafeInteger(o.houseGoalCents) || o.houseGoalCents < 0 || o.houseGoalCents > 99999999999)
    )
      throw new Error("Meta vivenda incorrecta");
    for (const [key, limit] of [
      ["houseSnapshots", V10_LIMIT_HOUSE],
      ["reconciliations", V10_LIMIT_RECONS],
    ]) {
      if (o[key] !== undefined) {
        if (!Array.isArray(o[key]) || o[key].length > limit) throw new Error("Historial V10 demasiado grande: " + key);
        v97UniqueIds(o[key], key);
        for (const row of o[key]) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date || "")) throw new Error("Data inválida en " + key);
          if (
            key === "houseSnapshots" &&
            (!Number.isSafeInteger(row.amountCents) || row.amountCents < 0 || row.amountCents > 99999999999)
          )
            throw new Error("Saldo de vivenda inválido");
          if (
            key === "reconciliations" &&
            (!Number.isSafeInteger(row.balanceAfterCents) ||
              !Number.isSafeInteger(row.balanceBeforeCents) ||
              !Array.isArray(row.eventIds) ||
              row.eventIds.length > 10000 ||
              !row.eventIds.every((z) => typeof z === "string"))
          )
            throw new Error("Conciliación inválida");
        }
      }
    }
    return true;
  }
  function v10Commit(change) {
    if (!saveLocal) {
      alert(
        "O gardado local está desactivado. Actívao en Configuración e verifica a copia externa antes de introducir datos financeiros; non gardamos cambios silenciosamente só en memoria.",
      );
      go("axustes");
      return false;
    }
    const before = JSON.stringify(data);
    try {
      change();
      v10Ensure();
      v97CheckBackup(data);
      v10CheckModel(data);
      data.version = VERSION;
      if (!setData()) {
        data = JSON.parse(before);
        render();
        alert("Non se aplicou a operación: fallou o gardado. A copia previa segue intacta.");
        return false;
      }
      return true;
    } catch (e) {
      data = JSON.parse(before);
      render();
      alert("Non se puido completar a operación: " + e.message);
      return false;
    }
  }
  const v10DateAge = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return null;
    const a = new Date(s + "T12:00:00"),
      b = new Date(localToday() + "T12:00:00");
    return Math.round((b - a) / 86400000);
  };
  const v10Money = (n) => (Number.isSafeInteger(n) ? fmt(n) : "Sen dato");
  const v10Main = () =>
    mainAccounts()
      .filter(effective)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0] || null;
  const v10MonthName = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    return MONTH_NAMES[m - 1][0].toUpperCase() + MONTH_NAMES[m - 1].slice(1) + " " + y;
  };
  const v10HouseSorted = () => {
    v10Ensure();
    return data.v10.houseSnapshots
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || "").localeCompare(a.createdAt || ""));
  };
  const v10LatestHouse = () => v10HouseSorted()[0] || null;
  function v10OpenQuick(type = "saida") {
    const f = $("#v10QuickForm");
    f.reset();
    f.elements.type.value = type;
    f.elements.date.value = localToday();
    f.elements.accountSource.value = "caixabank";
    $("#v10QuickTitle").textContent = type === "saida" ? "Novo gasto en segundos" : "Novo ingreso en segundos";
    const names = [
      ...new Set(
        data.events
          .filter((x) => x.type === type)
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((x) => x.name)
          .filter(Boolean),
      ),
    ].slice(0, 80);
    $("#v10Concepts").innerHTML = names.map((n) => `<option value="${esc(n)}"></option>`).join("");
    $("#v10QuickDialog").showModal();
    f.elements.name.focus();
  }
  function v10RenderDue() {
    const today = localToday(),
      last = addDays(today, 30);
    const soon = data.events
      .filter((x) => !x.done && x.date <= last && effective(x))
      .sort((a, b) => a.date.localeCompare(b.date));
    const due = soon.slice(0, 9);
    $("#v10DueList").innerHTML = due.length
      ? due
          .map(
            (x) =>
              `<div class="v10-line" data-v10-swipe="${esc(x.id)}"><div class="date">${esc(fmtDate(x.date))}</div><div><strong>${esc(x.name)}</strong><small>${esc(x.accountSource === "caixabank" ? "CaixaBank" : bankLabel(x))} · ${x.trust === "acreditado" ? "Acreditado" : "Declarado"}${x.date < today ? " · DATA PASADA" : ""}</small></div><div class="amt secret ${x.type === "saida" ? "neg" : "pos"}">${x.type === "saida" ? "−" : "+"}${fmt(x.amount)}</div><button class="btn sm v10-rowbtn v10-action" data-v10-mark="${esc(x.id)}" type="button">Comprobar</button></div>`,
          )
          .join("")
      : '<div class="blank">Non hai movementos pendentes cos datos actualmente incluídos.</div>';
  }
  function v10RenderAlerts() {
    const main = v10Main(),
      age = main ? v10DateAge(main.date) : null,
      today = localToday();
    let alerts = [];
    if (!main)
      alerts.push({
        w: true,
        s: "Falta un saldo acreditado ou declarado da conta principal. A previsión non pode tomarse como dispoñible.",
      });
    else if (age === null) alerts.push({ w: true, s: "A data do saldo principal non é válida." });
    else if (age > 7)
      alerts.push({
        w: true,
        s: `Saldo bancario sen comprobar desde hai ${age} días (${fmtDate(main.date)}). Actualízao antes de decidir pagamentos.`,
      });
    else if (age < 0) alerts.push({ w: true, s: "A data do saldo principal está no futuro. Compróbaa." });
    const uncertain = data.events.filter((x) => !x.done && x.accountSource === "por_confirmar" && x.date >= today);
    if (uncertain.length)
      alerts.push({
        w: true,
        s: `${uncertain.length} movemento(s) futuros sen conta bancaria asignada: non están no fluxo de CaixaBank.`,
      });
    const past = data.events.filter((x) => !x.done && x.date < today && effective(x));
    if (past.length)
      alerts.push({
        w: true,
        s: `${past.length} movemento(s) de data pasada aínda sen marcar como reflectidos. Verifica o extracto; non se dan por pagados automaticamente.`,
      });
    const old = data.currentDebts.filter(
      (x) => !["pagada", "arquivada"].includes(x.status) && v10DateAge(x.checkedAt || x.sourceDate) > 60,
    );
    if (old.length)
      alerts.push({
        w: true,
        s: `${old.length} ficha(s) de obrigas actuais sen comprobación recente (máis de 60 días). Os importes poden estar desactualizados.`,
      });
    alerts.push({
      w: false,
      s: "Os expedientes antigos non se suman ao total das obrigas actuais. Unha débeda histórica non equivale a saldo esixible confirmado.",
    });
    if (alerts.length === 1)
      alerts.unshift({ w: false, s: "Sen alertas adicionais de saldo ou vencementos, segundo o rexistro local." });
    $("#v10Alerts").innerHTML = alerts
      .map((x) => `<div class="v10-alert ${x.w ? "warn" : ""}">${esc(x.s)}</div>`)
      .join("");
  }
  function v10RenderDebts() {
    const opened = data.currentDebts.filter((x) => !["pagada", "arquivada"].includes(x.status));
    const total = opened.reduce((s, x) => s + remainingCurrent(x), 0),
      base = opened.reduce((s, x) => s + x.amountCents, 0),
      paid = opened.reduce((s, x) => s + Math.min(x.amountCents, paymentsTotal(x.payments)), 0);
    const knownPrincipal = opened.filter((x) => Number.isSafeInteger(x.principalCents));
    const knownInterest = opened.filter(
      (x) => Number.isSafeInteger(x.interestCents) || Number.isSafeInteger(x.feesCents),
    );
    const capital = knownPrincipal.reduce((s, x) => s + x.principalCents, 0),
      extras = knownInterest.reduce((s, x) => s + (x.interestCents || 0) + (x.feesCents || 0), 0);
    $("#v10DebtTotal").textContent = fmt(total);
    $("#v10PaidDebts").textContent = fmt(paid);
    $("#v10DebtBase").textContent = fmt(base);
    $("#v10DebtPaid").textContent = fmt(paid);
    $("#v10DebtCapital").textContent = knownPrincipal.length ? fmt(capital) : "Sen desglose";
    $("#v10DebtInterest").textContent = knownInterest.length ? fmt(extras) : "Sen desglose";
    $("#v10DebtCaption").textContent =
      `Progreso rexistrado: ${base ? Math.round((100 * paid) / base) : 0} % sobre a base das ${opened.length} fichas abertas. Desglose de capital dispoñible en ${knownPrincipal.length}/${opened.length} e xuros/comisións en ${knownInterest.length}/${opened.length}. Non equivale a capital vivo nin a liquidación do acredor.`;
    $("#v10DebtBar").style.width = (base ? Math.min(100, (100 * paid) / base) : 0).toFixed(1) + "%";
  }
  function v10RenderHouse() {
    const snap = v10LatestHouse(),
      goal = data.v10.houseGoalCents;
    $("#v10HouseSaved").textContent = snap ? v10Money(snap.amountCents) : "Sen rexistro";
    $("#v10HouseBalance").textContent = snap ? v10Money(snap.amountCents) : "Sen rexistro";
    $("#v10HouseGoal").textContent = goal !== null ? v10Money(goal) : "Sen definir";
    $("#v10HouseBar").style.width =
      goal > 0 && snap ? Math.min(100, (snap.amountCents / goal) * 100).toFixed(1) + "%" : "0%";
    $("#v10HouseCaption").textContent = snap
      ? `${fmtDate(snap.date)} · ${snap.trust === "acreditado" ? "Comprobado no banco" : "Declarado"}. ${goal > 0 ? Math.min(100, Math.round((100 * snap.amountCents) / goal)) + " % da meta rexistrada." : ""} Non se suma ao saldo principal para evitar duplicidades.`
      : "Rexistra un saldo dedicado ao aforro só se está comprobado. Non se supón unha cifra inicial.";
    const list = v10HouseSorted().slice(0, 4);
    $("#v10HouseHistory").innerHTML = list.length
      ? list
          .map(
            (x) =>
              `<div class="v10-line"><div class="date">${esc(fmtDate(x.date))}</div><div><strong>Saldo gardado</strong><small>${esc(x.note || x.trust || "Sen nota")}</small></div><div class="amt secret">${fmt(x.amountCents)}</div><button class="btn sm v10-rowbtn v10-action" data-v10-delete-house="${esc(x.id)}" type="button">Eliminar</button></div>`,
          )
          .join("")
      : '<div class="v10-muted">Sen entradas de aforro aínda.</div>';
  }
  function v10RenderLanes() {
    const now = localToday(),
      end = addDays(now, 30),
      days = data.events.filter((x) => x.date >= now && x.date <= end && effective(x));
    const actualExpense = data.events
      .filter((x) => x.done && x.type === "saida" && (x.date || "").slice(0, 7) === now.slice(0, 7))
      .reduce((a, x) => a + x.amount, 0);
    const upcoming = days
      .filter((x) => !x.done && x.type === "saida" && x.accountSource === "caixabank")
      .reduce((a, x) => a + x.amount, 0);
    const dueDebt = data.currentDebts.filter(
      (x) => !["pagada", "arquivada"].includes(x.status) && x.due && x.due >= now && x.due <= end,
    ).length;
    const doneCount = data.events.filter((x) => x.done && (x.date || "").slice(0, 7) === now.slice(0, 7)).length;
    $("#v10FourLanes").innerHTML =
      `<div class="v10-bit"><label>Xa rexistrado como pagado · este mes</label><strong class="secret">${fmt(actualExpense)}</strong></div><div class="v10-bit"><label>Saídas pendentes en CaixaBank · 30 días</label><strong class="secret">${fmt(upcoming)}</strong></div><div class="v10-bit"><label>Fichas con vencemento indicado · 30 días</label><strong>${dueDebt}</strong></div><div class="v10-bit"><label>Movementos marcados como reflectidos · mes</label><strong>${doneCount}</strong></div>`;
  }
  function v10RenderMonths() {
    const now = localToday().slice(0, 7);
    let months = [];
    for (let offset = 5; offset >= 0; offset--) {
      const ym = shiftMonth(now, -offset),
        items = data.events.filter((x) => (x.date || "").startsWith(ym));
      const ins = items.filter((x) => x.done && x.type === "entrada").reduce((s, x) => s + x.amount, 0),
        outs = items.filter((x) => x.done && x.type === "saida").reduce((s, x) => s + x.amount, 0),
        pending = items.filter((x) => !x.done && x.type === "saida").reduce((s, x) => s + x.amount, 0);
      months.push(
        `<tr><td>${esc(v10MonthName(ym))}</td><td class="secret">${fmt(ins)}</td><td class="secret">${fmt(outs)}</td><td class="secret">${fmt(ins - outs)}</td><td class="secret">${fmt(pending)}</td></tr>`,
      );
    }
    $("#v10MonthRows").innerHTML = months.join("");
  }
  function v10RenderRecons() {
    $("#v10ReconHistory").innerHTML =
      data.v10.reconciliations
        .slice()
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 4)
        .map((x) => {
          const name = data.accounts.find((a) => a.id === x.accountId)?.name || "Conta rexistrada";
          return `<div class="v10-line"><div class="date">${esc(fmtDate(x.date))}</div><div><strong>${esc(name)}</strong><small>${x.eventIds.length} movemento(s) conciliado(s) · ${esc(x.note || "Comprobación manual")}</small></div><div class="amt secret">${fmt(x.balanceAfterCents)}</div></div>`;
        })
        .join("") || '<div class="v10-muted">Aínda non fixeches unha conciliación nesta versión.</div>';
  }
  function v10Search() {
    const q = $("#v10Search").value.trim().toLocaleLowerCase("gl");
    const out = $("#v10SearchResults");
    if (q.length < 2) {
      out.innerHTML = '<p class="v10-note">Escribe polo menos dúas letras para buscar en rexistros locais.</p>';
      return;
    }
    const es = data.events
      .filter((x) => [x.name, x.owner, x.note].join(" ").toLocaleLowerCase("gl").includes(q))
      .slice(0, 10)
      .map((x) => ({ kind: "event", id: x.id, label: x.name, subtitle: fmtDate(x.date) + " · " + fmt(x.amount) }));
    const ds = data.currentDebts
      .filter((x) => [x.name, x.owner, x.notes].join(" ").toLocaleLowerCase("gl").includes(q))
      .slice(0, 10)
      .map((x) => ({
        kind: "current",
        id: x.id,
        label: x.name,
        subtitle: "Débeda actual · " + fmt(remainingCurrent(x)),
      }));
    const res = [...es, ...ds];
    out.innerHTML =
      res
        .map(
          (x) =>
            `<button type="button" data-v10-result="${esc(x.kind)}" data-v10-id="${esc(x.id)}"><span>${esc(x.label)}</span><small>${esc(x.subtitle)}</small></button>`,
        )
        .join("") || '<p class="v10-note">Non hai coincidencias nos datos locais.</p>';
  }
  function v10Render() {
    v10Ensure();
    if (!$("#v10Balance")) return;
    const main = v10Main(),
      has = balanceKnown(),
      today = localToday();
    $("#v10Balance").textContent = main ? fmt(main.amount) : "Sen saldo";
    $("#v10BalanceDate").textContent = main ? `Último dato: ${fmtDate(main.date)}` : "Engade un saldo comprobado";
    const age = main ? v10DateAge(main.date) : null;
    $("#v10BalanceAge").textContent =
      age === null
        ? "Sen data"
        : age === 0
          ? "Comprobado hoxe"
          : age > 0
            ? `Hai ${age} día(s)`
            : "Data posterior a hoxe";
    const items = bankEvents();
    const inc = items.filter((x) => x.type === "entrada").reduce((s, x) => s + x.amount, 0),
      out = items.filter((x) => x.type === "saida").reduce((s, x) => s + x.amount, 0);
    $("#v10Forecast").textContent = has ? "≈ " + fmt(balance() + inc - out) : "Non calculable";
    $("#v10NextIncome").textContent = fmt(inc);
    $("#v10NextExpense").textContent = fmt(out);
    const near = addDays(today, 7);
    $("#v10PendingCount").textContent = String(
      data.events.filter((x) => !x.done && x.date <= near && effective(x)).length,
    );
    v10RenderDue();
    v10RenderAlerts();
    v10RenderDebts();
    v10RenderHouse();
    v10RenderLanes();
    v10RenderMonths();
    v10RenderRecons();
    v10Search();
  }
  function v10OpenRecon() {
    v10Ensure();
    const f = $("#v10ReconForm");
    f.reset();
    f.elements.date.value = localToday();
    $("#v10ReconAccount").innerHTML = data.accounts
      .map((x) => `<option value="${esc(x.id)}">${esc(x.name)} · ${esc(fmtDate(x.date))}</option>`)
      .join("");
    if (!data.accounts.length) {
      alert("Antes de conciliar crea un saldo en Rexistros.");
      go("datos");
      return;
    }
    const main = v10Main();
    if (main) f.elements.accountId.value = main.id;
    v10ReconChoices();
    $("#v10ReconDialog").showModal();
  }
  function v10ReconChoices() {
    const f = $("#v10ReconForm"),
      a = data.accounts.find((x) => x.id === f.elements.accountId.value);
    if (!a) return;
    const date = f.elements.date.value,
      source = accountRole(a) === "principal" ? "caixabank" : /abanca/i.test(a.name) ? "abanca" : null;
    $("#v10ReconInfo").textContent =
      `Saldo anterior: ${fmt(a.amount)} (${fmtDate(a.date)}). Selecciona só movementos presentes no extracto. Nada se marca automaticamente. ${source ? "" : "Conta sen correspondencia de movementos identificada."}`;
    const choices = source
      ? data.events
          .filter((x) => !x.done && x.accountSource === source && x.date && x.date <= date)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 100)
      : [];
    $("#v10ReconChoices").innerHTML = choices.length
      ? choices
          .map(
            (x) =>
              `<label class="v10-checkitem"><input type="checkbox" name="eventId" value="${esc(x.id)}"/><span>${esc(fmtDate(x.date))} · ${esc(x.name)} · ${fmt(x.amount)} ${x.type === "saida" ? "saída" : "entrada"}</span></label>`,
          )
          .join("")
      : '<p class="v10-note">Sen movementos identificados anteriores a esa data. Podes actualizar o saldo sen marcar recibos.</p>';
  }
  function v10OpenHouse() {
    v10Ensure();
    const f = $("#v10HouseForm");
    f.reset();
    f.elements.goal.value = data.v10.houseGoalCents !== null ? fromCents(data.v10.houseGoalCents) : "";
    f.elements.date.value = localToday();
    $("#v10HouseDialog").showModal();
  }
  $("#v10QuickExpense").addEventListener("click", () => v10OpenQuick("saida"));
  $("#v10QuickIncome").addEventListener("click", () => v10OpenQuick("entrada"));
  $("#v10Reconcile").addEventListener("click", v10OpenRecon);
  $("#v10ReconcileAlt").addEventListener("click", v10OpenRecon);
  $("#v10HouseEdit").addEventListener("click", v10OpenHouse);
  $("#v10Search").addEventListener("input", v10Search);
  $("#v10ReconAccount").addEventListener("change", v10ReconChoices);
  $("#v10ReconForm").elements.date.addEventListener("change", v10ReconChoices);
  $("#v10QuickForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const name = f.elements.name.value.trim(),
        amount = parseEuro(f.elements.amount.value),
        date = f.elements.date.value,
        type = f.elements.type.value;
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date) || amount <= 0 || !["entrada", "saida"].includes(type))
        throw new Error("Revisa concepto, data e importe");
      if (
        data.events.some(
          (x) =>
            x.date === date &&
            x.type === type &&
            x.amount === amount &&
            x.name.trim().toLowerCase() === name.toLowerCase() &&
            x.accountSource === f.elements.accountSource.value,
        )
      ) {
        if (
          !confirm(
            "Xa existe un movemento co mesmo concepto, data, importe e conta. Queres engadir outro de todos os xeitos?",
          )
        )
          return;
      }
      const match = data.events
        .slice()
        .reverse()
        .find((x) => x.name.trim().toLowerCase() === name.toLowerCase() && x.type === type);
      const x = {
        id: id(),
        name,
        date,
        type,
        amount,
        owner: match?.owner || "Casa",
        trust: f.elements.trust.value,
        group: f.elements.group.value,
        budgetCategory: match?.budgetCategory || "",
        budgetMonth: budgetMonthFor(date, name, type),
        monthBlock: "",
        monthTemplateId: "",
        done: false,
        accountSource: f.elements.accountSource.value,
        note: "",
      };
      if (v10Commit(() => data.events.push(x))) {
        $("#v10QuickDialog").close();
        go("recuperacion");
      }
    } catch (ex) {
      alert(ex.message);
    }
  });
  $("#v10ReconForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const a = data.accounts.find((x) => x.id === f.elements.accountId.value),
        amount = parseEuro(f.elements.amount.value),
        date = f.elements.date.value;
      if (!a) throw new Error("Conta inexistente");
      if (date < (a.date || ""))
        throw new Error("A nova data non pode ser anterior á fotografía actual: revisa o saldo antes.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Data inválida");
      const marked = Array.from(f.querySelectorAll('input[name="eventId"]:checked')).map((x) => x.value),
        source = accountRole(a) === "principal" ? "caixabank" : /abanca/i.test(a.name) ? "abanca" : null;
      if (
        marked.some(
          (k) => !data.events.some((x) => x.id === k && !x.done && x.accountSource === source && x.date <= date),
        )
      )
        throw new Error("A selección contén un movemento incompatible");
      if (
        !confirm(
          `Conciliar ${a.name} co saldo ${fmt(amount)} a ${fmtDate(date)} e marcar ${marked.length} movemento(s) incluídos no extracto? O saldo é o valor que ti comprobaches, non unha suma calculada pola app.`,
        )
      )
        return;
      const ok = v10Commit(() => {
        const before = a.amount;
        a.amount = amount;
        a.date = date;
        a.trust = "acreditado";
        for (const x of data.events) if (marked.includes(x.id)) x.done = true;
        data.v10.reconciliations.push({
          id: id(),
          date,
          accountId: a.id,
          balanceBeforeCents: before,
          balanceAfterCents: amount,
          eventIds: marked,
          createdAt: new Date().toISOString(),
          note: f.elements.note.value.trim(),
        });
        if (data.v10.reconciliations.length > V10_LIMIT_RECONS) data.v10.reconciliations.shift();
      });
      if (ok) $("#v10ReconDialog").close();
    } catch (ex) {
      alert(ex.message);
    }
  });
  $("#v10HouseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const goal = f.elements.goal.value.trim() === "" ? null : parseEuro(f.elements.goal.value),
        isNew = f.elements.balance.value.trim() !== "";
      const amount = isNew ? parseEuro(f.elements.balance.value) : null,
        date = f.elements.date.value;
      if (goal !== null && goal < 0) throw new Error("O obxectivo non pode ser negativo");
      if (isNew && (amount < 0 || amount > 99999999999)) throw new Error("O saldo reservado debe ser positivo ou cero");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Data inválida");
      if (!isNew && goal === data.v10.houseGoalCents) throw new Error("Non hai cambios que gardar");
      if (
        v10Commit(() => {
          data.v10.houseGoalCents = goal;
          if (isNew) {
            data.v10.houseSnapshots.push({
              id: id(),
              date,
              amountCents: amount,
              trust: f.elements.trust.value,
              note: f.elements.note.value.trim(),
              createdAt: new Date().toISOString(),
            });
            if (data.v10.houseSnapshots.length > V10_LIMIT_HOUSE) data.v10.houseSnapshots.shift();
          }
        })
      )
        $("#v10HouseDialog").close();
    } catch (ex) {
      alert(ex.message);
    }
  });
  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-v10-close]");
    if (close) {
      $("#" + close.dataset.v10Close)?.close();
      return;
    }
    const mark = e.target.closest("[data-v10-mark]");
    if (mark) {
      const x = data.events.find((z) => z.id === mark.dataset.v10Mark);
      if (!x || x.done) return;
      if (
        !confirm(
          `«${x.name}» (${fmt(x.amount)}). Só márcao se xa aparece incluído no último saldo bancario rexistrado. Se aínda non actualizaches o saldo, usa antes «Conciliar conta». Continuar?`,
        )
      )
        return;
      v10Commit(() => (x.done = true));
      return;
    }
    const del = e.target.closest("[data-v10-delete-house]");
    if (del) {
      const row = data.v10.houseSnapshots.find((x) => x.id === del.dataset.v10DeleteHouse);
      if (
        row &&
        confirm(
          `Eliminar o saldo de aforro rexistrado o ${fmtDate(row.date)} (${fmt(row.amountCents)})? Isto non borra movementos bancarios.`,
        )
      )
        v10Commit(() => (data.v10.houseSnapshots = data.v10.houseSnapshots.filter((x) => x.id !== row.id)));
      return;
    }
    const result = e.target.closest("[data-v10-result]");
    if (result) {
      const kind = result.dataset.v10Result,
        key = result.dataset.v10Id;
      if (kind === "event") {
        const row = data.events.find((x) => x.id === key);
        if (row) openEvent(row);
      } else if (kind === "current") openCurrent(key);
      return;
    }
  });
  let v10TouchStart = null;
  $("#v10DueList").addEventListener(
    "touchstart",
    (e) => {
      const r = e.target.closest("[data-v10-swipe]");
      if (r && e.touches.length === 1)
        v10TouchStart = { id: r.dataset.v10Swipe, x: e.touches[0].clientX, y: e.touches[0].clientY };
      else v10TouchStart = null;
    },
    { passive: true },
  );
  $("#v10DueList").addEventListener(
    "touchend",
    (e) => {
      if (!v10TouchStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - v10TouchStart.x,
        dy = e.changedTouches[0].clientY - v10TouchStart.y,
        id0 = v10TouchStart.id;
      v10TouchStart = null;
      if (dx > 95 && Math.abs(dy) < 45) {
        const b = Array.from($("#v10DueList").querySelectorAll("[data-v10-mark]")).find(
          (x) => x.dataset.v10Mark === id0,
        );
        b?.click();
      }
    },
    { passive: true },
  );
  const v10OldRender = render;
  render = function () {
    v10OldRender();
    v10Render();
  };
  v10Ensure();

  /* MAUSOLEO 10.1 · Compromisos persoais. Integrado no mesmo libro de datos.
   NON altera currentDebts nin totals de balances, contas, hipoteca ou eventos. */
  const MORAL_STATES = {
    por_verificar: "Pendente de revisar",
    en_xestion: "En marcha",
    pagada: "Resolto / compensado",
    arquivada: "Arquivado",
  };
  const MORAL_KINDS = ["Detalle", "Favor", "Devolución de ben", "Compromiso persoal", "Cartos pendentes", "Outro"];
  function safeMoralDebts(rows) {
    if (!Array.isArray(rows)) return MORAL_SEED.map(moralCopy);
    return rows
      .slice(0, 300)
      .filter(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof x.name === "string" &&
          x.name.trim() &&
          (x.amountCents === null ||
            (Number.isSafeInteger(x.amountCents) && x.amountCents >= 0 && x.amountCents <= 99999999999)),
      )
      .map((x) => ({
        id: String(x.id || id()).slice(0, 90),
        name: String(x.name).trim().slice(0, 100),
        amountCents: x.amountCents == null ? null : x.amountCents,
        owner: ["Carlos", "Katy", "Casa", "Por confirmar"].includes(x.owner) ? x.owner : "Carlos",
        kind: MORAL_KINDS.includes(x.kind) ? x.kind : "Compromiso persoal",
        confidence: CURRENT_CONFIDENCE[x.confidence] ? x.confidence : "declarado",
        status: MORAL_STATES[x.status] ? x.status : "por_verificar",
        checkedAt: /^\d{4}-\d{2}-\d{2}$/.test(x.checkedAt || "") ? x.checkedAt : "",
        due: /^\d{4}-\d{2}-\d{2}$/.test(x.due || "") ? x.due : "",
        notes: String(x.notes || "").slice(0, 4000),
        sourceDate: String(x.sourceDate || "").slice(0, 10),
        principalCents: validBreakdownCents(x.principalCents),
        interestCents: validBreakdownCents(x.interestCents),
        feesCents: validBreakdownCents(x.feesCents),
        payments: cleanPayments(x.payments),
        attachments: cleanFiles(x.attachments || []),
        reviewed: Boolean(x.reviewed),
        amountBasis: ["orientativo", "acordado", "sen_importe"].includes(x.amountBasis)
          ? x.amountBasis
          : x.amountCents == null
            ? "sen_importe"
            : "orientativo",
      }));
  }
  let activeMoralId = null,
    moralPendingAttachments = [];
  const moralOpen = () => data.moralDebts.filter((x) => !["pagada", "arquivada"].includes(x.status));
  const moralRemainder = (x) => (x.amountCents == null ? null : Math.max(0, x.amountCents - paymentsTotal(x.payments)));
  function renderMoralDebts() {
    const cards = $("#moralCards");
    if (!cards) return;
    if (!Array.isArray(data.moralDebts)) data.moralDebts = MORAL_SEED.map(moralCopy);
    const open = moralOpen(),
      known = open.filter((x) => x.amountCents != null),
      tot = known.reduce((s, x) => s + moralRemainder(x), 0);
    const unpriced = open.filter((x) => x.amountCents == null).length;
    $("#moralOpen").textContent = String(open.length);
    $("#moralKnown").textContent = fmt(tot);
    $("#moralUnknown").textContent = String(unpriced);
    $("#moralResolved").textContent = String(data.moralDebts.filter((x) => x.status === "pagada").length);
    const q = $("#moralSearch").value.trim().toLocaleLowerCase("gl");
    const filter = $("#moralFilter").value,
      sort = $("#moralSort").value;
    let rows = data.moralDebts.filter((x) => {
      if (filter === "abertas" && ["pagada", "arquivada"].includes(x.status)) return false;
      if (filter === "pendentes" && x.amountCents != null) return false;
      if (filter === "con_importe" && x.amountCents == null) return false;
      if (filter === "resoltas" && x.status !== "pagada") return false;
      if (filter === "arquivadas" && x.status !== "arquivada") return false;
      return [x.name, x.notes, x.kind].join(" ").toLocaleLowerCase("gl").includes(q);
    });
    rows.sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "gl")
        : sort === "priority"
          ? (b.amountCents ?? -1) - (a.amountCents ?? -1)
          : ["por_verificar", "en_xestion", "pagada", "arquivada"].indexOf(a.status) -
              ["por_verificar", "en_xestion", "pagada", "arquivada"].indexOf(b.status) ||
            a.name.localeCompare(b.name, "gl"),
    );
    $("#moralCount").textContent =
      `${rows.length} fichas visibles de ${data.moralDebts.length} · cifras orientativas non incluídas no pasivo bancario.`;
    cards.innerHTML =
      rows
        .map((x) => {
          const val = moralRemainder(x),
            pct = x.amountCents > 0 ? Math.min(100, Math.round((paymentsTotal(x.payments) * 100) / x.amountCents)) : 0;
          return `<article class="moral-card"><div class="moral-avatar">${esc(x.name.slice(0, 1).toLocaleUpperCase("gl"))}</div><div class="moral-main"><strong>${esc(x.name)}</strong><small>${esc(x.kind)} · ${esc(MORAL_STATES[x.status])}</small><p>${esc(x.notes || "Compromiso pendente de revisar.").slice(0, 155)}</p>${x.amountCents != null ? `<div class="moral-progress"><i style="width:${pct}%"></i></div>` : ""}</div><div class="moral-card-side"><strong class="secret">${val == null ? "Sen cifra" : fmt(val)}</strong><span>${x.amountCents == null ? "Por determinar" : x.amountBasis === "acordado" ? "Acordado · anotado" : "Orientativo · histórico"}</span><button type="button" class="btn sm moral-open-button" data-moral-open="${esc(x.id)}">Abrir ficha</button></div></article>`;
        })
        .join("") ||
      '<div class="moral-empty">Non hai fichas para este filtro. Podes crear un compromiso novo ou cambiar a busca.</div>';
  }
  function renderMoralAttachments() {
    $("#moralAttachList").innerHTML =
      moralPendingAttachments
        .map(
          (a) =>
            `<div class="attachment-card"><span class="attachment-icon">${a.type === "application/pdf" ? "PDF" : a.type.startsWith("image/") ? "IMG" : "DOC"}</span><div class="attachment-meta"><strong>${esc(a.name)}</strong><small>${(a.size / 1024 / 1024).toFixed(2)} MB</small><div class="attachment-actions"><button type="button" class="btn sm" data-moral-file-save="${esc(a.id)}">Gardar</button><button type="button" class="btn sm danger" data-moral-file-del="${esc(a.id)}">Quitar</button></div></div></div>`,
        )
        .join("") || '<div class="blank">Sen documentos incorporados</div>';
    $("#moralAttachHint").textContent =
      `${moralPendingAttachments.length} anexos · exporta unha copia para protexelos.`;
  }
  function openMoral(key) {
    const x = data.moralDebts.find((q) => q.id === key) || null;
    activeMoralId = key || null;
    const f = $("#moralDebtForm");
    f.reset();
    f.elements.id.value = x?.id || "";
    f.elements.name.value = x?.name || "";
    f.elements.amount.value = x?.amountCents == null ? "" : fromCents(x.amountCents);
    f.elements.owner.value = x?.owner || "Carlos";
    f.elements.kind.value = x?.kind || "Compromiso persoal";
    f.elements.confidence.value = x?.confidence || "declarado";
    f.elements.status.value = x?.status || "por_verificar";
    f.elements.checkedAt.value = x?.checkedAt || "";
    f.elements.due.value = x?.due || "";
    f.elements.notes.value = x?.notes || "";
    f.elements.principal.value = x?.principalCents == null ? "" : fromCents(x.principalCents);
    f.elements.interest.value = x?.interestCents == null ? "" : fromCents(x.interestCents);
    f.elements.fees.value = x?.feesCents == null ? "" : fromCents(x.feesCents);
    f.elements.amountBasis.value = x?.amountBasis || "orientativo";
    moralPendingAttachments = cleanFiles(x?.attachments || []);
    renderMoralAttachments();
    $("#moralDebtTitle").textContent = x?.name || "Novo compromiso persoal";
    $("#moralDebtDialog").showModal();
    setMoralMode(x ? "read" : "edit");
  }
  function setMoralMode(mode) {
    const d = $("#moralDebtDialog");
    d.classList.toggle("mode-read", mode === "read");
    d.classList.toggle("mode-edit", mode === "edit");
    if (mode === "read") renderMoralRead();
  }
  function moralTimeline(rows, uid) {
    return cleanPayments(rows)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (p) =>
          `<article class="payment-line"><div><strong>${esc(fmtDate(p.date))}</strong><div class="small">${esc(p.method)}${p.note ? " · " + esc(p.note) : ""}${p.voidedAt ? " · Anulado" : ""}</div></div><div><strong class="secret">${esc(fmt(p.amountCents))}</strong>${p.voidedAt ? "" : `<button type="button" class="btn sm" data-moral-void="${esc(p.id)}" data-moral-debt="${esc(uid)}">Anular</button>`}</div></article>`,
      )
      .join("");
  }
  function renderMoralRead() {
    const x = data.moralDebts.find((q) => q.id === activeMoralId);
    if (!x) return;
    const rem = moralRemainder(x),
      pays = activePayments(x.payments),
      paid = paymentsTotal(x.payments);
    $("#moralReadView").innerHTML =
      `<div class="read-header"><div><span class="read-label">Compromiso persoal · fóra da débeda financeira</span><div class="read-amount secret">${rem == null ? "Importe descoñecido" : esc(fmt(rem))}</div><p class="read-note">${esc(x.kind)} · ${x.amountBasis === "acordado" ? "Acordo persoal anotado" : "Valor orientativo, non obriga acreditada"}. ${x.sourceDate ? "Fonte histórica: " + esc(x.sourceDate) + "." : ""}</p></div><span class="read-pill">${esc(MORAL_STATES[x.status])}</span></div>
 <div class="read-actions"><button type="button" class="btn electric" data-moral-edit>Editar ficha</button><button type="button" class="btn" data-moral-pay ${rem === 0 ? "disabled" : ""}>Rexistrar pagamento</button><button type="button" class="btn" data-moral-resolve>${x.status === "pagada" ? "Reabrir ficha" : "Marcar resolto"}</button></div>
 ${x.amountCents != null ? progressMarkup(x.amountCents, paid) : '<div class="note">Non existe cifra fiable. Esta ficha pode pecharse mediante unha conversa, devolución ou detalle, sen anotar cartos ficticios.</div>'}
 <div class="read-section"><h3>Notas e seguinte paso</h3><p class="read-note">${esc(x.notes || "Pendente de avaliar e decidir o peche.")}</p></div>
 <div class="read-section"><h3>Historial de pagamentos / compensacións</h3>${pays.length ? moralTimeline(x.payments, x.id) : '<p class="read-note">Aínda non hai pagamentos rexistrados.</p>'}</div>
 <div class="read-section"><h3>Documentos e xustificantes · ${x.attachments?.length || 0}</h3><div class="read-files">${(x.attachments || []).map((a) => `<button type="button" class="btn sm" data-moral-file-save="${esc(a.id)}">${esc(a.name)}</button>`).join("") || '<p class="read-note">Sen anexos</p>'}</div></div>
 <div class="note warn">Non entra no total de débeda financeira, nas previsións bancarias nin no cálculo hipotecario. Para reflectir un pagamento real na conta, engade tamén o movemento bancario correspondente, sen duplicalo.</div>`;
  }
  function saveMoral() {
    const f = $("#moralDebtForm"),
      existing = data.moralDebts.find((x) => x.id === f.elements.id.value);
    const raw = f.elements.amount.value.trim(),
      amount = raw === "" ? null : parseEuro(raw);
    if (amount !== null && (amount < 0 || amount > 99999999999)) throw new Error("Importe non válido");
    if (!f.elements.name.value.trim()) throw new Error("Indica un nome");
    const split = {
      principalCents: readOptionalEuro(f.elements.principal.value),
      interestCents: readOptionalEuro(f.elements.interest.value),
      feesCents: readOptionalEuro(f.elements.fees.value),
    };
    if (amount == null && Object.values(split).some((x) => x != null))
      throw new Error("Para desglosar o importe hai que indicar primeiro unha referencia total.");
    if (amount != null) validateBreakdown(split, amount);
    if (existing && paymentsTotal(existing.payments) > 0 && amount !== existing.amountCents)
      throw new Error(
        "O importe de referencia non pode modificarse mentres existan pagamentos activos. Revisa o historial primeiro.",
      );
    const x = {
      id: existing?.id || "MP-" + id(),
      name: f.elements.name.value.trim().slice(0, 100),
      amountCents: amount,
      owner: f.elements.owner.value,
      kind: f.elements.kind.value,
      confidence: f.elements.confidence.value,
      status: f.elements.status.value,
      checkedAt: f.elements.checkedAt.value,
      due: f.elements.due.value,
      notes: f.elements.notes.value.trim(),
      sourceDate: existing?.sourceDate || localToday(),
      amountBasis: amount === null ? "sen_importe" : f.elements.amountBasis.value,
      reviewed: true,
      ...split,
      payments: existing?.payments || [],
      attachments: moralPendingAttachments.slice(),
    };
    if (existing) Object.assign(existing, x);
    else data.moralDebts.push(x);
    $("#moralDebtDialog").close();
    setData();
  }
  let moralPaymentId = null;
  $("#moralSearch").addEventListener("input", renderMoralDebts);
  $("#moralFilter").addEventListener("change", renderMoralDebts);
  $("#moralSort").addEventListener("change", renderMoralDebts);
  $("#addMoral").addEventListener("click", () => openMoral());
  $("#moralDebtForm").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      saveMoral();
    } catch (ex) {
      alert(ex.message);
    }
  });
  $("#moralAttachBtn").addEventListener("click", () => $("#moralAttachFiles").click());
  $("#moralAttachFiles").addEventListener("change", async (e) => {
    const fs = [...e.target.files];
    e.target.value = "";
    for (const f of fs) {
      try {
        const ext = f.name.split(".").pop().toLowerCase(),
          mime = TYPES[ext];
        if (!mime) throw new Error("Formato non admitido");
        if (f.size < 1 || f.size > MAX_FILE_BYTES) throw new Error("Tamaño non admitido");
        moralPendingAttachments.push({
          id: id(),
          name: f.name.slice(0, 160),
          type: mime,
          size: f.size,
          addedAt: new Date().toISOString(),
          content: await readFile(f, mime),
        });
      } catch (ex) {
        alert(f.name + ": " + ex.message);
      }
    }
    renderMoralAttachments();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest(
      "[data-moral-open],[data-moral-edit],[data-moral-pay],[data-moral-resolve],[data-moral-file-save],[data-moral-file-del],[data-moral-void],[data-moral-close]",
    );
    if (!b) return;
    if (b.dataset.moralOpen) {
      openMoral(b.dataset.moralOpen);
      return;
    }
    if (b.hasAttribute("data-moral-edit")) {
      setMoralMode("edit");
      return;
    }
    if (b.hasAttribute("data-moral-resolve")) {
      const x = data.moralDebts.find((z) => z.id === activeMoralId);
      if (
        x &&
        confirm(
          x.status === "pagada"
            ? "Reabrir esta ficha persoal?"
            : "Marcar como resolto? Isto non modifica a débeda financeira.",
        )
      ) {
        x.status = x.status === "pagada" ? "por_verificar" : "pagada";
        setData();
        renderMoralRead();
      }
      return;
    }
    if (b.hasAttribute("data-moral-pay")) {
      const x = data.moralDebts.find((z) => z.id === activeMoralId),
        rem = x && moralRemainder(x);
      if (!x || rem === 0) return;
      moralPaymentId = x.id;
      const f = $("#moralPaymentForm");
      f.reset();
      f.elements.date.value = localToday();
      $("#moralPaymentLabel").textContent = x.name + " · " + (rem == null ? "importe descoñecido" : fmt(rem));
      $("#moralPaymentDialog").showModal();
      return;
    }
    if (b.dataset.moralFileSave || b.dataset.moralFileDel) {
      const x = data.moralDebts.find((z) => z.id === activeMoralId),
        k = b.dataset.moralFileSave || b.dataset.moralFileDel,
        a = moralPendingAttachments.find((q) => q.id === k) || x?.attachments?.find((q) => q.id === k);
      if (!a) return;
      if (b.dataset.moralFileDel) {
        if (confirm("Retirar este anexo?")) {
          moralPendingAttachments = moralPendingAttachments.filter((z) => z.id !== k);
          renderMoralAttachments();
        }
        return;
      }
      const blob = bytesToBlob(a);
      saveBlob(blob, a.name);
      return;
    }
    if (b.dataset.moralVoid) {
      const x = data.moralDebts.find((q) => q.id === b.dataset.moralDebt),
        pay = x?.payments.find((q) => q.id === b.dataset.moralVoid);
      if (pay && !pay.voidedAt && confirm("Anular este pagamento ou compensación persoal?")) {
        pay.voidedAt = new Date().toISOString();
        pay.voidReason = "Anulado manualmente";
        setData();
        renderMoralRead();
      }
      return;
    }
    if (b.dataset.moralClose) {
      $("#" + b.dataset.moralClose)?.close();
      return;
    }
  });
  $("#moralPaymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const f = e.target,
        x = data.moralDebts.find((z) => z.id === moralPaymentId);
      if (!x) throw new Error("Ficha non atopada");
      const amount = parseEuro(f.elements.amount.value),
        rem = moralRemainder(x);
      if (amount <= 0 || (rem !== null && amount > rem))
        throw new Error("O importe debe ser positivo e non superar o pendente orientativo");
      const entry = {
        id: id(),
        date: f.elements.date.value,
        amountCents: amount,
        method: f.elements.method.value,
        mode: rem !== null && amount === rem ? "full" : "partial",
        reference: "",
        note: f.elements.note.value.trim(),
        createdAt: new Date().toISOString(),
        voidedAt: "",
        voidReason: "",
        balanceEligible: true,
        source: "moral",
      };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new Error("Data inválida");
      x.payments.push(entry);
      if (moralRemainder(x) === 0) x.status = "pagada";
      const saved = setData();
      $("#moralPaymentDialog").close();
      renderMoralRead();
      if (!saved)
        alert("O gardado local está desactivado ou non dispoñible. Exporta unha copia antes de pechar a app.");
    } catch (ex) {
      alert(ex.message);
    }
  });

  /* V10.3: importación idempotente do inventario RESPAWN. Non modifica fichas existentes. */
  function countMissingMoralSeed() {
    const ids = new Set((data.moralDebts || []).map((x) => String(x.id || "")));
    const labels = new Set(
      (data.moralDebts || []).map((x) =>
        String(x.name || "")
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase(),
      ),
    );
    return MORAL_SEED.filter(
      (x) =>
        !ids.has(x.id) &&
        !labels.has(
          x.name
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        ),
    );
  }
  function refreshSeedStatus() {
    const missing = countMissingMoralSeed();
    const btn = $("#restoreMoralSeed"),
      status = $("#moralSeedStatus");
    if (!btn || !status) return;
    status.textContent = missing.length
      ? missing.length + " fichas históricas sen incorporar"
      : "Inventario histórico incorporado";
    btn.hidden = missing.length === 0;
    const n = $("#v102MoralCount");
    if (n) n.textContent = (data.moralDebts || []).filter((x) => !["pagada", "arquivada"].includes(x.status)).length;
  }
  $("#restoreMoralSeed").addEventListener("click", () => {
    const missing = countMissingMoralSeed();
    if (!missing.length) {
      refreshSeedStatus();
      return;
    }
    if (
      !confirm(
        "Incorporar " +
          missing.length +
          " fichas históricas que faltan? As fichas actuais, importes e pagamentos non se modificarán.",
      )
    )
      return;
    data.moralDebts.push(...missing.map(moralCopy));
    const ok = setData();
    refreshSeedStatus();
    if (!ok) alert("Importadas en memoria, pero non foi posible gardar. Exporta unha copia antes de pechar.");
  });
  const v102Render = render;
  render = function () {
    v102Render();
    refreshSeedStatus();
  };
  render();

  /* Esta sección non se conecta ao pasivo financeiro nin á previsión de caixa. */
  const v101PreviousRender = render;
  render = function () {
    v101PreviousRender();
    renderMoralDebts();
  };

  render();

  /* ───────────────────────── Interface ─────────────────────────
     Portada, navegación, tema e axudas de formulario. Le os datos
     directamente (non o texto xa pintado) e engánchase ao render. */
  const VIEW_TITLES = {
    inicio: "Inicio",
    mes: "O meu mes",
    calendario: "Calendario",
    actuais: "Débedas",
    debedas: "Débedas antigas",
    arquivadas: "Arquivadas",
    morais: "Persoas",
    accions: "Tarefas",
    datos: "Rexistros",
    recuperacion: "Análise",
    axustes: "Axustes",
  };
  const NAV_GROUP = {
    inicio: "inicio",
    mes: "mes",
    actuais: "debedas",
    debedas: "debedas",
    arquivadas: "debedas",
    morais: "morais",
  };
  const monthLabel = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    const name = MONTH_NAMES[m - 1];
    return name[0].toUpperCase() + name.slice(1) + " " + y;
  };
  const sumBy = (rows, type) => rows.filter((x) => x.type === type).reduce((n, x) => n + x.amount, 0);

  function renderHome() {
    const ym = localToday().slice(0, 7);
    const rows = easyEvents(ym).filter((x) => Number.isSafeInteger(x.amount) && x.amount >= 0);
    const inc = sumBy(rows, "entrada"),
      out = sumBy(rows, "saida"),
      diff = inc - out;
    $("#homeMonth").textContent = monthLabel(ym);
    $("#homeDiff").textContent = fmt(diff);
    $("#homeHero").dataset.sign = diff < 0 ? "neg" : diff > 0 ? "pos" : "zero";
    $("#homeDiffNote").textContent =
      ym === "2026-11" && inc === 0
        ? "Parcial: faltan os ingresos de finais de outubro."
        : "Só o anotado para este mes. Non é o saldo da conta.";
    $("#homeIn").textContent = fmt(inc);
    $("#homeOut").textContent = fmt(out);

    const acc = mainAccounts().find(effective);
    $("#homeBalance").textContent = balanceKnown() ? fmt(balance()) : "Sen saldo";
    $("#homeBalanceDate").textContent = acc ? "Anotado o " + fmtDate(acc.date) : "Engade o saldo da conta";
    $("#homeDebt").textContent = fmt(activeCurrent().reduce((n, x) => n + remainingCurrent(x), 0));

    const gap = $("#homeGap");
    if (bridgeGap && bridgeGap.cents > 0) {
      gap.hidden = false;
      gap.textContent =
        "Ata a nómina do 30/11 faltan " +
        (bridgeGap.complete ? "" : "polo menos ") +
        fmt(bridgeGap.cents) +
        " para cubrir o anotado.";
    } else gap.hidden = true;
  }

  /* --- filtro do libro mensual --- */
  let monthFilter = "all",
    showOtherBlocks = false;
  function applyMonthFilter() {
    const groups = $("#simpleMonthGroups");
    if (!groups) return;
    let empty = 0,
      shown = 0;
    for (const b of groups.querySelectorAll(".simple-bucket")) {
      const rows = Array.from(b.querySelectorAll(".bucket-line"));
      const records = rows.filter((r) => r.querySelector("input[data-easy-done]"));
      const has = records.length > 0;
      if (!has) empty++;
      b.style.order = has ? "0" : "1";
      let matching = 0;
      for (const r of rows) {
        const box = r.querySelector("input[data-easy-done]");
        const ok = monthFilter === "all" || (box && (monthFilter === "paid" ? box.checked : !box.checked));
        r.hidden = !ok;
        if (ok && box) matching++;
      }
      const visible = monthFilter === "all" ? has || showOtherBlocks : matching > 0;
      b.hidden = !visible;
      if (!visible) b.open = false;
      if (visible) shown++;
    }
    const other = $("#monthOthers");
    other.hidden = monthFilter !== "all" || empty === 0;
    other.textContent = (showOtherBlocks ? "Ocultar categorías baleiras" : "Categorías sen movementos") + " (" + empty + ")";
    other.setAttribute("aria-expanded", String(showOtherBlocks));
    $("#monthEmpty").hidden = shown > 0;
  }
  $("#monthFilter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-month-filter]");
    if (!b) return;
    monthFilter = b.dataset.monthFilter;
    $$("#monthFilter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    applyMonthFilter();
  });
  $("#monthOthers").addEventListener("click", () => {
    showOtherBlocks = !showOtherBlocks;
    applyMonthFilter();
  });
  for (const id of ["monthPrev", "monthNext", "monthNow"])
    $("#" + id).addEventListener("click", applyMonthFilter);

  /* --- barra superior e navegación --- */
  function syncChrome() {
    $("#viewTitle").textContent = VIEW_TITLES[activeTab] || "";
    const group = NAV_GROUP[activeTab] || "mais";
    $$(".tabbar [data-nav]").forEach((b) => {
      if (b.dataset.nav === group) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    $$(".debt-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === activeTab)));
    $("#maskBtn").setAttribute("aria-pressed", String(!showAmounts));
  }
  const sheet = $("#moreSheet");
  $("#moreBtn").addEventListener("click", () => {
    if (!sheet.open) sheet.showModal();
  });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest("[data-tab]")) sheet.close();
  });

  /* --- tema: sistema, claro ou escuro --- */
  const THEME_KEY = "mausoleo.theme";
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function readTheme() {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return t === "light" || t === "dark" ? t : "system";
    } catch (_) {
      return "system";
    }
  }
  function applyTheme(choice, store) {
    const root = document.documentElement;
    if (choice === "light" || choice === "dark") root.dataset.theme = choice;
    else delete root.dataset.theme;
    $$("[data-theme-choice]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoice === choice)));
    if (store)
      try {
        if (choice === "system") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, choice);
      } catch (_) {}
    const dark = choice === "dark" || (choice === "system" && darkQuery.matches);
    if (window.MausoleoAndroid && typeof window.MausoleoAndroid.setDarkBars === "function")
      window.MausoleoAndroid.setDarkBars(dark);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme-choice]");
    if (b) applyTheme(b.dataset.themeChoice, true);
  });
  darkQuery.addEventListener("change", () => applyTheme(readTheme(), false));
  applyTheme(readTheme(), false);

  /* --- formulario de movemento --- */
  const eventDialog = $("#eventDialog"),
    eventForm = $("#eventForm");
  function syncEventForm() {
    const type = $("#eType").value,
      editing = !!eventForm.elements.id.value;
    $$("#eTypeSwitch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.type === type)));
    $("#eConcepts").hidden =
      editing || type !== "saida" || !!eventForm.elements.monthTemplateId.value || !!eventForm.elements.monthBlock.value;
    $("#eMore").open = editing;
  }
  const baseOpenEvent = openEvent;
  openEvent = function (x) {
    baseOpenEvent(x);
    // quickMove e easyNew completan o formulario despois de abrilo
    setTimeout(() => {
      syncEventForm();
      if (!eventForm.elements.id.value && !$("#eAmount").value) $("#eAmount").focus();
    }, 0);
  };
  $("#eTypeSwitch").addEventListener("click", (e) => {
    const b = e.target.closest("[data-type]");
    if (!b) return;
    $("#eType").value = b.dataset.type;
    $("#eType").dispatchEvent(new Event("change", { bubbles: true }));
    syncEventForm();
  });
  $("#eType").addEventListener("change", syncEventForm);
  $("#eConcepts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-concept]");
    if (!b) return;
    $("#eName").value = b.dataset.concept;
    $("#eBudgetCategory").value = b.dataset.category;
    $("#eName").dispatchEvent(new Event("input", { bubbles: true }));
  });
  eventForm.addEventListener("submit", () =>
    setTimeout(() => {
      if (!eventDialog.open) toast("Movemento gardado");
    }, 60),
  );

  /* --- aviso breve --- */
  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 1800);
  }

  /* --- tarxetas: toda a superficie abre a ficha --- */
  const CARD = ".current-card,.debt-card,.moral-card";
  const OPENER = "[data-current-open],[data-debt-open],[data-moral-open],[data-current-restore],[data-unarchive]";
  document.addEventListener("click", (e) => {
    const card = e.target.closest(CARD);
    if (!card || e.target.closest("button,a,input,select,textarea,summary")) return;
    card.querySelector(OPENER)?.click();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest && e.target.closest(CARD);
    if (!card || e.target !== card) return;
    e.preventDefault();
    card.querySelector(OPENER)?.click();
  });

  /* --- botón Atrás de Android --- */
  window.mausoleoBack = function () {
    const open = Array.from(document.querySelectorAll("dialog[open]")).pop();
    if (open) {
      open.close();
      return true;
    }
    if (activeTab !== "inicio") {
      go(NAV_GROUP[activeTab] === "debedas" && activeTab !== "actuais" ? "actuais" : "inicio");
      return true;
    }
    return false;
  };

  const uiPreviousRender = render;
  render = function () {
    uiPreviousRender();
    renderHome();
    applyMonthFilter();
    syncChrome();
  };
  render();
})();
