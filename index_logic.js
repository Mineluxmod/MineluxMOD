import { GITHUB, fetchJSON, toast } from './utils.js';
import { getCurrentUser, loadUsers } from './users.js';

let allMods = [];
let currentUser = null;
let users = {};

async function init() {
  try {
    users = await loadUsers();
    currentUser = getCurrentUser();
    updateUI();
    await loadMods();
    setupEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    toast('فشل تهيئة التطبيق', 'error');
  }
}

async function loadMods() {
  try {
    allMods = await fetchJSON(`https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}/${GITHUB.branch}/${GITHUB.modsPath}`);
    renderMods(allMods);
    populateFilters();
  } catch (err) {
    toast('فشل تحميل المودات', 'error');
    allMods = [];
  }
}

function renderMods(mods) {
  const container = document.getElementById('mods');
  if (!container) return;

  if (mods.length === 0) {
    container.innerHTML = '<div class="panel center">لا توجد مودات متاحة</div>';
    return;
  }

  container.innerHTML = mods.map(mod => `
    <div class="card">
      <img class="thumb" src="${mod.image || 'https://placehold.co/400x225?text=No+Image'}" alt="${mod.name}" onerror="this.src='https://placehold.co/400x225?text=Error+Loading'"/>
      <div class="content">
        <h3>${mod.name}</h3>
        <p>${mod.desc || 'لا يوجد وصف'}</p>
        <div class="grid" style="grid-template-columns:1fr 1fr; margin-top:12px; gap: 8px;">
          <span style="font-size: 10px; background: #2a2a2a; padding: 4px; border-radius: 6px; text-align: center;">${mod.version || 'N/A'}</span>
          <span style="font-size: 10px; background: #2a2a2a; padding: 4px; border-radius: 6px; text-align: center;">${mod.type || 'N/A'}</span>
        </div>
        <a href="${mod.link || '#'}" class="btn" style="margin-top:12px; width: 100%; text-align: center; text-decoration: none;" target="_blank">تحميل</a>
      </div>
    </div>
  `).join('');
}

function populateFilters() {
  const versionSelect = document.getElementById('vSel');
  const typeSelect = document.getElementById('tSel');
  
  if (!versionSelect || !typeSelect) return;

  versionSelect.innerHTML = '<option value="">الكل</option>';
  typeSelect.innerHTML = '<option value="">الكل</option>';

  const versions = [...new Set(allMods.map(mod => mod.version).filter(Boolean))];
  const types = [...new Set(allMods.map(mod => mod.type).filter(Boolean))];

  versions.forEach(version => {
    versionSelect.appendChild(new Option(version, version));
  });

  types.forEach(type => {
    typeSelect.appendChild(new Option(type, type));
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById('q');
  const versionSelect = document.getElementById('vSel');
  const typeSelect = document.getElementById('tSel');

  if (searchInput) searchInput.addEventListener('input', filterMods);
  if (versionSelect) versionSelect.addEventListener('change', filterMods);
  if (typeSelect) typeSelect.addEventListener('change', filterMods);
}

function filterMods() {
  const searchTerm = document.getElementById('q')?.value.toLowerCase() || '';
  const versionFilter = document.getElementById('vSel')?.value || '';
  const typeFilter = document.getElementById('tSel')?.value || '';

  const filteredMods = allMods.filter(mod => {
    const matchesSearch = mod.name?.toLowerCase().includes(searchTerm) || 
                         mod.desc?.toLowerCase().includes(searchTerm);
    const matchesVersion = !versionFilter || mod.version === versionFilter;
    const matchesType = !typeFilter || mod.type === typeFilter;
    
    return matchesSearch && matchesVersion && matchesType;
  });

  renderMods(filteredMods);
}

function updateUI() {
  const avatar = document.getElementById('avatar');
  const username = document.getElementById('uname');
  const adminBtn = document.getElementById('adminBtn');

  if (currentUser) {
    if (avatar) {
      avatar.style.display = 'block';
      avatar.src = users[currentUser]?.image || 'https://placehold.co/80x80?text=User';
      avatar.onerror = () => { avatar.src = 'https://placehold.co/80x80?text=Error'; };
    }
    if (username) username.textContent = currentUser;
    if (adminBtn && currentUser === 'Minelux') adminBtn.style.display = 'block';
  }
}

function toLogin() {
  if (currentUser) {
    logout();
    location.reload();
  } else {
    location.href = 'login.html';
  }
}

window.toLogin = toLogin;
document.addEventListener('DOMContentLoaded', init);