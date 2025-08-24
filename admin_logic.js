import { GITHUB, fetchJSON, commitJSON, toast } from './utils.js';
import { loadUsers, deleteUser, getUsers } from './users.js';

let mods = [];
let users = {};

async function init() {
  try {
    await loadData();
    setupEventListeners();
  } catch (error) {
    console.error('Admin init error:', error);
    toast('فشل تحميل لوحة التحكم', 'error');
  }
}

async function loadData() {
  try {
    // تحميل المودات
    const modsData = await fetchJSON(GITHUB.modsPath);
    mods = Array.isArray(modsData) ? modsData : [];
    
    // تحميل المستخدمين
    await loadUsers();
    users = getUsers();
    
    renderMods();
    renderUsers();
  } catch (err) {
    console.error('Load data error:', err);
    toast('فشل تحميل البيانات', 'error');
    mods = [];
    users = {};
  }
}

function renderMods() {
  const container = document.getElementById('modsList');
  if (!container) return;

  if (mods.length === 0) {
    container.innerHTML = '<div class="panel center">لا توجد مودات</div>';
    return;
  }

  container.innerHTML = mods.map((mod, index) => `
    <div class="panel" style="padding: 12px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px;">
        <div style="flex: 1;">
          <strong style="display: block; margin-bottom: 5px;">${mod.name || 'بدون اسم'}</strong>
          <div style="font-size: 10px; color: #888;">
            <div>الإصدار: ${mod.version || 'N/A'}</div>
            <div>النوع: ${mod.type || 'N/A'}</div>
            <div>الرابط: ${mod.link ? '✓' : '✗'}</div>
          </div>
        </div>
        <button class="btn danger" style="padding: 6px 12px; font-size: 10px; white-space: nowrap;" 
                onclick="deleteMod(${index})" title="حذف المود">
          حذف
        </button>
      </div>
    </div>
  `).join('');
}

function renderUsers() {
  const container = document.getElementById('usersList');
  if (!container) return;

  const usersArray = Object.entries(users);
  if (usersArray.length === 0) {
    container.innerHTML = '<div class="panel center">لا يوجد مستخدمين</div>';
    return;
  }

  container.innerHTML = usersArray.map(([username, user]) => `
    <div class="panel" style="padding: 12px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${username}</strong>
          <div style="font-size: 10px; color: #888;">
            ${user.image ? 'صورة: ✓' : 'لا توجد صورة'}
          </div>
        </div>
        ${username !== 'Minelux' ? `
        <button class="btn danger" style="padding: 6px 12px; font-size: 10px;" 
                onclick="deleteUser('${username}')" title="حذف المستخدم">
          حذف
        </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function addMod() {
  const name = document.getElementById('m_name')?.value.trim();
  const version = document.getElementById('m_ver')?.value.trim();
  const type = document.getElementById('m_type')?.value.trim();
  const link = document.getElementById('m_link')?.value.trim();
  const desc = document.getElementById('m_desc')?.value.trim();

  if (!name || !version || !type || !link) {
    toast('املأ جميع الحقول المطلوبة', 'error');
    return;
  }

  // التحقق من صحة الرابط
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    toast('الرابط يجب أن يبدأ بـ http:// أو https://', 'error');
    return;
  }

  try {
    const newMod = { 
      name, 
      version, 
      type, 
      link, 
      desc: desc || '',
      image: '' // يمكن إضافة رفع الصور لاحقاً
    };

    // إضافة المود جديد إلى المصفوفة
    const updatedMods = [...mods, newMod];
    
    // حفظ على GitHub
    await commitJSON(GITHUB.modsPath, updatedMods, `تم إضافة مود: ${name}`);
    
    // تحديث البيانات المحلية
    mods = updatedMods;
    renderMods();
    clearModForm();
    toast('تم إضافة المود بنجاح ✓', 'success');
  } catch (error) {
    console.error('Add mod error:', error);
    toast('فشل إضافة المود: ' + error.message, 'error');
  }
}

async function addUser() {
  const username = document.getElementById('u_name')?.value.trim();
  const password = document.getElementById('u_pass')?.value.trim();

  if (!username || !password) {
    toast('املأ جميع الحقول المطلوبة', 'error');
    return;
  }

  if (users[username]) {
    toast('المستخدم موجود مسبقاً', 'error');
    return;
  }

  try {
    users[username] = { password, image: '' };
    await commitJSON(GITHUB.usersPath, users, `تم إضافة مستخدم: ${username}`);
    
    renderUsers();
    clearUserForm();
    toast('تم إضافة المستخدم بنجاح ✓', 'success');
  } catch (error) {
    console.error('Add user error:', error);
    toast('فشل إضافة المستخدم: ' + error.message, 'error');
  }
}

async function deleteMod(index) {
  if (!confirm('هل أنت متأكد من حذف هذا المود؟')) return;

  try {
    const modName = mods[index]?.name || 'مود';
    const updatedMods = mods.filter((_, i) => i !== index);
    
    await commitJSON(GITHUB.modsPath, updatedMods, `تم حذف مود: ${modName}`);
    
    mods = updatedMods;
    renderMods();
    toast('تم حذف المود بنجاح ✓', 'success');
  } catch (error) {
    console.error('Delete mod error:', error);
    toast('فشل حذف المود: ' + error.message, 'error');
  }
}

async function deleteUser(username) {
  if (username === 'Minelux') {
    toast('لا يمكن حذف الأدمن الرئيسي', 'error');
    return;
  }

  if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;

  try {
    delete users[username];
    await commitJSON(GITHUB.usersPath, users, `تم حذف مستخدم: ${username}`);
    
    renderUsers();
    toast('تم حذف المستخدم بنجاح ✓', 'success');
  } catch (error) {
    console.error('Delete user error:', error);
    toast('فشل حذف المستخدم: ' + error.message, 'error');
  }
}

function clearModForm() {
  document.getElementById('m_name').value = '';
  document.getElementById('m_ver').value = '';
  document.getElementById('m_type').value = '';
  document.getElementById('m_link').value = '';
  document.getElementById('m_desc').value = '';
}

function clearUserForm() {
  document.getElementById('u_name').value = '';
  document.getElementById('u_pass').value = '';
}

function setupEventListeners() {
  // إضافة event listeners للحقول
  const inputs = document.querySelectorAll('.input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (input.closest('#modsForm')) addMod();
        if (input.closest('#usersForm')) addUser();
      }
    });
  });
}

// جعل الدوال متاحة globally
window.addMod = addMod;
window.addUser = addUser;
window.deleteMod = deleteMod;
window.deleteUser = deleteUser;

// التهيئة
document.addEventListener('DOMContentLoaded', init);
