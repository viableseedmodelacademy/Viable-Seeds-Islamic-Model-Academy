const _supabase = supabase.createClient(
    'https://chhkghparlgsikxzxasw.supabase.co',
    'sb_publishable_z0Fv9IFDXOCCdCCUqF6j0w_J0bWFIET'
);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorMsg) errorMsg.classList.add('hidden');

            const { data, error } = await _supabase.auth.signInWithPassword({
                email: emailInput.value,
                password: passwordInput.value,
            });

            if (error) {
                if (errorMsg) {
                    errorMsg.classList.remove('hidden');
                    errorMsg.innerText = error.message;
                }
            } else {
                window.location.href = 'Dashboard.html';
            }
        });
    }

    if (window.location.pathname.includes('Dashboard.html')) {
        protectPage();
    }
});

async function protectPage() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
        window.location.replace('index.html');
    }
}
