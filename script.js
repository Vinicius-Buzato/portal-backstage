document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById('news-grid');
  const catContainer = document.getElementById('category-buttons-container');
  const editorNavContainer = document.getElementById('editor-nav-container');
  const footerAuthLink = document.getElementById('footer-auth-link');
  let allArticles = [];

  async function checkEditorSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      editorNavContainer.innerHTML = `<a href="publicar.html" class="nav-link editor-btn">➕ Publicar Matéria</a>`;
      footerAuthLink.innerHTML = `
        <a href="publicar.html">Painel de Publicação</a> | 
        <a href="#" id="logout-btn" style="color: #ff8080;">Sair da Conta</a>
      `;
      document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        window.location.reload();
      });
    }
  }
  checkEditorSession();

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
    buildDynamicCategories(allArticles);
    renderGrid(allArticles);
  }

  // Gera botões de categoria dinamicamente com base nas matérias cadastradas
  function buildDynamicCategories(articles) {
    const categoriesSet = new Set();
    articles.forEach(item => {
      if (item.category) categoriesSet.add(item.category.trim().toUpperCase());
    });

    let html = `<span class="nav-link active" data-category="TODAS">Todas</span>`;
    categoriesSet.forEach(cat => {
      html += `<span class="nav-link" data-category="${cat}">${cat}</span>`;
    });
    catContainer.innerHTML = html;

    // Reatribui eventos aos novos botões gerados
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
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
  }

  function renderGrid(articles) {
    if (articles.length === 0) {
      grid.innerHTML = '<p style="grid-column: span 12; text-align: center; font-size: 1.1rem; color: #777;">Nenhuma matéria encontrada.</p>';
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

  fetchArticles();
});