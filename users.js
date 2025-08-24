import { GITHUB, fetchJSON, commitJSON, toast } from './utils.js';

let users = {};

export async function loadUsers() {
  try {
    users = await fetchJSON(GITHUB.usersPath);
    return users;
  } catch (err) {
    console.warn('فشل تحميل المستخدمين، استخدام البيانات المحلية');
    try {
      const localUsers = localStorage.getItem('local_users');
      if (localUsers) {
        users = JSON.parse(localUsers);
        return users;
      }
    } catch (e) {
      console.error('Error parsing local users:', e);
    }
    users = {};
    return users;
  }
}

export function login(username, password) {
  if (users[username] && users[username].password === password) {
    localStorage.setItem('currentUser', username);
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

export async function register(username, password, image = '') {
  if (!username || !password) throw new Error('اكمل البيانات');
  if (users[username]) throw new Error('المستخدم موجود مسبقًا');
  
  users[username] = { password, image };
  
  try {
    await commitJSON(GITHUB.usersPath, users, `Add user ${username}`);
    toast('تم إنشاء الحساب بنجاح ✓', 'success');
  } catch (err) {
    localStorage.setItem('local_users', JSON.stringify(users));
    toast('تم حفظ المستخدم محلياً ✓', 'warning');
  }
  
  localStorage.setItem('currentUser', username);
}

export async function deleteUser(username) {
  if (!users[username]) throw new Error('المستخدم غير موجود');
  
  delete users[username];
  
  try {
    await commitJSON(GITHUB.usersPath, users, `Delete user ${username}`);
    toast('تم حذف المستخدم بنجاح ✓', 'success');
  } catch (err) {
    localStorage.setItem('local_users', JSON.stringify(users));
    throw new Error('تم الحذف محلياً فقط');
  }
}

export function getCurrentUser() {
  return localStorage.getItem('currentUser') || null;
}

export function getUsers() {
  return users;
}

export async function updateUserImage(username, imageUrl) {
  if (!users[username]) throw new Error('المستخدم غير موجود');
  
  users[username].image = imageUrl;
  
  try {
    await commitJSON(GITHUB.usersPath, users, `Update user image: ${username}`);
    toast('تم تحديث الصورة بنجاح ✓', 'success');
    return true;
  } catch (err) {
    localStorage.setItem('local_users', JSON.stringify(users));
    toast('تم حفظ الصورة محلياً ✓', 'warning');
    return false;
  }
}
