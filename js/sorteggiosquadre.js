let dataSet = null;
let fascia1_allenatori = [];
let fascia2_allenatori = [];
let fascia3_allenatori = [];
let fascia1_squadre = [];
let fascia2_squadre = [];
let fascia3_squadre_pure = [];
let resto_squadre = [];
let logoPerSquadra = {};
let fotoAllenatore = {};
let fasceCalcolate = { fascia1: [], fascia2: [], fascia3_pure: [], resto: [] };
let risultati = [];
let risultatiMostrati = 0;
let audio = null;

// Mappa colori squadre
const TEAM_COLORS = {
  "Inter": { primary: "#0068a8", secondary: "#000000", heart: "💙🖤" },
  "Milan": { primary: "#cc0000", secondary: "#000000", heart: "❤️🖤" },
  "Juventus": { primary: "#1a1a2e", secondary: "#ffffff", heart: "🤍🖤" },
  "Napoli": { primary: "#009fd4", secondary: "#003087", heart: "💙💙" },
  "Roma": { primary: "#cc0000", secondary: "#f5c518", heart: "❤️💛" },
  "Lazio": { primary: "#87ceeb", secondary: "#ffffff", heart: "💙🤍" },
  "Atalanta": { primary: "#0000ff", secondary: "#000000", heart: "💙🖤" },
  "Fiorentina": { primary: "#6a0dad", secondary: "#ffffff", heart: "💜" },
  "Bologna": { primary: "#cc0000", secondary: "#1e3a5f", heart: "❤️💙" },
  "Udinese": { primary: "#000000", secondary: "#ffffff", heart: "🖤🤍" },
  "Genoa": { primary: "#cc0000", secondary: "#1e3a5f", heart: "❤️💙" },
  "Como": { primary: "#1e3a5f", secondary: "#87ceeb", heart: "💙" },
  "Argentina": { primary: "#74acdf", secondary: "#ffffff", heart: "💙🤍" },
  "Spagna": { primary: "#c60b1e", secondary: "#f1bf00", heart: "❤️💛" },
  "Francia": { primary: "#0055a4", secondary: "#ffffff", heart: "💙🤍❤️" },
  "Inghilterra": { primary: "#c8102e", secondary: "#ffffff", heart: "❤️🤍" },
  "Brasile": { primary: "#009c3b", secondary: "#ffdf00", heart: "💚💛" },
  "Portogallo": { primary: "#006600", secondary: "#ff0000", heart: "💚❤️" },
  "Germania": { primary: "#000000", secondary: "#ffcc00", heart: "🖤❤️💛" },
};

function salvaEstrazioneCorrente() {
  if (risultati.length === 0) return;
  const estrazione = {
    data: new Date().toISOString(),
    risultati: risultati,
    risultatiMostrati: risultatiMostrati,
    timestamp: Date.now(),
  };
  localStorage.setItem("estrazioneCorrente", JSON.stringify(estrazione));
}

function caricaEstrazioneCorrente() {
  const estrazione = localStorage.getItem("estrazioneCorrente");
  if (estrazione) {
    const dati = JSON.parse(estrazione);
    risultati = dati.risultati || [];
    risultatiMostrati = dati.risultatiMostrati || 0;
    return true;
  }
  return false;
}

function salvaEstrazioneCompletataInStorico() {
  if (risultati.length === 0) return;
  const estrazione = {
    data: new Date().toISOString(),
    risultati: risultati,
    timestamp: Date.now(),
  };
  let estrazioniSalvate = JSON.parse(localStorage.getItem("estrazioniFantacalcio") || "[]");
  estrazioniSalvate.push(estrazione);
  localStorage.setItem("estrazioniFantacalcio", JSON.stringify(estrazioniSalvate));
}

function inizializzaZoneFasce() {
  const output = document.getElementById("output");
  output.innerHTML = "";
  ["zona-fascia-1", "zona-fascia-2", "zona-fascia-3"].forEach(id => {
    const div = document.createElement("div");
    div.id = id;
    div.classList.add("zona-fascia");
    output.appendChild(div);
  });
}

function getZonaFascia(fasciaLabel) {
  if (fasciaLabel === "Fascia 1") return document.getElementById("zona-fascia-1");
  if (fasciaLabel === "Fascia 2") return document.getElementById("zona-fascia-2");
  if (fasciaLabel === "Fascia 3") return document.getElementById("zona-fascia-3");
  return document.getElementById("output");
}

function creaCardEstrazione(fascia, allenatore, squadra, dettagli) {
  let evidenza = document.createElement("div");
  evidenza.classList.add("casella-evidenza");
  let etichettaFascia = document.createElement("div");
  etichettaFascia.classList.add("etichetta-fascia");
  etichettaFascia.textContent = fascia;

  if (allenatore && squadra) {
    let imgAllenatore = document.createElement("img");
    imgAllenatore.src = fotoAllenatore[allenatore] || `images/${allenatore.toLowerCase().replace(/ /g, "_")}.jpg`;
    imgAllenatore.classList.add("foto-allenatore");
    imgAllenatore.alt = allenatore;

    let imgSquadra = document.createElement("img");
    imgSquadra.src = logoPerSquadra[squadra] || `images/${squadra.toLowerCase().replace(/ /g, "_")}.png`;
    imgSquadra.classList.add("stemma-squadra");
    imgSquadra.alt = squadra;

    let testo = document.createElement("p");
    testo.innerHTML = `<strong>${allenatore}</strong> è stato assegnato alla squadra <strong style="color:var(--gold)">${squadra}</strong>`;

    evidenza.appendChild(imgAllenatore);
    evidenza.appendChild(imgSquadra);
    evidenza.appendChild(testo);
  }

  evidenza.prepend(etichettaFascia);
  return evidenza;
}

function renderFasceTable() {
  const tbody = document.querySelector("#tabellaFasce tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const renderRow = (item, label, classe) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="${classe}">${label}</td><td><img src="${item.logo || ""}" class="stemma" alt="${item.nome}"> ${item.nome}</td>`;
    tbody.appendChild(row);
  };

  fasceCalcolate.fascia1.forEach(s => renderRow(s, "Fascia 1", "fascia1"));
  fasceCalcolate.fascia2.forEach(s => renderRow(s, "Fascia 2", "fascia2"));
  fasceCalcolate.fascia3_pure.forEach(s => renderRow(s, "Fascia 3", "fascia3"));
}

function renderClassificaReale() {
  const tbody = document.querySelector("#tabellaClassifica tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  [...dataSet.classificaSerieA].sort((a, b) => a.pos - b.pos).forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${s.pos}</td><td><img src="${s.logo}" class="stemma" alt="${s.nome}"> ${s.nome}</td><td>${s.punti}</td>`;
    tbody.appendChild(row);
  });
}

// ========== MODAL PER CLASSIFICHE STORICHE ==========
function showSeasonDetails(seasonId, seasonLabel, squadraVincente, allenatoreVincente, tipoCompetizione) {
  let seasonData = null;
  let isSerieA = true;

  if (tipoCompetizione === "Coppa Italia") {
    isSerieA = false;
    if (seasonId.includes("2023")) {
      seasonData = dataSet.altreCompetizioni?.["FantacoppaItalia 2023/2024"];
    } else if (seasonId.includes("2024")) {
      seasonData = dataSet.altreCompetizioni?.["FantacoppaItalia 2024/2025"];
    } else {
      seasonData = dataSet.altreCompetizioni?.["FantacoppaItalia 2025/2026"];
    }
  } else if (tipoCompetizione === "Mondiali") {
    isSerieA = false;
    if (seasonId.includes("2026")) {
      seasonData = dataSet.altreCompetizioni?.["Fantamundial USA 2026"];
    } else {
      seasonData = dataSet.altreCompetizioni?.["Fantamundial Qatar 2022"];
    }
  } else if (tipoCompetizione === "Europei") {
    isSerieA = false;
    seasonData = dataSet.altreCompetizioni?.["Fantaeuropeo Germany 2024"];
  } else {
    isSerieA = true;
    if (seasonId.includes("2021")) {
      seasonData = dataSet.classificheStoriche?.["2021/2022"];
    } else if (seasonId.includes("2022")) {
      seasonData = dataSet.classificheStoriche?.["2022/2023"];
    } else if (seasonId.includes("2023")) {
      seasonData = dataSet.classificheStoriche?.["2023/2024"];
    } else if (seasonId.includes("2024")) {
      seasonData = dataSet.classificheStoriche?.["2024/2025"];
    } else if (seasonId.includes("2025")) {
      seasonData = dataSet.classificheStoriche?.["2025/2026"];
    }
  }

  const titolo = seasonData?.titolo || seasonLabel;
  const classifica = seasonData?.classifica || [];
  const note = seasonData?.note || "";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>🏆 ${titolo}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${classifica.length > 0 ? `
          <table class="classifica-modal">
            <thead>
              <tr>
                <th>#</th>
                <th>Squadra</th>
                <th>Allenatore</th>
                <th>Punti</th>
                ${isSerieA ? '<th>FP</th>' : '<th>Risultato</th>'}
              </tr>
            </thead>
            <tbody>
              ${classifica.map((c, idx) => `
                <tr ${c.squadra === squadraVincente ? 'style="background: var(--gold-dim);"' : ''}>
                  <td>${c.pos || idx + 1}</td>
                  <td><strong>${c.squadra}</strong> ${c.squadra === squadraVincente ? '🏆' : ''}</td>
                  <td>${c.allenatore || "-"}</td>
                  <td>${c.punti ?? "-"}</td>
                  <td>${isSerieA ? (c.fp || "-") : (c.risultato || "-")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${note ? `<p style="margin-top:16px;padding:12px;background:var(--surface-2);border-radius:12px;font-size:13px;color:var(--muted);"><strong>📝 Nota:</strong> ${note}</p>` : ""}
        ` : `
          <p style="text-align:center;color:var(--muted);padding:32px;">
            📋 Classifica dettagliata non ancora disponibile per questa stagione.
          </p>
          ${squadraVincente ? `<p style="text-align:center;font-size:16px;font-weight:bold;color:var(--gold);">🏆 Vincitore: ${squadraVincente}${allenatoreVincente ? ` (${allenatoreVincente})` : ""}</p>` : ""}
        `}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.classList.add("active");
  modal.querySelector(".modal-close").onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function renderPalmares(palmares) {
  const container = document.getElementById("palmares-content");
  if (!container || !palmares) return;
  container.innerHTML = "";

  const icone = {
    "Serie A": "⚽",
    "Coppa Italia": "🏅",
    "Mondiali": "🌍",
    "Europei": "🌟",
  };

  const makeList = (title, items) => {
    const section = document.createElement("div");
    section.classList.add("sezione");
    const h3 = document.createElement("h3");
    h3.innerHTML = `<span class="palmares-icon">${icone[title] || "🏆"}</span>${title}`;
    section.appendChild(h3);
    const ul = document.createElement("ul");

    (items || []).forEach(item => {
      const li = document.createElement("li");
      const tc = TEAM_COLORS[item.squadra] || TEAM_COLORS[item.squadra?.split("/")[0]] || null;
      const isPending = !item.squadra || item.squadra === "TBD" || item.squadra === "";
      const isNazionale = !!item.bandiera;
      const hearts = (tc && !isNazionale) ? `<span class="team-hearts">${tc.heart}</span>` : "";

      if (isPending) {
        li.classList.add("palmares-pending");
        li.innerHTML = `
          <div class="palmares-row">
            <span class="palmares-stagione">${item.stagione.replace("/20", "/").replace("20", "")}</span>
            <span class="palmares-squadra pending-text">📅 In corso…</span>
          </div>
          <div class="allenatore pending-text">In attesa</div>`;
      } else {
        li.classList.add("palmares-item");
        const squadraHtml = `<span class="clickable-team" data-season="${item.stagione}" data-squadra="${item.squadra}" data-coach="${item.allenatore}" data-tipo="${title}">${item.emoji || "🏆"} ${item.squadra} ${hearts}</span>`;
        const allenatoreHtml = `<span class="clickable-coach" data-season="${item.stagione}" data-squadra="${item.squadra}" data-coach="${item.allenatore}" data-tipo="${title}">${item.allenatore || ""}</span>`;

        li.innerHTML = `
          <div class="palmares-row">
            <span class="palmares-stagione">${item.stagione.replace("/20", "/").replace("20", "")}</span>
            <span class="palmares-squadra">
              ${squadraHtml}
            </span>
          </div>
          <div class="allenatore">
            👤 ${allenatoreHtml}
          </div>`;

        if (item.bandiera && li.querySelector(".palmares-squadra")) {
          const bandieraImg = document.createElement("img");
          bandieraImg.src = item.bandiera;
          bandieraImg.classList.add("palmares-bandiera");
          li.querySelector(".palmares-squadra").appendChild(bandieraImg);
        }
      }
      ul.appendChild(li);
    });

    section.appendChild(ul);
    container.appendChild(section);
  };

  makeList("Serie A", palmares.serieA);
  makeList("Coppa Italia", palmares.coppaItalia);
  makeList("Mondiali", palmares.worldCup);
  makeList("Europei", palmares.euro);

  setTimeout(() => {
    document.querySelectorAll(".clickable-team, .clickable-coach").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const season = el.dataset.season;
        const squadra = el.dataset.squadra;
        const coach = el.dataset.coach;
        const tipo = el.dataset.tipo;
        showSeasonDetails(season, season, squadra, coach, tipo);
      });
    });
  }, 100);
}

// ========== SISTEMA VINCOLI DINAMICO ==========
// I vincoli per fascia sono letti direttamente da data.json.
// Per ogni allenatore puoi aggiungere "squadreAmmesse" e/o "squadreVietate"
// nel campo "vincoli" dentro data.json.
//
// Esempio in data.json:
// {
//   "nome": "Federico Burello",
//   "fascia": 1,
//   "foto": "images/...",
//   "vincoli": {
//     "squadreAmmesse": ["Inter", "Napoli"]
//   }
// }
//
// Se "squadreAmmesse" è presente → l'allenatore può ricevere SOLO quelle squadre.
// Se "squadreVietate" è presente → l'allenatore NON può ricevere quelle squadre.
// Se non c'è nessun vincolo → qualsiasi squadra disponibile va bene.
//
// Per aggiornare le fasce basta modificare "fascia" in data.json.
// Nessuna modifica al codice JS è necessaria! 🎉

function getSquadreVietate(allenatore, disponibili, fasciaNum) {
  const datiAllenatore = (dataSet.allenatori || []).find(a => a.nome === allenatore);
  const vincoli = datiAllenatore?.vincoli || {};

  // Se ci sono squadre ammesse, vieto tutto tranne quelle
  if (vincoli.squadreAmmesse && vincoli.squadreAmmesse.length > 0) {
    return disponibili.filter(s => !vincoli.squadreAmmesse.includes(s));
  }

  // Se ci sono squadre esplicitamente vietate, le vieto
  if (vincoli.squadreVietate && vincoli.squadreVietate.length > 0) {
    return disponibili.filter(s => vincoli.squadreVietate.includes(s));
  }

  return [];
}

// ========== ORDINAMENTO RIVELAZIONE PER CLASSIFICA ==========
//
// Le card vengono rivelate nell'ordine della classifica reale (dalla squadra
// più alta in classifica alla più bassa), NON nell'ordine degli allenatori.
//
// Puoi sovrascrivere manualmente l'ordine di rivelazione in data.json:
//
// "config": {
//   "fasce": { "fascia1Count": 4, "fascia2Count": 2, "fascia3Count": 2 },
//   "ordineSorteggio": {
//     "fascia1": ["Inter", "Napoli", "Milan", "Roma"],
//     "fascia2": ["Como", "Juventus"],
//     "fascia3": ["Atalanta", "Bologna"]
//   }
// }
//
// Se "ordineSorteggio" NON è presente in data.json, viene usato
// automaticamente l'ordine della classifica reale (campo "pos").
// Se una squadra non è nell'ordine specificato, viene messa in fondo.

function getOrdineSquadre(fasciaKey) {
  // Prima controlla se c'è un override manuale in data.json
  const override = dataSet?.config?.ordineSorteggio?.[fasciaKey];
  if (override && override.length > 0) return override;

  // Default: ordine classifica reale (dal 1° posto in su)
  const classifica = [...dataSet.classificaSerieA].sort((a, b) => a.pos - b.pos);
  return classifica.map(s => s.nome);
}

function riordinaRighePerClassifica(righe, fasciaKey) {
  const ordine = getOrdineSquadre(fasciaKey);
  return [...righe].sort((a, b) => {
    const squadraA = a.split(" -> ")[1];
    const squadraB = b.split(" -> ")[1];
    const iA = ordine.indexOf(squadraA);
    const iB = ordine.indexOf(squadraB);
    return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
  });
}

// Versione modificata: accetta un buffer opzionale invece di scrivere
// direttamente in risultati (così possiamo riordinare prima di inserire)
function assegnaFasciaConOrdineSquadre(allenatori, squadreOrdinate, fascia, fnVietate, buffer) {
  let tentativi = 0;
  while (tentativi < 1000) {
    tentativi++;
    let squadreDisp = shuffleArray([...squadreOrdinate]);
    let ass = [];
    let ok = true;
    for (let i = 0; i < allenatori.length; i++) {
      const allenatore = allenatori[i];
      const vietate = fnVietate(allenatore, squadreDisp, fascia);
      const ammesse = squadreDisp.filter(s => !vietate.includes(s));
      if (ammesse.length === 0) { ok = false; break; }
      const s = ammesse[Math.floor(Math.random() * ammesse.length)];
      ass.push({ a: allenatore, s: s });
      squadreDisp = squadreDisp.filter(x => x !== s);
    }
    if (ok) {
      ass.forEach(x => {
        const riga = `${x.a} -> ${x.s}`;
        if (buffer) {
          buffer.push(riga);
        } else {
          risultati.push(`Fascia ${fascia}: ${riga}`);
        }
      });
      return true;
    }
  }
  return false;
}

async function caricaDati() {
  try {
    const response = await fetch("data.json?t=" + Date.now(), { cache: "no-cache" });
    dataSet = await response.json();

    const classifica = [...dataSet.classificaSerieA].sort((a, b) => a.pos - b.pos);
    const f1c = dataSet?.config?.fasce?.fascia1Count ?? 4;
    const f2c = dataSet?.config?.fasce?.fascia2Count ?? 2;
    const f3c = dataSet?.config?.fasce?.fascia3Count ?? 2;
    fasceCalcolate.fascia1 = classifica.slice(0, f1c);
    fasceCalcolate.fascia2 = classifica.slice(f1c, f1c + f2c);
    fasceCalcolate.fascia3_pure = classifica.slice(f1c + f2c, f1c + f2c + f3c);
    logoPerSquadra = Object.fromEntries(classifica.map(s => [s.nome, s.logo]));
    fotoAllenatore = Object.fromEntries((dataSet.allenatori || []).map(a => [a.nome, a.foto]));

    // Le fasce degli allenatori sono lette dinamicamente da data.json
    fascia1_allenatori = dataSet.allenatori.filter(a => a.fascia === 1).map(a => a.nome);
    fascia2_allenatori = dataSet.allenatori.filter(a => a.fascia === 2).map(a => a.nome);
    fascia3_allenatori = dataSet.allenatori.filter(a => a.fascia === 3).map(a => a.nome);

    fascia1_squadre = fasceCalcolate.fascia1.map(s => s.nome);
    fascia2_squadre = fasceCalcolate.fascia2.map(s => s.nome);
    fascia3_squadre_pure = fasceCalcolate.fascia3_pure.map(s => s.nome);

    renderFasceTable();
    renderClassificaReale();
    renderPalmares(dataSet?.palmares);
    window.dataSet = dataSet;
    document.dispatchEvent(new CustomEvent("dati-caricati", { detail: dataSet }));
  } catch (e) { console.error(e); }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function inizializzaSorteggio() {
  if (!caricaEstrazioneCorrente()) {
    risultati = [];
    risultatiMostrati = 0;

    // ── FASE 1: sorteggio casuale in buffer separati ──────────────────────
    const bufferF1 = [];
    const bufferF2 = [];
    const bufferF3 = [];

    assegnaFasciaConOrdineSquadre(fascia1_allenatori, fascia1_squadre, 1, getSquadreVietate, bufferF1);
    assegnaFasciaConOrdineSquadre(fascia2_allenatori, fascia2_squadre, 2, getSquadreVietate, bufferF2);
    assegnaFasciaConOrdineSquadre(fascia3_allenatori, fascia3_squadre_pure, 3, getSquadreVietate, bufferF3);

    // ── FASE 2: riordino per classifica reale (o override manuale) ────────
    const f1Ordinata = riordinaRighePerClassifica(bufferF1, "fascia1");
    const f2Ordinata = riordinaRighePerClassifica(bufferF2, "fascia2");
    const f3Ordinata = riordinaRighePerClassifica(bufferF3, "fascia3");

    // ── FASE 3: costruzione array risultati finale ─────────────────────────
    risultati.push("Fascia 1: __HEADER__ -> ⚽ SORTEGGIO FASCIA 1");
    f1Ordinata.forEach(r => risultati.push("Fascia 1: " + r));

    risultati.push("Fascia 2: __HEADER__ -> ⚽ SORTEGGIO FASCIA 2");
    f2Ordinata.forEach(r => risultati.push("Fascia 2: " + r));

    risultati.push("Fascia 3: __HEADER__ -> ⚽ SORTEGGIO FASCIA 3");
    f3Ordinata.forEach(r => risultati.push("Fascia 3: " + r));

    salvaEstrazioneCorrente();
  }
  inizializzaZoneFasce();
  if (risultatiMostrati >= risultati.length) {
    document.getElementById("btnProssimo").style.display = "none";
    document.getElementById("btnRicomincia").style.display = "inline-block";
    document.getElementById("btnWhatsApp").style.display = "inline-block";
  }
  if (risultatiMostrati > 0) ripristinaRisultatiVisibili();
}

function ripristinaRisultatiVisibili() {
  for (let i = 0; i < risultatiMostrati; i++) {
    const [f, d] = risultati[i].split(": ");
    const [p1, p2] = d.split(" -> ");
    if (p1 === "__HEADER__") {
      let h = document.createElement("div");
      h.classList.add("fascia-header-annuncio");
      h.textContent = p2;
      getZonaFascia(f).appendChild(h);
    } else {
      getZonaFascia(f).appendChild(creaCardEstrazione(f, p1, p2, d));
    }
  }
}

function mostraProssimo() {
  if (risultatiMostrati >= risultati.length) return;
  document.getElementById("btnProssimo").disabled = true;

  const [f, d] = risultati[risultatiMostrati].split(": ");
  const [p1, p2] = d.split(" -> ");

  if (p1 === "__HEADER__") {
    let h = document.createElement("div");
    h.classList.add("fascia-header-annuncio");
    h.textContent = p2;
    getZonaFascia(f).appendChild(h);
    risultatiMostrati++;
    salvaEstrazioneCorrente();
    document.getElementById("btnProssimo").disabled = false;
    controllaFine();
    return;
  }

  if (audio) { audio.pause(); }
  audio = new Audio("countdown-suspense.mp3");
  audio.play();

  let c = 10;
  let disp = document.createElement("div");
  disp.classList.add("countdown-display");
  disp.textContent = c;
  getZonaFascia(f).appendChild(disp);

  let timer = setInterval(() => {
    c--;
    disp.textContent = c;
    if (c <= 2) disp.classList.add("countdown-urgente");
    if (c === 0) {
      clearInterval(timer);
      disp.classList.add("countdown-fine");
      setTimeout(() => {
        disp.remove();
        const card = creaCardEstrazione(f, p1, p2, d);
        card.classList.add("highlight-new");
        getZonaFascia(f).appendChild(card);
        risultatiMostrati++;
        salvaEstrazioneCorrente();
        document.getElementById("btnProssimo").disabled = false;
        controllaFine();
      }, 400);
    }
  }, 1000);
}

function controllaFine() {
  if (risultatiMostrati === risultati.length) {
    document.getElementById("btnProssimo").style.display = "none";
    document.getElementById("btnRicomincia").style.display = "inline-block";
    document.getElementById("btnWhatsApp").style.display = "inline-block";
    salvaEstrazioneCompletataInStorico();
    localStorage.removeItem("estrazioneCorrente");
  }
}

function ricominciaSorteggio() {
  if (confirm("Vuoi ricominciare il sorteggio da capo?")) {
    localStorage.removeItem("estrazioneCorrente");
    location.reload();
  }
}

function resetCompleto() {
  if (confirm("⚠️ ATTENZIONE: Questo cancellerà TUTTI i sorteggi salvati. Sei sicuro?")) {
    localStorage.removeItem("estrazioniFantacalcio");
    localStorage.removeItem("estrazioneCorrente");
    location.reload();
  }
}

function generaMessaggioWhatsApp() {
  if (risultati.length === 0) {
    alert("Nessun sorteggio da condividere!");
    return "";
  }

  const estrazioni = risultati
    .filter(riga => {
      const [, dettagli] = riga.split(": ");
      const [p1] = dettagli.split(" -> ");
      return p1 !== "__HEADER__";
    })
    .map((riga, index) => {
      const [fascia, dettagli] = riga.split(": ");
      const [allenatore, squadra] = dettagli.split(" -> ");
      return { ordine: index + 1, allenatore, squadra };
    });

  const ora = new Date().toLocaleString("it-IT");
  let messaggio = "🎯 *SORTEGGIO FANTACALCIO* 🎯\n";
  messaggio += "*Lega Udinese 1896*\n";
  messaggio += `📅 ${ora}\n\n`;
  messaggio += "━━━━━━━━━━━━━━━━━━━━━━━\n\n";

  const ordinaleDi = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°"];
  estrazioni.forEach(e => {
    const ordine = ordinaleDi[e.ordine - 1] || e.ordine + "°";
    messaggio += `${ordine} ${e.allenatore}\n`;
    messaggio += `   → *${e.squadra}*\n\n`;
  });

  messaggio += "━━━━━━━━━━━━━━━━━━━━━━━\n";
  messaggio += "🏆 Buona fortuna a tutti!\n";
  return messaggio;
}

function condividiSuWhatsApp() {
  const messaggio = generaMessaggioWhatsApp();
  if (!messaggio) { alert("Nessun sorteggio disponibile!"); return; }
  const messaggioEncodato = encodeURIComponent(messaggio);
  window.open(`https://wa.me/?text=${messaggioEncodato}`, "_blank");
}

async function bootstrap() {
  await caricaDati();
  inizializzaSorteggio();
}

window.mostraProssimo = mostraProssimo;
window.ricominciaSorteggio = ricominciaSorteggio;
window.resetCompleto = resetCompleto;
window.condividiSuWhatsApp = condividiSuWhatsApp;

document.addEventListener("DOMContentLoaded", bootstrap);