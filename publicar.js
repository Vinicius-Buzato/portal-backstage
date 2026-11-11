// Verifica se o administrador está autenticado antes de permitir uso da tela
async function checkUser() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
}
checkUser();

document.getElementById('news-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('status-message');
  
  btn.disabled = true;
  btn.innerText = 'Publicando...';
  status.style.color = '#252525';
  status.innerText = 'Enviando matéria para o portal...';

  const newArticle = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    size: document.getElementById('size').value,
    lead: document.getElementById('lead').value,
    image_url: document.getElementById('image_url').value,
    image_caption: document.getElementById('image_caption').value,
    content: document.getElementById('content').value
  };

  const { data, error } = await supabaseClient
    .from('articles')
    .insert([newArticle]);

  if (error) {
    console.error(error);
    status.style.color = 'red';
    status.innerText = 'Erro ao publicar. Verifique os dados.';
    btn.disabled = false;
    btn.innerText = 'Publicar Matéria no Ar';
  } else {
    status.style.color = '#5B2A86';
    status.innerText = 'Matéria publicada com sucesso! Redirecionando...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
});