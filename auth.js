
import { supabase } from './supabase.js';

// Endereço oficial do IYFY CLUB
const SITE_URL = 'https://iyfyrunning.com.br';

// Elementos da tela
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const authMessage = document.getElementById('authMessage');

// Alternar entre login e cadastro
document.getElementById('showSignup').addEventListener('click', () => {
  loginSection.classList.add('hidden');
  signupSection.classList.remove('hidden');
  authMessage.textContent = '';
});

document.getElementById('showLogin').addEventListener('click', () => {
  signupSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  authMessage.textContent = '';
});

// Exibir mensagens
function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? '#ff7777' : '#ffffff';
}

// Verificar se já existe uma sessão
async function checkSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    showMessage('Não foi possível verificar sua sessão.', true);
    return;
  }

  if (data.session) {
    window.location.replace('iyfyclub.html');
  }
}

checkSession();

// CADASTRO
document.getElementById('signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (!name) {
    showMessage('Digite seu nome completo.', true);
    return;
  }

  if (password.length < 6) {
    showMessage('A senha precisa ter pelo menos 6 caracteres.', true);
    return;
  }

  if (password !== confirmPassword) {
    showMessage('As senhas não são iguais.', true);
    return;
  }

  const button = document.querySelector('#signupForm button[type="submit"]');
  button.disabled = true;
  button.textContent = 'CRIANDO CONTA...';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/login.html`,
      data: {
        full_name: name
      }
    }
  });

  button.disabled = false;
  button.textContent = 'CRIAR MINHA CONTA';

  if (error) {
    showMessage(error.message, true);
    return;
  }

  if (data.session) {
    showMessage('Conta criada! Entrando no clube...');
    window.location.replace('iyfyclub.html');
  } else {
    showMessage('Cadastro realizado! Confira seu e-mail para confirmar sua conta.');
  }
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const button = document.querySelector('#loginForm button[type="submit"]');
  button.disabled = true;
  button.textContent = 'ENTRANDO...';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  button.disabled = false;
  button.textContent = 'ENTRAR NA PLATAFORMA';

  if (error) {
    showMessage('E-mail ou senha incorretos. Confira seus dados.', true);
    return;
  }

  if (data.session) {
    showMessage('Login realizado! Bem-vindo ao IYFY CLUB.');
    window.location.replace('iyfyclub.html');
  }
});

// RECUPERAÇÃO DE SENHA
document.getElementById('forgotPassword').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();

  if (!email) {
    showMessage('Digite seu e-mail no campo acima para recuperar sua senha.', true);
    document.getElementById('loginEmail').focus();
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/login.html`
  });

  if (error) {
    showMessage('Não foi possível enviar o e-mail. Tente novamente.', true);
    return;
  }

  showMessage('Se esse e-mail estiver cadastrado, você receberá as instruções de recuperação.');
});
