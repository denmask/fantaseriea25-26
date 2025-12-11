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
    (a, b) => a.pos - b.pos
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
    (dataSet.allenatori || []).map((a) => [a.nome, a.foto])
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
    new CustomEvent("fasce-calcolate", { detail: fasceCalcolate })
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
    renderRow(s, "Fascia 3", "fascia3")
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
      `Fascia ${fascia}: ${allenatori[i]} -> ${squadreDisponibili[i]}`
    );
  }
}

function inizializzaSorteggio() {
  risultati = [];
  risultatiMostrati = 0;

  // --- Sorteggio Fascia 1 (1° - 4° posto) ---
  assegnaSquadre(fascia1_allenatori, fascia1_squadre, 1);

  // --- Sorteggio Fascia 2 (5° e 6° posto) ---
  // Assegnazione 1-a-1: 2 allenatori F2 prendono le 2 squadre F2.
  assegnaSquadre(fascia2_allenatori, fascia2_squadre, 2);

  // --- Sorteggio Fascia 3 (7° e 8° posto) ---
  // Come richiesto: assegnazione 1-a-1 solo tra i 2 allenatori F3 e le 2 squadre F3 pure.
  assegnaSquadre(fascia3_allenatori, fascia3_squadre_pure, 3);

  // Ordina i risultati per fascia (1, 2, 3) per una visualizzazione ordinata
  risultati.sort((a, b) => {
    const getFasciaNum = (str) =>
      parseInt(str.split(":")[0].replace("Fascia ", ""));
    return getFasciaNum(a) - getFasciaNum(b);
  });

  document.getElementById("output").innerHTML = "";
  renderFasceTable();
  document.getElementById("btnProssimo").style.display = "inline-block";
  document.getElementById("btnProssimo").disabled = false;
  document.getElementById("btnRicomincia").style.display = "none";
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

        // Non c'è più la logica della ripescata non assegnata in F3.
        // Assicuriamoci che ogni risultato sia una coppia valida (Allenatore -> Squadra).
        if (!allenatore || !squadra) {
          // Fallback per un caso imprevisto
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
        document.getElementById("btnProssimo").disabled = false;

        if (risultatiMostrati === risultati.length) {
          document.getElementById("btnRicomincia").style.display =
            "inline-block";
        }
      }
    }, 1000);
  } else {
    alert("Tutte le squadre sono state assegnate!");
  }
}

function ricominciaSorteggio() {
  inizializzaSorteggio();
}

async function bootstrap() {
  await caricaDati();
  inizializzaSorteggio();
}

document.addEventListener("DOMContentLoaded", bootstrap);
