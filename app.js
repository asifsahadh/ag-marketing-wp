// Autograder — Login/Register Authentication
// Handles real API calls to Flask backend for user authentication
console.log("Autograder auth script loaded.");

let currentMode = 'login';

// Switch auth form mode (login vs register)
function setFormMode(mode) {
    currentMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const fieldName = document.getElementById('field-name');
    const nameInput = document.getElementById('name-input');
    const submitBtn = document.getElementById('submit-btn');
    const forgotPassword = document.getElementById('forgot-password');

    if (!tabLogin || !tabRegister) return;

    // Clear any previous messages
    hideMessages();

    if (mode === 'register') {
        // Active Register tab
        tabRegister.classList.add('bg-white', 'font-extrabold', 'text-blue-600');
        tabRegister.classList.remove('text-gray-500');
        tabLogin.classList.remove('bg-white', 'font-extrabold', 'text-blue-600');
        tabLogin.classList.add('text-gray-500');

        // Show name field
        fieldName.classList.remove('hidden');
        nameInput.setAttribute('required', 'true');
        submitBtn.innerText = "Register Account";
        if (forgotPassword) forgotPassword.classList.add('hidden');
    } else {
        // Active Login tab
        tabLogin.classList.add('bg-white', 'font-extrabold', 'text-blue-600');
        tabLogin.classList.remove('text-gray-500');
        tabRegister.classList.remove('bg-white', 'font-extrabold', 'text-blue-600');
        tabRegister.classList.add('text-gray-500');

        // Hide name field
        fieldName.classList.add('hidden');
        nameInput.removeAttribute('required');
        submitBtn.innerText = "Sign In";
        if (forgotPassword) forgotPassword.classList.remove('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    if (successDiv) successDiv.classList.add('hidden');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function showSuccess(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) successDiv.classList.add('hidden');
}

// Real authentication submission
async function handleAuthSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    if (!submitBtn) return;

    hideMessages();

    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    const name = document.getElementById('name-input')?.value.trim() || '';

    // Client-side validation
    if (currentMode === 'register' && !name) {
        showError('Please enter your full name');
        return;
    }
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    if (!password) {
        showError('Please enter your password');
        return;
    }
    if (currentMode === 'register' && password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    // Disable button and show loading state
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = currentMode === 'login' ? "Signing in..." : "Creating account...";
    submitBtn.classList.add('opacity-75');

    try {
        const endpoint = currentMode === 'login' ? '/api/login' : '/api/register';
        const body = currentMode === 'login'
            ? { email, password }
            : { name, email, password };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Authentication failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
            submitBtn.classList.remove('opacity-75');
            return;
        }

        // Success
        showSuccess(currentMode === 'login' ? 'Login successful! Redirecting...' : 'Account created! Redirecting...');
        submitBtn.innerText = "Redirecting...";

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/app/index.html';
        }, 800);

    } catch (err) {
        console.error('Auth error:', err);
        showError('Network error. Please check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        submitBtn.classList.remove('opacity-75');
    }
}

// Check if already authenticated on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/me', { credentials: 'include' });
        if (response.ok) {
            // Already logged in — redirect to dashboard
            window.location.href = '/app/index.html';
        }
    } catch (err) {
        // Not authenticated, stay on login page
    }
});