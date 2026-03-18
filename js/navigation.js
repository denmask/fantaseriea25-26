/**
 * Navigation Module
 * Gestisce la navigazione tra i tab della pagina
 */

function mostraTab(id, btn) {
  // Rimuovi la classe 'active' da tutti i tab
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  // Rimuovi la classe 'active' da tutti i bottoni di navigazione
  document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
  
  // Aggiungi la classe 'active' al tab selezionato
  const selectedTab = document.getElementById('tab-' + id);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Aggiungi la classe 'active' al bottone selezionato
  if (btn) {
    btn.classList.add('active');
  }
}

/**
 * Inizializzazione della navigazione
 */
document.addEventListener('DOMContentLoaded', () => {
  // Imposta il primo tab come attivo per default
  const firstTab = document.querySelector('.tab-content');
  const firstBtn = document.querySelector('.chip-btn');
  
  if (firstTab && firstBtn) {
    firstTab.classList.add('active');
    firstBtn.classList.add('active');
  }
});