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

  // Atualiza o título da aba do navegador
  document.title = `${article.title} - Portal Backstage`;

  container.innerHTML = `
    <span class="article-category">${article.category || 'Geral'}</span>
    <h1 class="article-title" style="font-size: 2.5rem; margin-top: 10px;">${article.title}</h1>
    ${article.lead ? `<p class="article-lead" style="font-size: 1.25rem; font-weight: 400; color: #333;">${article.lead}</p>` : ''}
    
    ${article.image_url ? `
      <div style="margin: 25px 0;">
        <img class="article-image" src="${article.image_url}" alt="${article.title}" style="max-height: 500px; border-radius: 6px;">
        ${article.image_caption ? `<div class="article-caption">${article.image_caption}</div>` : ''}
      </div>
    ` : ''}

    <div class="single-article-body">
      ${article.content}
    </div>
  `;
});