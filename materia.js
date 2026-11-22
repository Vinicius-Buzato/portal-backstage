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

  const dateObj = new Date(article.created_at || Date.now());
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const formattedDate = `${day}.${month}.${year} às ${hours}:${minutes}`;

  const authorName = article.author_name || 'Redação Backstage';
  const authorAvatar = article.author_avatar || 'https://www.gravatar.com/avatar/?d=mp';

  const { data: { session } } = await supabaseClient.auth.getSession();
  let adminActionsHtml = '';

  if (session) {
    adminActionsHtml = `
      <div class="admin-actions">
        <a href="publicar.html?edit=${article.id}" class="btn-edit">✏️ Editar Matéria</a>
        <button type="button" id="delete-btn" class="btn-delete">🗑️ Excluir Matéria</button>
      </div>
    `;
  }

  container.innerHTML = `
    <span class="article-category">${article.category || 'Geral'}</span>
    <h1 class="article-title" style="font-size: 2.25rem; margin-top: 8px;">${article.title}</h1>
    ${article.lead ? `<p class="article-lead" style="font-size: 1.15rem; color: #444; margin-bottom: 18px;">${article.lead}</p>` : ''}

    <div class="author-box">
      <img src="${authorAvatar}" alt="${authorName}" class="author-avatar">
      <div class="author-info">
        <span class="author-name">${authorName}</span>
        <span class="author-date">${formattedDate}</span>
      </div>
    </div>

    ${article.image_url ? `
      <div style="margin: 20px 0 10px 0;">
        <img class="article-image" src="${article.image_url}" alt="${article.title}" style="max-height: 480px; border-radius: 6px;">
        ${article.image_caption ? `<div class="article-caption">${article.image_caption}</div>` : ''}
      </div>
    ` : ''}

    <div class="single-article-body">
      ${article.content}
    </div>

    ${adminActionsHtml}
  `;

  if (session) {
    document.getElementById('delete-btn').addEventListener('click', async () => {
      if (confirm('Tem certeza de que deseja excluir esta matéria permanentemente?')) {
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