function renderClassificaSerieA(classifica) {
  const tabellaBody = document.querySelector("#tabellaClassifica tbody");
  if (!tabellaBody || !classifica) return;

  tabellaBody.innerHTML = "";
  classifica
    .sort((a, b) => a.pos - b.pos)
    .forEach((team) => {
      const riga = document.createElement("tr");

      const cellaPosizione = document.createElement("td");
      cellaPosizione.textContent = team.pos;

      const cellaSquadra = document.createElement("td");
      const img = document.createElement("img");
      img.src = team.logo;
      img.alt = team.nome;
      cellaSquadra.appendChild(img);
      cellaSquadra.appendChild(document.createTextNode(team.nome));

      const cellaPunti = document.createElement("td");
      cellaPunti.textContent = team.punti;

      riga.appendChild(cellaPosizione);
      riga.appendChild(cellaSquadra);
      riga.appendChild(cellaPunti);

      tabellaBody.appendChild(riga);
    });
}

document.addEventListener("dati-caricati", (evt) => {
  renderClassificaSerieA(evt.detail.classificaSerieA);
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.dataSet?.classificaSerieA) {
    renderClassificaSerieA(window.dataSet.classificaSerieA);
  }
});
