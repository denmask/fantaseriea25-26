function renderClassificaFantacalcio(dataset) {
  const classificaSerieA = document.getElementById("classifica");
  if (!classificaSerieA || !dataset?.classificaFantacalcio) return;

  const classificaFantacalcio = document.createElement("div");
  classificaFantacalcio.id = "classificaFantacalcio";
  classificaFantacalcio.classList.add("schermata");

  let tabellaHTML = `
        <h2>Classifica Fantacalcio 2025/2026</h2>
        <table>
            <thead>
                <tr>
                    <th>Posizione</th>
                    <th>Squadra</th>
                    <th>Punti</th>
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
                    <td><img src="${squadra.logo}" alt="${squadra.nome}" class="logo-squadra"> ${squadra.nome}</td>
                    <td>${squadra.punti}</td>
                </tr>
            `;
    });

  tabellaHTML += `
            </tbody>
        </table>
    `;

  classificaFantacalcio.innerHTML = tabellaHTML;
  classificaSerieA.appendChild(classificaFantacalcio);
}

document.addEventListener("dati-caricati", (evt) =>
  renderClassificaFantacalcio(evt.detail)
);

document.addEventListener("DOMContentLoaded", () => {
  if (window.dataSet) {
    renderClassificaFantacalcio(window.dataSet);
  }
});
