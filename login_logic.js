import { register, login, getCurrentUser, loadUsers } from './users.js';
import { toast } from './utils.js';

let currentForm = 'login';

async function init() {
  try {
    await loadUsers();
    
    if (getCurrentUser()) {
      window.location.href = 'index.html';
      return;
    }
    
    setupEventListeners();
  } catch (error) {
    console.error('Login init error:', error);
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
  const username = document.getElementById('loginUser')?.value;
  const password = document.getElementById('loginPass')?.value;
  
  if (!username || !password) {
    toast('املأ جميع الحقول', 'error');
    return;
  }
  
  try {
    if (login(username, password)) {
      toast('تم تسجيل الدخول بنجاح ✓');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      toast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    toast('فشل تسجيل الدخول', 'error');
  }
}

async function handleRegister() {
  const username = document.getElementById('regUser')?.value;
  const password = document.getElementById('regPass')?.value;
  
  if (!username || !password) {
    toast('املأ جميع الحقول المطلوبة', 'error');
    return;
  }
  
  try {
    await register(username, password, '');
    toast('تم إنشاء الحساب بنجاح ✓');
    setTimeout(() => window.location.href = 'index.html', 1000);
  } catch (error) {
    console.error('Register error:', error);
    toast(error.message || 'فشل إنشاء الحساب', 'error');
  }
}

function setupEventListeners() {}

window.toggleForms = toggleForms;
window.login = handleLogin;
window.register = handleRegister;

document.addEventListener('DOMContentLoaded', init);