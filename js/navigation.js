function mostraTab(nome, btn) {
    // Nascondi tutti i tab
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    // Deseleziona tutti i bottoni
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));

    // Attiva il tab selezionato
    const tab = document.getElementById('tab-' + nome);
    if (tab) tab.classList.add('active');
    if (btn) btn.classList.add('active');

    // ── INIZIALIZZA CALENDARIO 26/27 al primo accesso ──
    if (nome === 'calendario-26-27' && typeof window.initCalendario2627 === 'function') {
        window.initCalendario2627();
    }
}