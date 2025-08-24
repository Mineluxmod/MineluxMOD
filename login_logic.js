import { register, login, getCurrentUser, initializeUsers } from './users.js';
import { toast } from './utils.js';

let currentForm = 'login';

async function init() {
  try {
    // تحميل المستخدمين من GitHub أولاً
    await initializeUsers();
    
    if (getCurrentUser()) {
      window.location.href = 'index.html';
      return;
    }
    
    setupEventListeners();
  } catch (error) {
    console.error('خطأ في تحميل صفحة التسجيل:', error);
    toast('فشل تحميل بيانات المستخدمين', 'error');
  }
}

function toggleForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (currentForm === 'login') {
    currentForm = 'register';
    loginForm.style.display = 'none';
    registerForm.style.display = 'grid';
  } else {
    currentForm = 'login';
    registerForm.style.display = 'none';
    loginForm.style.display = 'grid';
  }
}

async function handleLogin() {
  const username = document.getElementById('loginUser')?.value.trim();
  const password = document.getElementById('loginPass')?.value.trim();
  
  if (!username || !password) {
    toast('املأ جميع الحقول', 'error');
    return;
  }
  
  try {
    if (login(username, password)) {
      toast('تم تسجيل الدخول بنجاح ✓', 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      toast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    toast('فشل تسجيل الدخول', 'error');
  }
}

async function handleRegister() {
  const username = document.getElementById('regUser')?.value.trim();
  const password = document.getElementById('regPass')?.value.trim();
  
  if (!username || !password) {
    toast('املأ جميع الحقول المطلوبة', 'error');
    return;
  }
  
  try {
    await register(username, password, '');
    toast('تم إنشاء الحساب بنجاح ✓', 'success');
    setTimeout(() => window.location.href = 'index.html', 1000);
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    toast(error.message || 'فشل إنشاء الحساب', 'error');
  }
}

function setupEventListeners() {
  const avatarZone = document.getElementById('avatarZone');
  const regImg = document.getElementById('regImg');
  
  if (avatarZone && regImg) {
    avatarZone.addEventListener('click', () => regImg.click());
  }
}

// الدوال العامة
window.toggleForms = toggleForms;
window.login = handleLogin;
window.register = handleRegister;

// التهيئة
document.addEventListener('DOMContentLoaded', init);
