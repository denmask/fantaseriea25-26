function aggiornaCountdown() {
    const input = document.getElementById("dataEvento");
    if (!input) return; // elemento non presente in questa pagina

    const dataEvento = new Date(input.value);
    const now = new Date();

    const timerEl = document.getElementById("timer");
    if (!timerEl) return;

    if (isNaN(dataEvento.getTime())) {
        timerEl.textContent = "Seleziona una data valida!";
        return;
    }

    const diff = dataEvento - now;

    if (diff <= 0) {
        timerEl.textContent = "L'evento è in corso o già passato!";
    } else {
        const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
        const ore = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minuti = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondi = Math.floor((diff % (1000 * 60)) / 1000);

        timerEl.textContent = `${giorni} giorni, ${ore} ore, ${minuti} minuti, ${secondi} secondi rimanenti`;
    }
}

setInterval(aggiornaCountdown, 1000);