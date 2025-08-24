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
    mods = await fetchJSON(`https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}/${GITHUB.branch}/${GITHUB.modsPath}`);
    users = getUsers();
    renderMods();
    renderUsers();
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
    mods = [];
    users = {};
  }
}

function renderMods() {
  const container = document.getElementById('modsList');
  if (!container) return;

  container.innerHTML = mods.map((mod, index) => `
    <div class="panel" style="padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${mod.name}</strong>
          <div style="font-size: 10px; color: #888;">
            ${mod.version} • ${mod.type}
          </div>
        </div>
        <button class="btn danger" style="padding: 6px 10px; font-size: 10px;" onclick="deleteMod(${index})">
          حذف
        </button>
      </div>
    </div>
  `).join('');
}

function renderUsers() {
  const container = document.getElementById('usersList');
  if (!container) return;

  container.innerHTML = Object.entries(users).map(([username, user]) => `
    <div class="panel" style="padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${username}</strong>
          <div style="font-size: 10px; color: #888;">
            ${user.image ? 'صورة: ✓' : 'لا توجد صورة'}
          </div>
        </div>
        <button class="btn danger" style="padding: 6px 10px; font-size: 10px;" onclick="deleteUser('${username}')">
          حذف
        </button>
      </div>
    </div>
  `).join('');
}

async function addMod() {
  const name = document.getElementById('m_name')?.value;
  const version = document.getElementById('m_ver')?.value;
  const type = document.getElementById('m_type')?.value;
  const link = document.getElementById('m_link')?.value;
  const desc = document.getElementById('m_desc')?.value;

  if (!name || !version || !type || !link) {
    toast('املأ جميع الحقول المطلوبة', 'error');
    return;
  }

  try {
    const newMod = { name, version, type, link, desc, image: '' };
    mods.push(newMod);
    await commitJSON(GITHUB.modsPath, mods, `Added mod: ${name}`);
    
    renderMods();
    clearModForm();
    toast('تم إضافة المود بنجاح ✓');
  } catch (error) {
    console.error('Add mod error:', error);
    toast('فشل إضافة المود', 'error');
  }
}

async function addUser() {
  const username = document.getElementById('u_name')?.value;
  const password = document.getElementById('u_pass')?.value;

  if (!username || !password) {
    toast('املأ جميع الحقول المطلوبة', 'error');
    return;
  }

  try {
    users[username] = { password, image: '' };
    await commitJSON(GITHUB.usersPath, users, `Added user: ${username}`);
    
    renderUsers();
    clearUserForm();
    toast('تم إضافة المستخدم بنجاح ✓');
  } catch (error) {
    console.error('Add user error:', error);
    toast('فشل إضافة المستخدم', 'error');
  }
}

async function deleteMod(index) {
  if (!confirm('هل أنت متأكد من حذف هذا المود؟')) return;

  try {
    mods.splice(index, 1);
    await commitJSON(GITHUB.modsPath, mods, 'Deleted mod');
    renderMods();
    toast('تم حذف المود بنجاح ✓');
  } catch (error) {
    console.error('Delete mod error:', error);
    toast('فشل حذف المود', 'error');
  }
}

async function deleteUser(username) {
  if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;

  try {
    await deleteUser(username);
    users = getUsers();
    renderUsers();
    toast('تم حذف المستخدم بنجاح ✓');
  } catch (error) {
    console.error('Delete user error:', error);
    toast(error.message || 'فشل حذف المستخدم', 'error');
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

function setupEventListeners() {}

window.addMod = addMod;
window.addUser = addUser;
window.deleteMod = deleteMod;
window.deleteUser = deleteUser;

document.addEventListener('DOMContentLoaded', init);