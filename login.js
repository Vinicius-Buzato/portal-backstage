document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = document.getElementById('login-btn');
  const errorMsg = document.getElementById('error-msg');

  btn.disabled = true;
  btn.innerText = 'Entrando...';
  errorMsg.innerText = '';

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    errorMsg.innerText = 'E-mail ou senha incorretos.';
    btn.disabled = false;
    btn.innerText = 'Entrar';
  } else {
    window.location.href = 'publicar.html';
  }
});