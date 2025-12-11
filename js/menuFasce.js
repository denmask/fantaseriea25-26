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
  fasceCalcolate.fascia3.forEach((s) => createRow("Fascia 3", s, "fascia3"));
}

document.addEventListener("fasce-calcolate", (evt) =>
  renderFasceDaEvento(evt.detail)
);

document.addEventListener("DOMContentLoaded", () => {
  if (window.fasceCalcolate) {
    renderFasceDaEvento(window.fasceCalcolate);
  }
});
