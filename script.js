document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById('news-grid');
  
  const { data: articles, error } = await supabaseClient
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar notícias:", error);
    grid.innerHTML = '<p style="grid-column: span 12; text-align: center; color: red;">Erro ao carregar matérias.</p>';
    return;
  }

  if (!articles || articles.length === 0) {
    grid.innerHTML = '<p style="grid-column: span 12; text-align: center;">Nenhuma matéria publicada no momento.</p>';
    return;
  }

  grid.innerHTML = '';

  articles.forEach(article => {
    const card = document.createElement('article');
    card.className = `article-card ${article.size || 'span-12'}`;

    card.innerHTML = `
      <span class="article-category">${article.category || 'Geral'}</span>
      <h2 class="article-title">${article.title}</h2>
      ${article.lead ? `<p class="article-lead">${article.lead}</p>` : ''}
      ${article.image_url ? `<img class="article-image" src="${article.image_url}" alt="${article.title}"><div class="article-caption">${article.image_caption || ''}</div>` : ''}
      <div class="article-body">
        <p>${article.content}</p>
      </div>
    `;

    grid.appendChild(card);
  });
});