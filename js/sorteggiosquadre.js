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
    let imgSquadra = document.createElement("img");
    imgSquadra.src = logoPerSquadra[squadra] || `images/${squadra.toLowerCase().replace(/ /g, "_")}.png`;
    imgSquadra.classList.add("stemma-squadra");
    let testo = document.createElement("p");
    testo.innerHTML = `<strong>${allenatore}</strong> è stato assegnato alla squadra <strong>${squadra}</strong>!`;
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
    row.innerHTML = `<td class="${classe}">${label}</td><td><img src="${item.logo || ""}" class="stemma"> ${item.nome}</td>`;
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
    row.innerHTML = `<td>${s.pos}</td><td><img src="${s.logo}" class="stemma"> ${s.nome}</td><td>${s.punti}</td>`;
    tbody.appendChild(row);
  });
}

function renderPalmares(palmares) {
  const container = document.getElementById("palmares-content");
  if (!container || !palmares) return;
  container.innerHTML = "";
  const makeList = (title, items) => {
    const section = document.createElement("div");
    section.classList.add("sezione");
    const h3 = document.createElement("h3");
    h3.textContent = title;
    section.appendChild(h3);
    const ul = document.createElement("ul");
    (items || []).forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `${item.stagione}: ${item.emoji || ""} ${item.squadra || "🏆"} ${item.bandiera ? `<img src="${item.bandiera}" style="width:35px;height:24px;">` : ""} <span class="allenatore">${item.allenatore || ""}</span>`;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
  };
  makeList("Serie A", palmares.serieA);
  makeList("Coppa Italia", palmares.coppaItalia);
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
  const v = [];
  if (["Federico Burello", "Mattia Beltrame"].includes(allenatore)) v.push("Milan");
  if (["Kevin Di Bernardo", "Lorenzo Moro"].includes(allenatore)) v.push("Inter");
  if (["Federico Burello", "Mattia Beltrame", "Kevin Di Bernardo"].includes(allenatore)) v.push("Juventus");
  return v.filter(s => disponibili.includes(s));
}

function getSquadreVietateFascia3(allenatore, disponibili) {
  if (allenatore === "Nicola Marano") return ["Bologna"].filter(s => disponibili.includes(s));
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

function assegnaSquadre(allenatori, squadre, fascia) {
  let disp = shuffleArray([...squadre]);
  for (let i = 0; i < allenatori.length && i < disp.length; i++) {
    risultati.push(`Fascia ${fascia}: ${allenatori[i]} -> ${disp[i]}`);
  }
}

function inizializzaSorteggio() {
  if (!caricaEstrazioneCorrente()) {
    risultati = [];
    risultatiMostrati = 0;
    risultati.push("Fascia 1: __HEADER__ -> ⚽ SORTEGGIO FASCIA 1");
    assegnaSquadreConVincoli(fascia1_allenatori, fascia1_squadre, 1, getSquadreVietateFascia1);
    risultati.push("Fascia 2: __HEADER__ -> ⚽ SORTEGGIO FASCIA 2");
    assegnaSquadre(fascia2_allenatori, fascia2_squadre, 2);
    risultati.push("Fascia 3: __HEADER__ -> ⚽ SORTEGGIO FASCIA 3");
    assegnaSquadreConVincoli(fascia3_allenatori, fascia3_squadre_pure, 3, getSquadreVietateFascia3);
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
    return;
  }
  if (audio) { audio.pause(); }
  audio = new Audio("countdown-suspense.mp3");
  audio.play();
  let c = 15;
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
    salvaEstrazioneCopletataInStorico();
    localStorage.removeItem("estrazioneCorrente");
  }
}

async function bootstrap() {
  await caricaDati();
  inizializzaSorteggio();
}

document.addEventListener("DOMContentLoaded", bootstrap);