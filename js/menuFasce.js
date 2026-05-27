function renderFasceDaEvento(fasceCalcolate) {
  const tbody = document.querySelector("#tabellaFasce tbody");
  if (!tbody || !fasceCalcolate) return;
  tbody.innerHTML = "";

  const createRow = (fasciaLabel, squadra, classe) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="${classe}">${fasciaLabel}</td>
            <td>
                <img src="${squadra.logo || ""}" alt="${
      squadra.nome
    } Stemma" class="stemma">
                ${squadra.nome}
            </td>`;
    tbody.appendChild(row);
  };

  fasceCalcolate.fascia1.forEach((s) => createRow("Fascia 1", s, "fascia1"));
  fasceCalcolate.fascia2.forEach((s) => createRow("Fascia 2", s, "fascia2"));
  fasceCalcolate.fascia3_pure.forEach((s) => createRow("Fascia 3", s, "fascia3"));
}

document.addEventListener("fasce-calcolate", (evt) =>
  renderFasceDaEvento(evt.detail)
);

document.addEventListener("DOMContentLoaded", () => {
  if (window.fasceCalcolate) {
    renderFasceDaEvento(window.fasceCalcolate);
  }
});

// ── LEGENDA FANTALLENATORI PER FASCIA ──
function renderLegendaFasce(dataset) {
  const container = document.getElementById("legenda-fasce");
  if (!container || !dataset?.allenatori) return;

  const allenatori = dataset.allenatori;
  const fasceMap = { 1: [], 2: [], 3: [] };
  allenatori.forEach((a) => {
    if (fasceMap[a.fascia]) fasceMap[a.fascia].push(a);
  });

  const fasciaConfig = {
    1: { label: "Fascia 1", classe: "legenda-fascia-1", emoji: "🥇" },
    2: { label: "Fascia 2", classe: "legenda-fascia-2", emoji: "🥈" },
    3: { label: "Fascia 3", classe: "legenda-fascia-3", emoji: "🥉" },
  };

  let html = '<div class="legenda-fasce-wrapper">';
  html += '<h3 class="legenda-fasce-title">👥 Fantallenatori per Fascia</h3>';
  html += '<p class="legenda-fasce-sub">La fascia determina il pool di squadre sorteggiabili</p>';

  // ── HEADER: 3 colonne con titolo fascia + squadre ref ──
  html += '<div class="legenda-table">';

  // Riga intestazione fasce
  html += '<div class="legenda-row legenda-header-row">';
  [1, 2, 3].forEach((f) => {
    const cfg = fasciaConfig[f];
    const lista = fasceMap[f];
    const squadreRef = [];
    lista.forEach((a) => {
      (a.vincoli?.squadreAmmesse || []).forEach((s) => {
        if (!squadreRef.includes(s)) squadreRef.push(s);
      });
    });

    html += `<div class="legenda-col legenda-fascia-${f}-col">`;

    // Header fascia
    html += `<div class="legenda-fascia-header legenda-fascia-${f}-header">`;
    html += `<span class="legenda-fascia-emoji">${cfg.emoji}</span>`;
    html += `<span class="legenda-fascia-label legenda-fascia-${f}-label">${cfg.label}</span>`;
    html += `<span class="legenda-fascia-count">${lista.length} allenator${lista.length === 1 ? "e" : "i"}</span>`;
    html += `</div>`;

    // Squadre di riferimento
    if (squadreRef.length > 0) {
      html += `<div class="legenda-squadre-ref legenda-fascia-${f}-ref">`;
      html += `<span class="legenda-squadre-ref-label">🏟 Squadre di riferimento</span>`;
      html += `<div class="legenda-squadre-ref-chips">`;
      squadreRef.forEach((s) => {
        const logoKey = s.toLowerCase().replace(/\s+/g, "");
        html += `<span class="legenda-squadra-chip legenda-fascia-${f}-chip">`;
        html += `<img class="legenda-squadra-chip-logo" src="images/${logoKey}.png" alt="${s}" onerror="this.style.display='none'">`;
        html += `${s}`;
        html += `</span>`;
      });
      html += `</div></div>`;
    }

    // Lista allenatori visibile solo su mobile (su desktop le righe sono separate)
    html += `<div class="legenda-allenatori-lista legenda-mobile-only">`;
    fasceMap[f].forEach((a) => {
      html += `<div class="legenda-allenatore-item legenda-allenatore-cell legenda-fascia-${f}-item">`;
      html += `<img class="legenda-foto" src="${a.foto}" alt="${a.nome}" onerror="this.style.opacity='0'">`;
      html += `<span class="legenda-nome">${a.nome}</span>`;
      html += `</div>`;
    });
    html += `</div>`;

    html += `</div>`; // fine col
  });
  html += '</div>'; // fine header-row

  // ── RIGHE ALLENATORI: 1 riga per slot (max 4 righe) ──
  const maxRows = Math.max(fasceMap[1].length, fasceMap[2].length, fasceMap[3].length);
  for (let i = 0; i < maxRows; i++) {
    html += `<div class="legenda-row legenda-allenatore-row">`;
    [1, 2, 3].forEach((f) => {
      const a = fasceMap[f][i];
      html += `<div class="legenda-col legenda-fascia-${f}-col legenda-allenatore-cell legenda-fascia-${f}-item">`;
      if (a) {
        html += `<img class="legenda-foto" src="${a.foto}" alt="${a.nome}" onerror="this.style.opacity='0'">`;
        html += `<span class="legenda-nome">${a.nome}</span>`;
      }
      html += `</div>`;
    });
    html += `</div>`;
  }

  html += '</div>'; // fine legenda-table
  html += '</div>'; // fine wrapper
  container.innerHTML = html;
}

document.addEventListener("dati-caricati", (evt) => {
  renderLegendaFasce(evt.detail);
});

document.addEventListener("DOMContentLoaded", () => {
  const carica = () => {
    if (window.dataSet) {
      renderLegendaFasce(window.dataSet);
    } else {
      fetch("data.json", { cache: "no-cache" })
        .then((r) => r.json())
        .then((data) => renderLegendaFasce(data))
        .catch((e) => console.error("Errore legenda fasce:", e));
    }
  };
  setTimeout(carica, 400);
});