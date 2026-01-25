const SUPABASE_URL = 'https://chhkghparlgsikxzxasw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_z0Fv9IFDXOCCdCCUqF6j0w_J0bWFIET';
const ADMIN_EMAIL = 'vsimafrontdesk@gmail.com';
let supabase;

async function initSupabase() {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    await checkAuth();
}

async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.email !== ADMIN_EMAIL) {
            window.location.href = '/admin/index.html';
            return false;
        }
        return true;
    } catch (error) {
        window.location.href = '/admin/index.html';
        return false;
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        window.location.href = '/admin/index.html';
    } catch (error) {
        showToast('Error logging out', 'error');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeIcon();
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isLight = document.body.classList.contains('light-mode');
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.innerHTML = isLight ? 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' :
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
}

function checkAdminName() {
    const adminName = localStorage.getItem('adminName');
    if (!adminName) {
        showNameModal();
    } else {
        updateGreeting(adminName);
    }
}

function showNameModal() {
    const modal = document.getElementById('nameModal');
    if (modal) modal.classList.add('active');
}

function saveAdminName() {
    const nameInput = document.getElementById('adminNameInput');
    if (nameInput && nameInput.value.trim()) {
        localStorage.setItem('adminName', nameInput.value.trim());
        updateGreeting(nameInput.value.trim());
        document.getElementById('nameModal').classList.remove('active');
    }
}

function updateGreeting(name) {
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        greetingEl.innerHTML = `Welcome, <strong>${name}</strong>`;
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
}

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
        </svg>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

async function fetchData(table, options = {}) {
    try {
        let query = supabase.from(table).select(options.select || '*');
        if (options.order) query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
        if (options.limit) query = query.limit(options.limit);
        if (options.filter) query = query.eq(options.filter.column, options.filter.value);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error(`Error fetching ${table}:`, error);
        return [];
    }
}

async function insertData(table, data) {
    try {
        const { data: result, error } = await supabase.from(table).insert(data).select();
        if (error) throw error;
        showToast('Created successfully!');
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        return null;
    }
}

async function updateData(table, id, data) {
    try {
        const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
        if (error) throw error;
        showToast('Updated successfully!');
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        return null;
    }
}

async function deleteData(table, id) {
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        showToast('Deleted successfully!');
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

async function uploadFile(bucket, file, path) {
    try {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    } catch (error) {
        showToast(error.message, 'error');
        return null;
    }
}

async function getStats() {
    const [students, parents, announcements, events, messages] = await Promise.all([
        fetchData('students'),
        fetchData('parents'),
        fetchData('announcements'),
        fetchData('events'),
        fetchData('contact_messages')
    ]);
    return {
        students: students.length,
        parents: parents.length,
        announcements: announcements.length,
        events: events.length,
        messages: messages.length
    };
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const classLevels = [
    'Nursery 1', 'Nursery 2', 'Nursery 3',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3'
];

function generateClassOptions(selected = '') {
    return classLevels.map(level => 
        `<option value="${level}" ${selected === level ? 'selected' : ''}>${level}</option>`
    ).join('');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showLoading(container) {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

function showEmpty(container, message = 'No data found') {
    container.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
            </svg>
            <h4>${message}</h4>
            <p>Add new items using the button above</p>
        </div>
    `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
    }
    return data;
}

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await initSupabase();
    checkAdminName();
    
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (mobileToggle) mobileToggle.addEventListener('click', toggleSidebar);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    const saveNameBtn = document.getElementById('saveNameBtn');
    if (saveNameBtn) saveNameBtn.addEventListener('click', saveAdminName);
    
    if (typeof initPage === 'function') {
        initPage();
    }
});
