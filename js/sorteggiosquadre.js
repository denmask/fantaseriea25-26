let dataSet = null;
let fascia1_allenatori = [];
let fascia2_allenatori = [];
let fascia3_allenatori = [];

let fascia1_squadre = [];
let fascia2_squadre = [];
let fascia3_squadre_pure = []; // Le 2 squadre dalla 7° e 8° posizione
let resto_squadre = []; // Le squadre dalla 9° posizione in poi (NON USATE NEL SORTEGGIO E NON VISUALIZZATE)

let logoPerSquadra = {};
let fotoAllenatore = {};

let fasceCalcolate = { fascia1: [], fascia2: [], fascia3_pure: [], resto: [] };

let risultati = [];
let risultatiMostrati = 0;
let audio = null;

// ========== FUNZIONI PER LOCALSTORAGE ==========

// Funzione per salvare l'estrazione corrente in localStorage
function salvaEstrazioneCorrente() {
  if (risultati.length === 0) return;

  const estrazione = {
    data: new Date().toISOString(),
    risultati: risultati,
    risultatiMostrati: risultatiMostrati,
    timestamp: Date.now(),
  };

  // Salva l'estrazione corrente
  localStorage.setItem("estrazioneCorrente", JSON.stringify(estrazione));
  console.log("Estrazione corrente salvata in localStorage");
}

// Funzione per caricare l'estrazione corrente da localStorage
function caricaEstrazioneCorrente() {
  const estrazione = localStorage.getItem("estrazioneCorrente");
  if (estrazione) {
    const dati = JSON.parse(estrazione);
    risultati = dati.risultati || [];
    risultatiMostrati = dati.risultatiMostrati || 0;
    console.log("Estrazione corrente caricata da localStorage");
    return true;
  }
  return false;
}

// Funzione per salvare l'estrazione completata nello storico
function salvaEstrazioneCopletataInStorico() {
  if (risultati.length === 0) return;

  const estrazione = {
    data: new Date().toISOString(),
    risultati: risultati,
    timestamp: Date.now(),
  };

  // Recupera le estrazioni precedenti
  let estrazioniSalvate = JSON.parse(
    localStorage.getItem("estrazioniFantacalcio") || "[]",
  );

  // Aggiungi la nuova estrazione
  estrazioniSalvate.push(estrazione);

  // Salva in localStorage
  localStorage.setItem(
    "estrazioniFantacalcio",
    JSON.stringify(estrazioniSalvate),
  );

  console.log("Estrazione completata salvata nello storico!", estrazione);
}

// Funzione per caricare le estrazioni salvate
function caricaEstrazioni() {
  const estrazioni = localStorage.getItem("estrazioniFantacalcio");
  return estrazioni ? JSON.parse(estrazioni) : [];
}

// Funzione per mostrare le estrazioni salvate
function mostraEstrazioniSalvate() {
  const estrazioni = caricaEstrazioni();
  console.log("Estrazioni salvate:", estrazioni);
  return estrazioni;
}

// Funzione per visualizzare lo storico delle estrazioni
function visualizzaStorico() {
  const estrazioni = caricaEstrazioni();

  if (estrazioni.length === 0) {
    alert("Nessuna estrazione salvata nello storico!");
    return;
  }

  let html =
    '<div class="storico-estrazioni" style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;"><h2>Storico Estrazioni Completate</h2>';

  estrazioni.reverse().forEach((estrazione, index) => {
    const realIndex = estrazioni.length - 1 - index;
    const data = new Date(estrazione.data).toLocaleString("it-IT");
    html += `<div class="estrazione-salvata" style="margin: 15px 0; padding: 15px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="color: #333; margin-bottom: 10px;">Estrazione ${realIndex + 1} - ${data}</h3>
      <ul style="list-style: none; padding: 0;">`;

    estrazione.risultati.forEach((ris) => {
      const [fascia, dettagli] = ris.split(": ");
      html += `<li style="padding: 8px; margin: 5px 0; background: #f9f9f9; border-left: 3px solid #4CAF50; padding-left: 10px;">
        <strong>${fascia}:</strong> ${dettagli}
      </li>`;
    });

    html += `</ul>
      <button onclick="eliminaEstrazione(${realIndex})" style="margin-top: 10px; padding: 5px 15px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
        Elimina questa estrazione
      </button>
    </div>`;
  });

  html += "</div>";

  // Mostra nello stesso container dell'output
  const container = document.getElementById("output");
  const storicoDiv = document.createElement("div");
  storicoDiv.innerHTML = html;
  container.insertBefore(storicoDiv, container.firstChild);
}

// Funzione per eliminare una singola estrazione
function eliminaEstrazione(index) {
  if (confirm("Sei sicuro di voler eliminare questa estrazione?")) {
    let estrazioni = caricaEstrazioni();
    estrazioni.splice(index, 1);
    localStorage.setItem("estrazioniFantacalcio", JSON.stringify(estrazioni));
    alert("Estrazione eliminata!");
    // Ricarica la visualizzazione
    document.getElementById("output").innerHTML = "";
    visualizzaStorico();
  }
}

// Funzione per eliminare tutte le estrazioni (RESET COMPLETO)
function resetCompleto() {
  if (
    confirm(
      "Sei sicuro di voler eliminare TUTTO? Questo cancellerà:\n- Tutte le estrazioni nello storico\n- L'estrazione corrente in corso\n\nQuesta operazione non può essere annullata!",
    )
  ) {
    // Rimuovi tutto dal localStorage
    localStorage.removeItem("estrazioniFantacalcio");
    localStorage.removeItem("estrazioneCorrente");

    // Reset delle variabili
    risultati = [];
    risultatiMostrati = 0;

    // Pulisci l'output
    document.getElementById("output").innerHTML = "";

    // Reinizializza il sorteggio
    inizializzaSorteggio();

    alert("Reset completo eseguito! Tutte le estrazioni sono state eliminate.");
  }
}

// Funzione per ripristinare i risultati già estratti nella UI
function ripristinaRisultatiVisibili() {
  const output = document.getElementById("output");
  output.innerHTML = "";

  // Mostra tutti i risultati già estratti
  for (let i = 0; i < risultatiMostrati; i++) {
    let risultato = risultati[i];
    let [fascia, dettagli] = risultato.split(": ");
    let [allenatore, squadra] = dettagli.split(" -> ");

    let evidenza = document.createElement("div");
    evidenza.classList.add("casella-evidenza");

    let etichettaFascia = document.createElement("div");
    etichettaFascia.classList.add("etichetta-fascia");
    etichettaFascia.textContent = fascia;

    if (!allenatore || !squadra) {
      let testo = document.createElement("p");
      testo.innerHTML = `Errore di assegnazione. Dettagli: ${dettagli}`;
      evidenza.appendChild(testo);
    } else {
      let imgAllenatore = document.createElement("img");
      const foto =
        fotoAllenatore[allenatore] ||
        `images/${allenatore.toLowerCase().replace(/ /g, "_")}.jpg`;
      imgAllenatore.src = foto;
      imgAllenatore.alt = `Foto di ${allenatore}`;
      imgAllenatore.classList.add("foto-allenatore");

      let imgSquadra = document.createElement("img");
      const stemma =
        logoPerSquadra[squadra] ||
        `images/${squadra.toLowerCase().replace(/ /g, "_")}.png`;
      imgSquadra.src = stemma;
      imgSquadra.alt = `Stemma ${squadra}`;
      imgSquadra.classList.add("stemma-squadra");

      let testo = document.createElement("p");
      testo.innerHTML = `<strong>${allenatore}</strong> è stato assegnato alla squadra <strong>${squadra}</strong>!`;

      evidenza.appendChild(imgAllenatore);
      evidenza.appendChild(imgSquadra);
      evidenza.appendChild(testo);
    }

    evidenza.prepend(etichettaFascia);
    output.prepend(evidenza);
  }

  // Aggiorna i pulsanti
  if (risultatiMostrati === risultati.length && risultati.length > 0) {
    document.getElementById("btnProssimo").style.display = "none";
    document.getElementById("btnRicomincia").style.display = "inline-block";
  }
}

// ========== FINE FUNZIONI LOCALSTORAGE ==========

async function caricaDati() {
  try {
    const response = await fetch("data.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Errore fetch data.json");
    dataSet = await response.json();
  } catch (error) {
    console.error("Impossibile caricare data.json", error);
    alert("Impossibile caricare data.json. Controlla il server locale.");
    return;
  }

  const classifica = [...dataSet.classificaSerieA].sort(
    (a, b) => a.pos - b.pos,
  );
  const fascia1Count = dataSet?.config?.fasce?.fascia1Count ?? 4; // 4
  const fascia2Count = dataSet?.config?.fasce?.fascia2Count ?? 2; // 2
  const fascia3Count = dataSet?.config?.fasce?.fascia3Count ?? 2; // 2 (Posizioni 7 e 8)

  const startF3 = fascia1Count + fascia2Count; // Posizione 7 (indice 6)
  const endF3 = startF3 + fascia3Count; // Posizione 9 (indice 8)

  // Assegna le squadre alle fasce secondo la logica richiesta
  fasceCalcolate.fascia1 = classifica.slice(0, fascia1Count); // 1-4
  fasceCalcolate.fascia2 = classifica.slice(fascia1Count, startF3); // 5-6
  fasceCalcolate.fascia3_pure = classifica.slice(startF3, endF3); // 7-8
  fasceCalcolate.resto = classifica.slice(endF3); // 9-20 (Non mostrato e non usato)

  fascia1_squadre = fasceCalcolate.fascia1.map((s) => s.nome);
  fascia2_squadre = fasceCalcolate.fascia2.map((s) => s.nome);
  fascia3_squadre_pure = fasceCalcolate.fascia3_pure.map((s) => s.nome);
  resto_squadre = fasceCalcolate.resto.map((s) => s.nome);

  logoPerSquadra = Object.fromEntries(classifica.map((s) => [s.nome, s.logo]));
  fotoAllenatore = Object.fromEntries(
    (dataSet.allenatori || []).map((a) => [a.nome, a.foto]),
  );

  fascia1_allenatori = dataSet.allenatori
    .filter((a) => a.fascia === 1)
    .map((a) => a.nome);
  fascia2_allenatori = dataSet.allenatori
    .filter((a) => a.fascia === 2)
    .map((a) => a.nome);
  fascia3_allenatori = dataSet.allenatori
    .filter((a) => a.fascia === 3)
    .map((a) => a.nome);

  window.dataSet = dataSet;
  window.fasceCalcolate = fasceCalcolate;

  renderPalmares(dataSet?.palmares);

  document.dispatchEvent(new CustomEvent("dati-caricati", { detail: dataSet }));
  document.dispatchEvent(
    new CustomEvent("fasce-calcolate", { detail: fasceCalcolate }),
  );
}

function renderFasceTable() {
  const tbody = document.querySelector("#tabellaFasce tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const renderRow = (item, label, classe) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="${classe}">${label}</td>
            <td>
                <img src="${item.logo || ""}" alt="${item.nome}" class="stemma">
                ${item.nome}
            </td>`;
    tbody.appendChild(row);
  };

  fasceCalcolate.fascia1.forEach((s) => renderRow(s, "Fascia 1", "fascia1"));
  fasceCalcolate.fascia2.forEach((s) => renderRow(s, "Fascia 2", "fascia2"));

  // Fascia 3 mostrata senza indicazioni di posizione e solo le squadre 7° e 8°
  fasceCalcolate.fascia3_pure.forEach((s) =>
    renderRow(s, "Fascia 3", "fascia3"),
  );
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
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      const labelEmoji = item.emoji ? `${item.emoji} ` : "";
      const cuore = item.cuore ? ` ${item.cuore}` : "";
      const allenatore = item.allenatore
        ? `<span class="allenatore">${item.allenatore}</span>`
        : "";
      const bandiera = item.bandiera
        ? `<img src="${item.bandiera}" alt="${item.squadra}" style="width: 35px; height: 24px;">`
        : "";
      const squadra = item.squadra ? item.squadra : "";
      li.innerHTML = `${item.stagione}: ${labelEmoji}${
        squadra ? squadra : "🏆"
      } ${bandiera}${cuore} ${allenatore}`;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
  };

  makeList("Serie A TIM/Enilive", palmares.serieA);
  makeList("Coppa Italia Frecciarossa", palmares.coppaItalia);
  makeList("Fifa World Cup", palmares.worldCup);
  makeList("Euro", palmares.euro);
}

function playSuspense() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  audio = new Audio("countdown-suspense.mp3");
  audio.loop = true;
  audio.volume = 0.5;
  audio.play();
}

function stopSuspense() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function assegnaSquadre(allenatori, squadre, fascia) {
  let squadreDisponibili = [...squadre];
  shuffleArray(squadreDisponibili);
  // Assegna il minimo tra allenatori e squadre, in teoria sono uguali (4, 2, 2)
  for (let i = 0; i < allenatori.length && i < squadreDisponibili.length; i++) {
    risultati.push(
      `Fascia ${fascia}: ${allenatori[i]} -> ${squadreDisponibili[i]}`,
    );
  }
}

function inizializzaSorteggio() {
  // Controlla se c'è un'estrazione in corso salvata
  const estrazioneCaricata = caricaEstrazioneCorrente();

  if (!estrazioneCaricata) {
    // Nessuna estrazione salvata, inizia da zero
    risultati = [];
    risultatiMostrati = 0;

    // --- Sorteggio Fascia 1 (1° - 4° posto) ---
    assegnaSquadre(fascia1_allenatori, fascia1_squadre, 1);

    // --- Sorteggio Fascia 2 (5° e 6° posto) ---
    assegnaSquadre(fascia2_allenatori, fascia2_squadre, 2);

    // --- Sorteggio Fascia 3 (7° e 8° posto) ---
    assegnaSquadre(fascia3_allenatori, fascia3_squadre_pure, 3);

    // Ordina i risultati per fascia
    risultati.sort((a, b) => {
      const getFasciaNum = (str) =>
        parseInt(str.split(":")[0].replace("Fascia ", ""));
      return getFasciaNum(a) - getFasciaNum(b);
    });

    // Salva subito la nuova estrazione
    salvaEstrazioneCorrente();
  } else {
    // Estrazione caricata da localStorage, ripristina la visualizzazione
    console.log("Estrazione ripristinata da localStorage");
  }

  document.getElementById("output").innerHTML = "";
  renderFasceTable();

  if (risultatiMostrati < risultati.length) {
    document.getElementById("btnProssimo").style.display = "inline-block";
    document.getElementById("btnProssimo").disabled = false;
    document.getElementById("btnRicomincia").style.display = "none";
  } else {
    document.getElementById("btnProssimo").style.display = "none";
    document.getElementById("btnRicomincia").style.display = "inline-block";
  }

  // Ripristina i risultati visibili se ci sono
  if (risultatiMostrati > 0) {
    ripristinaRisultatiVisibili();
  }
}

function mostraProssimo() {
  let output = document.getElementById("output");

  if (risultatiMostrati < risultati.length) {
    document.getElementById("btnProssimo").disabled = true;

    let risultato = risultati[risultatiMostrati];
    let [fascia, dettagli] = risultato.split(": ");
    let [allenatore, squadra] = dettagli.split(" -> ");

    playSuspense();

    let countdown = 15;
    let countdownDisplay = document.createElement("div");
    countdownDisplay.classList.add("countdown-display");
    countdownDisplay.textContent = countdown;
    countdownDisplay.style.color = "red";
    countdownDisplay.style.fontSize = "50px";
    output.appendChild(countdownDisplay);

    let countdownInterval = setInterval(() => {
      countdown--;
      countdownDisplay.textContent = countdown;

      if (audio && !audio.paused && countdown <= 3) {
        audio.volume = 0.8;
      }

      if (countdown === 0) {
        clearInterval(countdownInterval);
        stopSuspense();
        countdownDisplay.remove();

        let evidenza = document.createElement("div");
        evidenza.classList.add("casella-evidenza");

        let etichettaFascia = document.createElement("div");
        etichettaFascia.classList.add("etichetta-fascia");
        etichettaFascia.textContent = fascia;

        if (!allenatore || !squadra) {
          let testo = document.createElement("p");
          testo.innerHTML = `Errore di assegnazione. Dettagli: ${dettagli}`;
          evidenza.appendChild(testo);
        } else {
          let imgAllenatore = document.createElement("img");
          const foto =
            fotoAllenatore[allenatore] ||
            `images/${allenatore.toLowerCase().replace(/ /g, "_")}.jpg`;
          imgAllenatore.src = foto;
          imgAllenatore.alt = `Foto di ${allenatore}`;
          imgAllenatore.classList.add("foto-allenatore");

          let imgSquadra = document.createElement("img");
          const stemma =
            logoPerSquadra[squadra] ||
            `images/${squadra.toLowerCase().replace(/ /g, "_")}.png`;
          imgSquadra.src = stemma;
          imgSquadra.alt = `Stemma ${squadra}`;
          imgSquadra.classList.add("stemma-squadra");

          let testo = document.createElement("p");
          testo.innerHTML = `<strong>${allenatore}</strong> è stato assegnato alla squadra <strong>${squadra}</strong>!`;

          evidenza.appendChild(imgAllenatore);
          evidenza.appendChild(imgSquadra);
          evidenza.appendChild(testo);
        }

        evidenza.prepend(etichettaFascia);
        output.prepend(evidenza);

        risultatiMostrati++;

        // Salva il progresso
        salvaEstrazioneCorrente();

        document.getElementById("btnProssimo").disabled = false;

        if (risultatiMostrati === risultati.length) {
          document.getElementById("btnProssimo").style.display = "none";
          document.getElementById("btnRicomincia").style.display =
            "inline-block";

          // SALVA L'ESTRAZIONE COMPLETATA NELLO STORICO
          salvaEstrazioneCopletataInStorico();

          // Rimuovi l'estrazione corrente dal localStorage
          localStorage.removeItem("estrazioneCorrente");

          alert("Estrazione completata e salvata nello storico!");
        }
      }
    }, 1000);
  } else {
    alert("Tutte le squadre sono state assegnate!");
  }
}

function ricominciaSorteggio() {
  if (
    confirm(
      "Vuoi ricominciare un nuovo sorteggio? L'estrazione corrente verrà eliminata.",
    )
  ) {
    // Rimuovi l'estrazione corrente
    localStorage.removeItem("estrazioneCorrente");

    // Reset variabili
    risultati = [];
    risultatiMostrati = 0;

    // Reinizializza
    inizializzaSorteggio();
  }
}

async function bootstrap() {
  await caricaDati();
  inizializzaSorteggio();
}

document.addEventListener("DOMContentLoaded", bootstrap);
