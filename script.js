// ===== FUNÇÕES FOCADAS =====

// 1. Obter ano atual
function getCurrentYear() {
    return new Date().getFullYear();
}

// 2. Atualizar elemento do DOM
function updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = content;
    }
}

// 3. Atualizar ano no footer
function updateFooterYear() {
    const year = getCurrentYear();
    updateElement('#year', year);
}

// 4. Toggle de tema
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 5. Carregar tema salvo
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    updateFooterYear();
    loadSavedTheme();
    console.log('✅ Portfolio inicializado!');
});