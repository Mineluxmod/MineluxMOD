import { GITHUB, fetchJSON, toast } from './utils.js';
import { getCurrentUser, loadUsers, logout, updateUserImage } from './users.js';

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
    allMods = await fetchJSON(GITHUB.modsPath);
    renderMods(allMods);
    populateFilters();
  } catch (err) {
    console.error('Failed to load mods:', err);
    toast('فشل تحميل المودات', 'error');
    allMods = [];
    renderMods(allMods);
  }
}

function renderMods(mods) {
  const container = document.getElementById('mods');
  if (!container) return;

  if (!mods || mods.length === 0) {
    container.innerHTML = `
      <div class="panel center" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
        <h3>لا توجد مودات متاحة بعد</h3>
        <p style="color: #888; margin-top: 10px;">يمكنك إضافة مودات من صفحة الأدمن</p>
        ${currentUser === 'Minelux' ? 
          '<button class="btn" onclick="location.href=\'admin.html\'">إضافة مودات</button>' : 
          ''}
      </div>
    `;
    return;
  }

  container.innerHTML = mods.map(mod => `
    <div class="card">
      <img class="thumb" src="${mod.image || 'https://placehold.co/400x225/2c2c2c/ffffff?text=No+Image'}" 
           alt="${mod.name}" 
           onerror="this.src='https://placehold.co/400x225/ff4444/ffffff?text=Error+Loading'"/>
      <div class="content">
        <h3>${mod.name}</h3>
        <p>${mod.desc || 'لا يوجد وصف'}</p>
        <div class="grid" style="grid-template-columns:1fr 1fr; margin-top:12px; gap: 8px;">
          <span class="mod-tag">${mod.version || 'N/A'}</span>
          <span class="mod-tag">${mod.type || 'N/A'}</span>
        </div>
        <a href="${mod.link || '#'}" class="btn" style="margin-top:12px; width: 100%; text-align: center; text-decoration: none;" 
           target="_blank" onclick="event.stopPropagation()">
          تحميل
        </a>
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
  
  // استمع لتغيير الصورة
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', handleAvatarUpload);
  }
}

function filterMods() {
  const searchTerm = document.getElementById('q')?.value.toLowerCase() || '';
  const versionFilter = document.getElementById('vSel')?.value || '';
  const typeFilter = document.getElementById('tSel')?.value || '';

  const filteredMods = allMods.filter(mod => {
    const matchesSearch = (mod.name?.toLowerCase().includes(searchTerm) || 
                         mod.desc?.toLowerCase().includes(searchTerm)) ||
                         searchTerm === '';
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
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');

  if (currentUser) {
    if (avatar) {
      avatar.style.display = 'block';
      const userImage = users[currentUser]?.image;
      avatar.src = userImage || 'https://placehold.co/80x80/2c2c2c/ffffff?text=User';
      avatar.onerror = () => { 
        avatar.src = 'https://placehold.co/80x80/ff4444/ffffff?text=Error';
      };
    }
    if (username) {
      username.textContent = currentUser;
      username.style.display = 'block';
    }
    if (adminBtn && currentUser === 'Minelux') {
      adminBtn.style.display = 'block';
    }
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (changeAvatarBtn) changeAvatarBtn.style.display = 'block';
  } else {
    if (avatar) avatar.style.display = 'none';
    if (username) username.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (changeAvatarBtn) changeAvatarBtn.style.display = 'none';
  }
}

function toLogin() {
  if (currentUser) {
    logout();
  } else {
    location.href = 'login.html';
  }
}

function changeAvatar() {
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.click();
  }
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast('الملف يجب أن يكون صورة', 'error');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast('حجم الصورة يجب أن يكون أقل من 2MB', 'error');
    return;
  }

  try {
    // تحويل الصورة إلى base64
    const reader = new FileReader();
    reader.onload = async function(e) {
      const imageDataUrl = e.target.result;
      const success = await updateUserImage(currentUser, imageDataUrl);
      if (success) {
        // تحديث الصورة فوراً
        const avatar = document.getElementById('avatar');
        if (avatar) {
          avatar.src = imageDataUrl;
        }
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Avatar upload error:', error);
    toast('فشل تحميل الصورة', 'error');
  }
  
  // مسح قيمة input للسماح باختيار نفس الملف مرة أخرى
  event.target.value = '';
}

// جعل الدوال متاحة globally
window.toLogin = toLogin;
window.logout = logout;
window.changeAvatar = changeAvatar;

// التهيئة
document.addEventListener('DOMContentLoaded', init);
