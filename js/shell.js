// ============================================================
//  Sakura Study! — Shell: Injects shared header/sidebar/mascot
//  © 2026 Ahmed El Bourgy
// ============================================================

function getSharedShell(activePage) {
  const pages = [
    {id:'home', label:'🏠 Home', url:'../index.html'},
    {id:'study', label:'📖 Study', url:'study.html'},
    {id:'practice', label:'🎯 Practice', url:'practice.html'},
    {id:'tools', label:'🔧 Tools', url:'tools.html'},
    {id:'progress', label:'📊 Progress', url:'progress.html'},
  ];
  return pages;
}

function applySavedTheme() {
  try {
    if (localStorage.getItem('sakura_dark') === '1') {
      document.body.classList.add('dark');
      const btn = document.getElementById('dark-toggle');
      if (btn) btn.innerHTML = '☀️ Light';
    }
  } catch(e) {}
}

function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('dark-toggle').innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
  try { localStorage.setItem('sakura_dark', isDark ? '1' : '0'); } catch(e) {}
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function sbGo(id) {
  showSection(id);
  closeSidebar();
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('sb_' + id);
  if (btn) btn.classList.add('active');
}

// Petals animation
document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();
  const pc = document.getElementById('petals');
  if (pc) {
    ['🌸','🌺','✿','❀','🌷'].forEach((_,idx) => {
      for(let i=0;i<3;i++){
        const p=document.createElement('div');
        p.className='petal';
        p.textContent=['🌸','🌺','✿','❀','🌷'][Math.floor(Math.random()*5)];
        p.style.left=Math.random()*100+'vw';
        p.style.animationDuration=(7+Math.random()*9)+'s';
        p.style.animationDelay=(Math.random()*12)+'s';
        p.style.fontSize=(.8+Math.random()*1.1)+'rem';
        pc.appendChild(p);
      }
    });
  }
});
