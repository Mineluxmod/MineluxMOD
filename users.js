import { GITHUB, fetchJSON, commitJSON, toast } from './utils.js';

let users = {};

export async function loadUsers() {
  try {
    console.log('جاري تحميل المستخدمين من GitHub...');
    const usersData = await fetchJSON(GITHUB.usersPath);
    users = usersData;
    console.log('تم تحميل المستخدمين بنجاح:', Object.keys(users).length);
    return users;
  } catch (err) {
    console.error('فشل تحميل المستخدمين من GitHub:', err);
    toast('فشل تحميل قائمة المستخدمين', 'error');
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
  if (!username || !password) throw new Error('اكمل جميع الحقول');
  if (users[username]) throw new Error('المستخدم موجود مسبقًا');
  
  // إضافة المستخدم الجديد
  users[username] = { password, image };
  
  try {
    // الحفظ على GitHub
    await commitJSON(GITHUB.usersPath, users, `إضافة مستخدم جديد: ${username}`);
    toast('تم إنشاء الحساب بنجاح ✓', 'success');
  } catch (err) {
    console.error('فشل حفظ المستخدم على GitHub:', err);
    throw new Error('فشل إنشاء الحساب: تحقق من الاتصال بالإنترنت');
  }
  
  localStorage.setItem('currentUser', username);
}

export async function deleteUser(username) {
  if (!users[username]) throw new Error('المستخدم غير موجود');
  if (username === 'Minelux') throw new Error('لا يمكن حذف الأدمن الرئيسي');
  
  // حذف المستخدم
  delete users[username];
  
  try {
    // الحفظ على GitHub
    await commitJSON(GITHUB.usersPath, users, `حذف المستخدم: ${username}`);
    toast('تم حذف المستخدم بنجاح ✓', 'success');
  } catch (err) {
    console.error('فشل حذف المستخدم من GitHub:', err);
    throw new Error('فشل حذف المستخدم');
  }
}

export async function updateUserImage(username, imageUrl) {
  if (!users[username]) throw new Error('المستخدم غير موجود');
  
  // تحديث الصورة
  users[username].image = imageUrl;
  
  try {
    // الحفظ على GitHub
    await commitJSON(GITHUB.usersPath, users, `تحديث صورة المستخدم: ${username}`);
    toast('تم تحديث الصورة بنجاح ✓', 'success');
    return true;
  } catch (err) {
    console.error('فشل تحديث الصورة على GitHub:', err);
    toast('فشل حفظ الصورة على السيرفر', 'error');
    return false;
  }
}

export function getCurrentUser() {
  return localStorage.getItem('currentUser') || null;
}

export function getUsers() {
  return users;
}

// تهيئة المستخدمين عند التحميل
export async function initializeUsers() {
  try {
    await loadUsers();
    return users;
  } catch (error) {
    console.error('فشل تهيئة المستخدمين:', error);
    return {};
  }
}
