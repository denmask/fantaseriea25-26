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

function salvaEstrazioneCopletataInStorico() {
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

function caricaEstrazioni() {
  const estrazioni = localStorage.getItem("estrazioniFantacalcio");
  return estrazioni ? JSON.parse(estrazioni) : [];
}

function visualizzaStorico() {
  const estrazioni = caricaEstrazioni();
  if (estrazioni.length === 0) {
    alert("Nessuna estrazione salvata nello storico!");
    return;
  }
  let html = '<div class="storico-estrazioni" style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;"><h2>Storico Estrazioni Completate</h2>';
  estrazioni.reverse().forEach((estrazione, index) => {
    const realIndex = estrazioni.length - 1 - index;
    const data = new Date(estrazione.data).toLocaleString("it-IT");
    html += `<div class="estrazione-salvata" style="margin: 15px 0; padding: 15px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="color: #333; margin-bottom: 10px;">Estrazione ${realIndex + 1} - ${data}</h3>
      <ul style="list-style: none; padding: 0;">`;
    estrazione.risultati.forEach((ris) => {
      const [fascia, dettagli] = ris.split(": ");
      if (dettagli && dettagli.startsWith("__HEADER__")) return;
      html += `<li style="padding: 8px; margin: 5px 0; background: #f9f9f9; border-left: 3px solid #4CAF50; padding-left: 10px;">
        <strong>${fascia}:</strong> ${dettagli}
      </li>`;
    });
    html += `</ul><button onclick="eliminaEstrazione(${realIndex})" style="margin-top: 10px; padding: 5px 15px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Elimina</button></div>`;
  });
  html += "</div>";
  document.getElementById("output").innerHTML = html;
}

function eliminaEstrazione(index) {
  if (confirm("Sei sicuro?")) {
    let estrazioni = caricaEstrazioni();
    estrazioni.splice(index, 1);
    localStorage.setItem("estrazioniFantacalcio", JSON.stringify(estrazioni));
    visualizzaStorico();
  }
}

function resetCompleto() {
  if (confirm("Vuoi eliminare tutto?")) {
    localStorage.removeItem("estrazioniFantacalcio");
    localStorage.removeItem("estrazioneCorrente");
    location.reload();
  }
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
  [...dataSet.classificaSerieA].sort((a,b) => a.pos - b.pos).forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${s.pos}</td><td><img src="${s.logo}" class="stemma" alt="${s.nome}"> ${s.nome}</td><td>${s.punti}</td>`;
    tbody.appendChild(row);
  });
}

const TEAM_COLORS = {
  "Inter":     { primary: "#0068a8", secondary: "#000000", heart: "💙🖤" },
  "Milan":     { primary: "#cc0000", secondary: "#000000", heart: "❤️🖤" },
  "Juventus":  { primary: "#ffffff", secondary: "#000000", heart: "🤍🖤" },
  "Napoli":    { primary: "#009fd4", secondary: "#003087", heart: "💙💙" },
  "Roma":      { primary: "#cc0000", secondary: "#f5c518", heart: "❤️💛" },
  "Lazio":     { primary: "#87ceeb", secondary: "#ffffff", heart: "💙🤍" },
  "Atalanta":  { primary: "#0000ff", secondary: "#000000", heart: "💙🖤" },
  "Fiorentina":{ primary: "#6a0dad", secondary: "#ffffff", heart: "💜" },
  "Bologna":   { primary: "#cc0000", secondary: "#1e3a5f", heart: "❤️💙" },
  "Torino":    { primary: "#8b0000", secondary: "#ffffff", heart: "🤎" },
  "Udinese":   { primary: "#000000", secondary: "#ffffff", heart: "🖤🤍" },
  "Genoa":     { primary: "#cc0000", secondary: "#1e3a5f", heart: "❤️💙" },
  "Verona":    { primary: "#ffcc00", secondary: "#1e3a5f", heart: "💛💙" },
  "Empoli":    { primary: "#1e90ff", secondary: "#ffffff", heart: "💙" },
  "Lecce":     { primary: "#ffcc00", secondary: "#cc0000", heart: "💛❤️" },
  "Parma":     { primary: "#ffcc00", secondary: "#1e3a5f", heart: "💛💙" },
  "Cagliari":  { primary: "#cc0000", secondary: "#1e3a5f", heart: "❤️💙" },
  "Venezia":   { primary: "#ff6600", secondary: "#1e3a5f", heart: "🧡💙" },
  "Monza":     { primary: "#cc0000", secondary: "#ffffff", heart: "❤️🤍" },
  "Como":       { primary: "#1e3a5f", secondary: "#87ceeb", heart: "💙" },
  "Argentina":  { primary: "#74acdf", secondary: "#ffffff", heart: "💙🤍" },
  "Spagna":     { primary: "#c60b1e", secondary: "#f1bf00", heart: "❤️💛" },
};

function renderPalmares(palmares) {
  const container = document.getElementById("palmares-content");
  if (!container || !palmares) return;
  container.innerHTML = "";

  const icone = {
    "Serie A":    "⚽",
    "Coppa Italia": "🏅",
    "Mondiali":   "🌍",
    "Europei":    "🌟",
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
      const tc = TEAM_COLORS[item.squadra] || null;
      const isPending = !item.squadra || item.squadra === "";
      const isNazionale = !!item.bandiera;
      const hearts = (tc && !isNazionale) ? `<span class="team-hearts">${tc.heart}</span>` : "";

      if (isPending) {
        li.classList.add("palmares-pending");
        li.innerHTML = `
          <div class="palmares-row">
            <span class="palmares-stagione">${item.stagione.replace("/20", "/").replace("20", "")}</span>
            <span class="palmares-squadra pending-text">In corso…</span>
          </div>`;
      } else {
        if (tc) {
          li.style.setProperty("--team-color", tc.primary);
          li.style.setProperty("--team-color-2", tc.secondary);
        }
        li.classList.add("palmares-item-colored");
        li.innerHTML = `
          <div class="palmares-row">
            <span class="palmares-stagione">${item.stagione.replace("/20", "/").replace("20", "")}</span>
            <span class="palmares-squadra">
              ${item.emoji || "🏆"} ${item.squadra}
              ${hearts}
              ${item.bandiera ? `<img src="${item.bandiera}" class="palmares-bandiera" alt="bandiera">` : ""}
            </span>
          </div>
          <span class="allenatore">${item.allenatore || ""}</span>`;
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
}

async function caricaDati() {
  try {
    const response = await fetch("data.json", { cache: "no-cache" });
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

function getSquadreVietateFascia1(allenatore, disponibili) {
  const fascia1 = fascia1_squadre;
  const juventusInFascia1 = fascia1.includes("Juventus");

  const ammesse = {
    "Federico Burello": juventusInFascia1
      ? ["Inter", "Como"]
      : ["Inter", "Como"],
    "Kevin Di Bernardo": juventusInFascia1
      ? ["Milan", "Napoli", "Como"]
      : ["Milan", "Napoli", "Como"],
    "Denis Mascherin": juventusInFascia1
      ? ["Napoli", "Juventus", "Como"]
      : ["Napoli", "Como"],
    "Lorenzo Moro": juventusInFascia1
      ? ["Milan", "Como"]
      : ["Milan", "Como"],
  };

  const listaAmmessa = ammesse[allenatore];
  if (!listaAmmessa) return [];
  return disponibili.filter(s => !listaAmmessa.includes(s));
}

function getSquadreVietateFascia2(allenatore, disponibili) {
  const juventusInFascia1 = fascia1_squadre.includes("Juventus");
  const v = [];
  if (allenatore === "Cristian Tartaro" && !juventusInFascia1) v.push("Juventus");
  if (allenatore === "Alex Beltrame" && juventusInFascia1) v.push(...disponibili);
  return v.filter(s => disponibili.includes(s));
}

function getSquadreVietateFascia3(allenatore, disponibili) {
  if (allenatore === "Nicola Marano") {
    return disponibili.filter(s => s !== "Atalanta");
  }
  if (allenatore === "Aidan Conti") {
    return disponibili.filter(s => s !== "Lazio" && s !== "Bologna");
  }
  return [];
}

function assegnaSquadreConVincoli(allenatori, squadre, fascia, fnVietate) {
  let tentativi = 0;
  while (tentativi < 1000) {
    tentativi++;
    let disp = shuffleArray([...squadre]);
    let ass = [];
    let ok = true;
    for (let i = 0; i < allenatori.length; i++) {
      const v = fnVietate(allenatori[i], disp);
      const ammesse = disp.filter(s => !v.includes(s));
      if (ammesse.length === 0) { ok = false; break; }
      const s = ammesse[0];
      ass.push({ a: allenatori[i], s: s });
      disp = disp.filter(x => x !== s);
    }
    if (ok) {
      ass.forEach(x => risultati.push(`Fascia ${fascia}: ${x.a} -> ${x.s}`));
      return true;
    }
  }
  return false;
}

function assegnaFasciaConOrdineSquadre(allenatori, squadreOrdinate, fascia, fnVietate) {
  let tentativi = 0;
  while (tentativi < 1000) {
    tentativi++;
    let squadreDisp = shuffleArray([...squadreOrdinate]);
    let ass = [];
    let ok = true;
    for (let i = 0; i < allenatori.length; i++) {
      const allenatore = allenatori[i];
      const vietate = fnVietate(allenatore, squadreDisp);
      const ammesse = squadreDisp.filter(s => !vietate.includes(s));
      if (ammesse.length === 0) { ok = false; break; }
      const s = ammesse[Math.floor(Math.random() * ammesse.length)];
      ass.push({ a: allenatore, s: s });
      squadreDisp = squadreDisp.filter(x => x !== s);
    }
    if (ok) {
      ass.forEach(x => risultati.push(`Fascia ${fascia}: ${x.a} -> ${x.s}`));
      return true;
    }
  }
  return false;
}

function assegnaFascia3ConOrdineSquadre(allenatori, squadreOrdinate, fnVietate) {
  return assegnaFasciaConOrdineSquadre(allenatori, squadreOrdinate, 3, fnVietate);
}

function inizializzaSorteggio() {
  if (!caricaEstrazioneCorrente()) {
    risultati = [];
    risultatiMostrati = 0;
    risultati.push("Fascia 1: __HEADER__ -> ⚽ SORTEGGIO FASCIA 1");
    assegnaFasciaConOrdineSquadre(fascia1_allenatori, fascia1_squadre, 1, getSquadreVietateFascia1);
    risultati.push("Fascia 2: __HEADER__ -> ⚽ SORTEGGIO FASCIA 2");
    assegnaFasciaConOrdineSquadre(fascia2_allenatori, fascia2_squadre, 2, getSquadreVietateFascia2);
    risultati.push("Fascia 3: __HEADER__ -> ⚽ SORTEGGIO FASCIA 3");
    assegnaFascia3ConOrdineSquadre(fascia3_allenatori, fascia3_squadre_pure, getSquadreVietateFascia3);
    salvaEstrazioneCorrente();
  }
  inizializzaZoneFasce();
  if (risultatiMostrati >= risultati.length) {
    document.getElementById("btnProssimo").style.display = "none";
    document.getElementById("btnRicomincia").style.display = "inline-block";
  }
  if (risultatiMostrati > 0) ripristinaRisultatiVisibili();
}

function ripristinaRisultatiVisibili() {
  for (let i = 0; i < risultatiMostrati; i++) {
    let [f, d] = risultati[i].split(": ");
    let [p1, p2] = d.split(" -> ");
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
  let [f, d] = risultati[risultatiMostrati].split(": ");
  let [p1, p2] = d.split(" -> ");
  if (p1 === "__HEADER__") {
    let h = document.createElement("div");
    h.classList.add("fascia-header-annuncio");
    h.textContent = p2;
    getZonaFascia(f).appendChild(h);
    risultatiMostrati++;
    salvaEstrazioneCorrente();
    document.getElementById("btnProssimo").disabled = false;
    controllaFine();
    // Mostra automaticamente la prima squadra della fascia
    setTimeout(() => mostraProssimo(), 300);
    return;
  }
  if (audio) { audio.pause(); }
  audio = new Audio("countdown-suspense.mp3");
  audio.play();
  let c = 5;
  let disp = document.createElement("div");
  disp.classList.add("countdown-display");
  disp.textContent = c;
  document.getElementById("output").appendChild(disp);
  let timer = setInterval(() => {
    c--;
    disp.textContent = c;
    if (c <= 5) disp.classList.add("countdown-urgente");
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
    salvaEstrazioneCopletataInStorico();
    localStorage.removeItem("estrazioneCorrente");
  }
}

function generaMessaggioWhatsApp() {
  if (risultati.length === 0) {
    alert("Nessun sorteggio da condividere!");
    return "";
  }

  // Mappa allenatori con loro fascia
  const allenaoriMap = {};
  dataSet.allenatori.forEach(a => {
    allenaoriMap[a.nome] = a.fascia;
  });

  // Estrai le estrazioni (escludendo gli header)
  const estrazioni = risultati
    .filter(riga => {
      const [fascia, dettagli] = riga.split(": ");
      const [p1, p2] = dettagli.split(" -> ");
      return p1 !== "__HEADER__";
    })
    .map((riga, index) => {
      const [fascia, dettagli] = riga.split(": ");
      const [allenatore, squadra] = dettagli.split(" -> ");
      const fasciaNum = fascia.split(" ")[1];
      const allenatoreFascia = allenaoriMap[allenatore] || "?";
      return {
        ordine: index + 1,
        allenatore,
        squadra,
        fasciaEstrazione: fasciaNum,
        fasciaAllenatore: allenatoreFascia
      };
    });

  // Crea il messaggio
  const ora = new Date().toLocaleString("it-IT");
  let messaggio = "🎯 *SORTEGGIO FANTACALCIO* 🎯\n";
  messaggio += "*Lega Udinese 1896*\n";
  messaggio += `📅 ${ora}\n\n`;
  messaggio += "━━━━━━━━━━━━━━━━━━━━━━━\n\n";

  estrazioni.forEach(e => {
    const ordinaleDi = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°"];
    const ordine = ordinaleDi[e.ordine - 1] || e.ordine + "°";
    const fasciaEmoji = ["", "🔴", "🟡", "🟢"][e.fasciaAllenatore] || "⚽";
    messaggio += `${ordine} ${e.allenatore} (Fascia ${e.fasciaAllenatore}) ${fasciaEmoji}\n`;
    messaggio += `   → *${e.squadra}*\n\n`;
  });

  messaggio += "━━━━━━━━━━━━━━━━━━━━━━━\n";
  messaggio += `✅ Estrazione completata: ${estrazioni.length}/8 allenatori\n`;
  messaggio += "🏆 Buona fortuna a tutti!\n";

  return messaggio;
}

function condividiSuWhatsApp() {
  const messaggio = generaMessaggioWhatsApp();
  
  if (!messaggio) {
    alert("Nessun sorteggio disponibile!");
    return;
  }

  // Codifica il messaggio per URL
  const messaggioEncodato = encodeURIComponent(messaggio);
  
  // Link WhatsApp Web
  const urlWhatsApp = `https://wa.me/?text=${messaggioEncodato}`;
  
  // Apri in nuova finestra
  window.open(urlWhatsApp, "_blank");
}

function aggiungiEffettiGlow() {
  const buttons = document.querySelectorAll('button:not(#btnProssimo)');
  buttons.forEach(btn => {
    btn.classList.add('glow-effect');
  });
}

function aggiungiTooltip() {
  const squadreElements = document.querySelectorAll('#tabellaClassifica td:nth-child(2)');
  squadreElements.forEach(el => {
    el.setAttribute('title', 'Clicca per dettagli squadra');
    el.style.cursor = 'help';
  });
}

async function bootstrap() {
  await caricaDati();
  inizializzaSorteggio();
  aggiungiEffettiGlow();
  aggiungiTooltip();
}

document.addEventListener("DOMContentLoaded", bootstrap);