export const GITHUB = {
  owner: 'minelux',
  repo: 'MineluxMOD',
  branch: 'main',
  usersPath: 'users.json',
  modsPath: 'mods.json'
};

const apiBase = 'https://api.github.com';

// التوكن الدائم الثابت
const PERMANENT_TOKEN = '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';

export function getToken() {
  return PERMANENT_TOKEN;
}

export function setToken(t) {
  console.log('التوكن ثابت ولا يمكن تغييره');
}

export function clearToken() {
  console.log('التوكن ثابت ولا يمكن مسحه');
}

export function getTokenStatus() {
  return { 
    isValid: true, 
    message: 'التوكن دائم ✓',
    isPermanent: true 
  };
}

export async function fetchJSON(path) {
  try {
    // استخدام raw.githubusercontent.com للقراءة
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB.owner}/${GITHUB.repo}/${GITHUB.branch}/${path}`;
    const res = await fetch(rawUrl + '?_=' + Date.now());
    if (!res.ok) throw new Error('فشل تحميل ' + path);
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

async function getFileSHA(path) {
  try {
    const url = `${apiBase}/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${path}?ref=${GITHUB.branch}`;
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${PERMANENT_TOKEN}`
      }
    });
    
    if (res.status === 404) return null;
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'فشل الحصول على SHA للملف');
    }
    
    const data = await res.json();
    return data.sha;
  } catch (error) {
    console.error('SHA error:', error);
    throw error;
  }
}

export async function commitJSON(path, obj, message) {
  try {
    const url = `${apiBase}/repos/${GITHUB.owner}/${GITHUB.repo}/contents/${path}`;
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2))));
    const sha = await getFileSHA(path);
    
    const body = {
      message: message || `Update ${path}`,
      content,
      branch: GITHUB.branch
    };
    
    if (sha) body.sha = sha;
    
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${PERMANENT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('GitHub API Error:', errorData);
      throw new Error(errorData.message || `فشل الحفظ: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Commit error:', error);
    throw error;
  }
}

export function toast(msg, type = 'info') {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  
  t.textContent = msg;
  t.className = `toast show ${type}`;
  
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.className = 'toast', 300);
  }, 3000);
}
