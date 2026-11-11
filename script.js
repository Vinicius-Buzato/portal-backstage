document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById('news-grid');
  const navLinks = document.querySelectorAll('.nav-link');
  let allArticles = [];

  // 1. Busca todas as notícias do Supabase
  async function fetchArticles() {
    const { data: articles, error } = await supabaseClient
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar notícias:", error);
      grid.innerHTML = '<p style="grid-column: span 12; text-align: center; color: red;">Erro ao carregar matérias do servidor.</p>';
      return;
    }

    allArticles = articles || [];
    renderGrid(allArticles);
  }

  // 2. Renderiza as notícias no grid
  function renderGrid(articles) {
    if (articles.length === 0) {
      grid.innerHTML = '<p style="grid-column: span 12; text-align: center; font-size: 1.1rem; color: #777;">Nenhuma matéria encontrada nesta categoria.</p>';
      return;
    }

    grid.innerHTML = '';

    articles.forEach(article => {
      const card = document.createElement('article');
      card.className = `article-card ${article.size || 'span-12'}`;

      card.innerHTML = `
        ${article.image_url ? `
          <div class="article-image-wrapper">
            <img class="article-image" src="${article.image_url}" alt="${article.title}">
          </div>
        ` : ''}
        <div class="article-content">
          <span class="article-category">${article.category || 'Geral'}</span>
          <h2 class="article-title">
            <a href="materia.html?id=${article.id}">${article.title}</a>
          </h2>
          ${article.lead ? `<p class="article-lead">${article.lead}</p>` : ''}
          <div class="article-footer">
            <a href="materia.html?id=${article.id}" class="read-more-btn">Ler matéria completa →</a>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // 3. Filtro funcional do Menu por Categoria
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');

      const category = e.target.getAttribute('data-category');

      if (category === 'TODAS') {
        renderGrid(allArticles);
      } else {
        const filtered = allArticles.filter(item => 
          item.category && item.category.trim().toUpperCase() === category
        );
        renderGrid(filtered);
      }
    });
  });

  fetchArticles();
});