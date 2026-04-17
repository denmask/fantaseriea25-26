(function () {
  "use strict";

  const JSON_PATH = "calendarioFanta2627.json";
  const CONTAINER_ID = "calendario-content";

  window.initCalendario2627 = function () {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;
    if (container.dataset.loaded === "true") return;

    container.innerHTML = '<p class="helper-text" style="text-align:center;padding:40px 0;">Caricamento calendario…</p>';

    fetch(JSON_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error("Impossibile caricare il calendario.");
        return res.json();
      })
      .then(function (data) {
        renderCalendario(container, data);
        container.dataset.loaded = "true";
      })
      .catch(function (err) {
        container.innerHTML = '<p class="helper-text" style="text-align:center;padding:40px 0;color:#ff3d57;">⚠️ ' + err.message + "</p>";
      });
  };

  function renderCalendario(container, data) {
    const stagione = data.stagione || "2026/2027";
    let html = "";

    html += '<div class="calendario-stagione">';
    html +=   '<div class="calendario-header-info">';
    html +=     "<h3>🏆 FANTA MASTERCHEF " + stagione + "</h3>";
    html +=     '<p class="stagione-date">Campionato Fanta · 38 Giornate · 8 Squadre</p>';
    html +=   "</div>";
    html += "</div>";

    html += '<div class="giornate-container">';
    data.giornate.forEach(function (giornata, idx) {
      html += renderGiornata(giornata, idx);
    });
    html += "</div>";

    container.innerHTML = html;
  }

  function renderGiornata(giornata, idx) {
    let html = '<div class="card-giornata" style="--index:' + idx + '">';

    html += '<div class="giornata-header">';
    html +=   '<div class="giornata-numero">';
    html +=     '<span class="numero">⚽ Giornata ' + giornata.numero + '</span>';
    html +=   '</div>';
    html += '</div>';

    html += '<div class="partite-lista">';
    giornata.partite.forEach(function (partita) {
      html += renderPartita(partita);
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderPartita(partita) {
    const giocata = partita.golCasa !== null && partita.golTrasferta !== null;
    const cls = giocata ? "partita-card giocata" : "partita-card da-giocare";

    let html = '<div class="' + cls + '">';
    html += '<div class="partita-squadre">';

    html += '<div class="squadra">';
    html +=   '<img class="logo-piccolo" src="' + partita.casa.logo + '" alt="' + partita.casa.nome + '" onerror="this.style.opacity=\'0\'">';
    html +=   '<span class="nome-squadra">' + partita.casa.nome + '</span>';
    html += '</div>';

    if (giocata) {
      html += '<span class="goal">' + partita.golCasa + '</span>';
      html += '<span class="vs">-</span>';
      html += '<span class="goal">' + partita.golTrasferta + '</span>';
    } else {
      html += '<span class="vs">vs</span>';
    }

    html += '<div class="squadra">';
    html +=   '<img class="logo-piccolo" src="' + partita.trasferta.logo + '" alt="' + partita.trasferta.nome + '" onerror="this.style.opacity=\'0\'">';
    html +=   '<span class="nome-squadra">' + partita.trasferta.nome + '</span>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    return html;
  }

})();