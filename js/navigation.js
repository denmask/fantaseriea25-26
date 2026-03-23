function mostraTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

  document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
  
  const selectedTab = document.getElementById('tab-' + id);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  if (btn) {
    btn.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const firstTab = document.querySelector('.tab-content');
  const firstBtn = document.querySelector('.chip-btn');
  
  if (firstTab && firstBtn) {
    firstTab.classList.add('active');
    firstBtn.classList.add('active');
  }
});