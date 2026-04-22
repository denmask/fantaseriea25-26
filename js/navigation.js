// ── NAVIGAZIONE: chip desktop + dropdown mobile ──

function mostraTab(nome, btn) {
  // Nascondi tutti i tab
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  // Deseleziona tutti i bottoni (sia desktop che mobile)
  document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));

  // Attiva il tab selezionato
  const tab = document.getElementById('tab-' + nome);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');

  // Aggiorna etichetta trigger mobile
  const label = document.getElementById('nav-mobile-label');
  if (label && btn) {
    label.textContent = btn.textContent.trim();
  }

  // Chiudi dropdown mobile se aperto
  const navMobile = document.getElementById('nav-mobile');
  if (navMobile) navMobile.classList.remove('open');

  // ── INIZIALIZZA CALENDARIO 26/27 al primo accesso ──
  if (nome === 'calendario-26-27' && typeof window.initCalendario2627 === 'function') {
    window.initCalendario2627();
  }
}

// Toggle dropdown mobile
document.addEventListener('DOMContentLoaded', () => {
  const navMobile = document.getElementById('nav-mobile');
  const trigger = document.querySelector('.nav-mobile-trigger');

  if (trigger && navMobile) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      navMobile.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!navMobile.contains(e.target)) {
        navMobile.classList.remove('open');
      }
    });
  }
});