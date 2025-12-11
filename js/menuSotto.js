function aggiornaCountdown() {
    const dataEvento = new Date(document.getElementById("dataEvento").value);
    const now = new Date();

    if (isNaN(dataEvento.getTime())) {
        document.getElementById("timer").textContent = "Seleziona una data valida!";
        return;
    }

    const diff = dataEvento - now;

    if (diff <= 0) {
        document.getElementById("timer").textContent = "L'evento è in corso o già passato!";
    } else {
        const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
        const ore = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minuti = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondi = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("timer").textContent = `${giorni} giorni, ${ore} ore, ${minuti} minuti, ${secondi} secondi rimanenti`;
    }
}

setInterval(aggiornaCountdown, 1000);
