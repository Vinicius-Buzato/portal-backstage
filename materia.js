document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById('single-article-content');
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    container.innerHTML = '<p style="text-align: center; color: red;">Matéria não encontrada.</p>';
    return;
  }

  const { data: article, error } = await supabaseClient
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) {
    console.error("Erro ao carregar matéria:", error);
    container.innerHTML = '<p style="text-align: center; color: red;">Erro ao carregar o conteúdo da matéria.</p>';
    return;
  }

  document.title = `${article.title} - Portal Backstage`;

  // Formatação da data no padrão brasileiro solicitado (ex: 11.11.2026 às 11:45)
  const dateObj = new Date(article.created_at || Date.now());
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const formattedDate = `${day}.${month}.${year} às ${hours}:${minutes}`;

  const authorName = article.author_name || 'Redação Backstage';
  const authorAvatar = article.author_avatar || 'https://www.gravatar.com/avatar/?d=mp';

  // Verifica se o usuário atual é um editor logado para mostrar botões de Editar/Excluir
  const { data: { session } } = await supabaseClient.auth.getSession();
  let adminActionsHtml = '';
  
  if (session) {
    adminActionsHtml = `
      <div class="admin-actions">
        <a href="publicar.html?edit=${article.id}" class="btn-edit">✏️ Editar Matéria</a>
        <button id="delete-btn" class="btn-delete">🗑️ Excluir Matéria</button>
      </div>
    `;
  }

  container.innerHTML = `
    <span class="article-category">${article.category || 'Geral'}</span>
    <h1 class="article-title" style="font-size: 2.3rem; margin-top: 10px;">${article.title}</h1>
    
    ${article.lead ? `<p class="article-lead" style="font-size: 1.2rem; font-weight: 400; color: #444; margin-bottom: 20px;">${article.lead}</p>` : ''}
    
    <!-- Bloco do Autor idêntico ao modelo solicitado -->
    <div class="author-box">
      <img src="${authorAvatar}" alt="${authorName}" class="author-avatar">
      <div class="author-info">
        <span class="author-name">${authorName}</span>
        <span class="author-date">${formattedDate}</span>
      </div>
    </div>

    ${article.image_url ? `
      <div style="margin: 25px 0 5px 0;">
        <img class="article-image" src="${article.image_url}" alt="${article.title}" style="max-height: 500px; border-radius: 6px;">
        ${article.image_caption ? `<div class="article-caption">${article.image_caption}</div>` : ''}
      </div>
    ` : ''}

    <div class="single-article-body">
      ${article.content}
    </div>

    ${adminActionsHtml}
  `;

  // Lógica de exclusão da matéria
  if (session) {
    document.getElementById('delete-btn').addEventListener('click', async () => {
      if (confirm('Tem certeza de que deseja excluir esta matéria permanentemente do site e do banco de dados?')) {
        const { error: delError } = await supabaseClient
          .from('articles')
          .delete()
          .eq('id', articleId);

        if (delError) {
          alert('Erro ao excluir a matéria.');
          console.error(delError);
        } else {
          alert('Matéria excluída com sucesso!');
          window.location.href = 'index.html';
        }
      }
    });
  }
});