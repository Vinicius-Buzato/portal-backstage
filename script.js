document.addEventListener("DOMContentLoaded", async () => {
  const mainContent = document.getElementById('main-content');
  const editoriaisToggle = document.getElementById('editoriais-toggle');
  const editoriaisMenu = document.getElementById('editoriais-menu');
  const navButtons = document.querySelectorAll('.portal-nav .nav-link[data-view]');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const editorNavContainer = document.getElementById('editor-nav-container');
  const footerAuthLink = document.getElementById('footer-auth-link');

  let allArticles = [];

  // Perfis da equipe
  const teamMembers = [
    {
      name: "Marina Albuquerque",
      role: "Editora de Artes & Cultura",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      socialLabel: "@marina.artes",
      socialUrl: "https://instagram.com"
    },
    {
      name: "Lucas Vasconcelos",
      role: "Crítico de Cinema",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      socialLabel: "@lucas.cinema",
      socialUrl: "https://instagram.com"
    },
    {
      name: "Beatriz Nogueira",
      role: "Repórter de Música & Cena SP",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      socialLabel: "@bia.som",
      socialUrl: "https://instagram.com"
    }
  ];

  // Alterna abertura do menu expansivo Editoriais
  editoriaisToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    editoriaisMenu.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    editoriaisMenu.classList.remove('open');
  });

  function setActiveNav(targetBtn) {
    document.querySelectorAll('.portal-nav .nav-link').forEach(btn => btn.classList.remove('active'));
    if (targetBtn) targetBtn.classList.add('active');
  }

  async function checkEditorSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      editorNavContainer.innerHTML = `<a href="publicar.html" class="nav-link editor-btn">➕ Publicar Matéria</a>`;
      footerAuthLink.innerHTML = `
        <a href="publicar.html">Painel de Publicação</a> | 
        <a href="#" id="logout-btn" style="color: #ff9999;">Sair da Conta</a>
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
      mainContent.innerHTML = '<p style="grid-column: span 12; text-align: center; color: red;">Erro ao carregar matérias do servidor.</p>';
      return;
    }

    allArticles = articles || [];
    renderNewsView(allArticles, 'Últimas Notícias');
  }

  function renderNewsView(articles, headingText) {
    let html = `
      <div class="section-banner">
        <h2>${headingText}</h2>
      </div>
    `;

    if (!articles || articles.length === 0) {
      html += '<p style="grid-column: span 12; text-align: center; font-size: 1.05rem; color: #666;">Nenhuma matéria publicada neste editorial no momento.</p>';
      mainContent.innerHTML = html;
      return;
    }

    mainContent.innerHTML = html;

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
          <h3 class="article-title">
            <a href="materia.html?id=${article.id}">${article.title}</a>
          </h3>
          ${article.lead ? `<p class="article-lead">${article.lead}</p>` : ''}
          <div class="article-footer">
            <a href="materia.html?id=${article.id}" class="read-more-btn">Ler matéria completa →</a>
          </div>
        </div>
      `;
      mainContent.appendChild(card);
    });
  }

  function renderTeamView() {
    const cardsHtml = teamMembers.map(member => `
      <div class="team-card">
        <img src="${member.photo}" alt="${member.name}" class="team-photo">
        <h3 class="team-name">${member.name}</h3>
        <span class="team-role">${member.role}</span>
        <a href="${member.socialUrl}" target="_blank" rel="noopener noreferrer" class="team-social">${member.socialLabel}</a>
      </div>
    `).join('');

    mainContent.innerHTML = `
      <div class="section-banner">
        <h2>Equipe Backstage</h2>
      </div>
      <div class="team-grid">
        ${cardsHtml}
      </div>
    `;
  }

  function renderSocialView() {
    mainContent.innerHTML = `
      <div class="section-banner">
        <h2>Redes Sociais</h2>
      </div>
      <div class="social-grid">
        <div class="social-card">
          <div>
            <h3>Instagram</h3>
            <p>Coberturas visuais, bastidores de eventos, galerias e pautas diárias da cultura e da cidade.</p>
          </div>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="social-btn">Acessar Instagram</a>
        </div>

        <div class="social-card">
          <div>
            <h3>TikTok</h3>
            <p>Vídeos curtos, entrevistas rápidas, tendências culturais e momentos ao vivo direto do front.</p>
          </div>
          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" class="social-btn">Acessar TikTok</a>
        </div>

        <div class="social-card">
          <div>
            <h3>YouTube</h3>
            <p>Reportagens especiais, bastidores em vídeo, especiais de música, cinema e artes visuais.</p>
          </div>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" class="social-btn">Acessar YouTube</a>
        </div>
      </div>
    `;
  }

  // Eventos dos botões principais da navegação
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      setActiveNav(btn);

      if (view === 'noticias') {
        renderNewsView(allArticles, 'Últimas Notícias');
      } else if (view === 'equipe') {
        renderTeamView();
      } else if (view === 'redes') {
        renderSocialView();
      }
    });
  });

  // Eventos das opções fixas dentro de Editoriais (Artes, Cinema, Música)
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedCat = item.getAttribute('data-category');
      setActiveNav(editoriaisToggle);
      editoriaisMenu.classList.remove('open');

      const filtered = allArticles.filter(art =>
        art.category && art.category.trim().toUpperCase() === selectedCat
      );
      renderNewsView(filtered, `Editorial: ${item.textContent}`);
    });
  });

  fetchArticles();
});