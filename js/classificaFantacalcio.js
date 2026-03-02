function renderClassificaFantacalcio(dataset) {
  const container = document.getElementById("classifica-fanta");
  if (!container || !dataset?.classificaFantacalcio) return;

  let tabellaHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Squadra</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
  `;

  dataset.classificaFantacalcio
    .sort((a, b) => a.pos - b.pos)
    .forEach((squadra) => {
      tabellaHTML += `
        <tr>
          <td>${squadra.pos}</td>
          <td><img src="${squadra.logo}" alt="${squadra.nome}" class="stemma"> ${squadra.nome}</td>
          <td>${squadra.punti}</td>
        </tr>
      `;
    });

  tabellaHTML += `</tbody></table>`;
  container.innerHTML = tabellaHTML;
}

document.addEventListener("dati-caricati", (evt) => {
  renderClassificaFantacalcio(evt.detail);
});

document.addEventListener("DOMContentLoaded", () => {
  const carica = () => {
    if (window.dataSet) {
      renderClassificaFantacalcio(window.dataSet);
    } else {
      fetch("data.json", { cache: "no-cache" })
        .then(r => r.json())
        .then(data => renderClassificaFantacalcio(data))
        .catch(e => console.error("Errore classifica fanta:", e));
    }
  };
  setTimeout(carica, 600);
});