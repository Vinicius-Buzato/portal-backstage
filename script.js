document.addEventListener("DOMContentLoaded", async () => {
  const mainContent = document.getElementById('main-content');
  const editoriaisToggle = document.getElementById('editoriais-toggle');
  const editoriaisMenu = document.getElementById('editoriais-menu');
  const navButtons = document.querySelectorAll('.portal-nav .nav-link[data-view]');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const editorNavContainer = document.getElementById('editor-nav-container');
  const footerAuthLink = document.getElementById('footer-auth-link');

  let allArticles = [];

  if (editoriaisToggle && editoriaisMenu) {
    editoriaisToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = editoriaisMenu.classList.toggle('open');
      editoriaisToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.addEventListener('click', () => {
    if (editoriaisMenu) {
      editoriaisMenu.classList.remove('open');
    }
    if (editoriaisToggle) {
      editoriaisToggle.setAttribute('aria-expanded', 'false');
    }
  });

  function setActiveNav(targetBtn) {
    document.querySelectorAll('.portal-nav .nav-link').forEach(btn => btn.classList.remove('active'));
    if (targetBtn) targetBtn.classList.add('active');
  }

  async function checkEditorSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      if (editorNavContainer) {
        editorNavContainer.innerHTML = `<a href="publicar.html" class="nav-link editor-btn">➕ Publicar Matéria</a>`;
      }
      if (footerAuthLink) {
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
  }
  checkEditorSession();

  function renderNewsView(articles, headingText) {
    let html = `
      <div class="section-banner">
        <h2>${headingText}</h2>
      </div>
    `;

    if (!articles || articles.length === 0) {
      html += '<p style="grid-column: span 12; text-align: center; font-size: 1.05rem; color: #666;">Nenhuma matéria publicada nesta editoria no momento.</p>';
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

  function resolveProfileAvatarUrl(avatarUrl) {
    const fallback = 'imgs/logo.png';
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return fallback;
    }

    const trimmed = avatarUrl.trim();
    if (!trimmed) {
      return fallback;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    const cleanPath = trimmed.replace(/^\/+/, '');
    const storagePath = cleanPath.startsWith('profiles/')
      ? cleanPath
      : `profiles/${cleanPath}`;

    const { data } = supabaseClient.storage
      .from('articles-images')
      .getPublicUrl(storagePath);

    return (data && data.publicUrl) ? data.publicUrl : fallback;
  }

  function formatSocialHandle(handle) {
    if (!handle || typeof handle !== 'string') return '';
    const trimmed = handle.trim();
    if (!trimmed) return '';
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  }

  async function renderCreatorsView() {
    mainContent.innerHTML = `
      <div class="section-banner">
        <h2>Creators Backstage</h2>
      </div>
      <div class="creators-grid" id="creators-grid">
        <p style="grid-column: 1 / -1; text-align: center;">Carregando creators...</p>
      </div>
    `;

    const { data: profiles, error } = await supabaseClient
      .from('profiles')
      .select('id, full_name, avatar_url, role, social_handle, updated_at')
      .order('updated_at', { ascending: true });

    const creatorsGrid = document.getElementById('creators-grid');

    if (error) {
      console.error('Erro ao buscar creators:', error);
      if (creatorsGrid) {
        creatorsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Erro ao carregar os creators.</p>';
      }
      return;
    }

    const members = Array.isArray(profiles) ? profiles : [];

    if (!creatorsGrid) return;

    if (members.length === 0) {
      creatorsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Nenhum creator cadastrado no momento.</p>';
      return;
    }

    creatorsGrid.innerHTML = members.map((member) => {
      const name = member.full_name || 'Creator Backstage';
      const role = member.role || 'Redação Backstage';
      const photoUrl = resolveProfileAvatarUrl(member.avatar_url);
      const handleText = formatSocialHandle(member.social_handle);
      const socialHtml = handleText
        ? `<span class="creator-social">${handleText}</span>`
        : '';

      return `
        <article class="creator-card">
          <img
            src="${photoUrl}"
            alt="${name}"
            class="creator-photo"
            onerror="this.onerror=null; this.src='imgs/logo.png';"
          >
          <h3 class="creator-name">${name}</h3>
          <span class="creator-role">${role}</span>
          ${socialHtml}
        </article>
      `;
    }).join('');
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

    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('categoria');
    const initialView = params.get('view');

    if (initialView === 'creators' || initialView === 'equipe') {
      const creatorsBtn = document.querySelector('.portal-nav .nav-link[data-view="creators"]');
      setActiveNav(creatorsBtn);
      renderCreatorsView();
    } else if (initialView === 'redes') {
      const redesBtn = document.querySelector('.portal-nav .nav-link[data-view="redes"]');
      setActiveNav(redesBtn);
      renderSocialView();
    } else if (initialCategory) {
      const upperCat = initialCategory.trim().toUpperCase();
      setActiveNav(editoriaisToggle);
      const filtered = allArticles.filter(art =>
        art.category && art.category.trim().toUpperCase() === upperCat
      );
      renderNewsView(filtered, `Editoria: ${initialCategory}`);
    } else {
      renderNewsView(allArticles, 'Últimas Notícias');
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      setActiveNav(btn);

      if (view === 'noticias') {
        renderNewsView(allArticles, 'Últimas Notícias');
      } else if (view === 'creators') {
        renderCreatorsView();
      } else if (view === 'redes') {
        renderSocialView();
      }
    });
  });

  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedCat = item.getAttribute('data-category');
      setActiveNav(editoriaisToggle);
      if (editoriaisMenu) {
        editoriaisMenu.classList.remove('open');
      }

      const filtered = allArticles.filter(art =>
        art.category && art.category.trim().toUpperCase() === selectedCat
      );
      renderNewsView(filtered, `Editoria: ${item.textContent}`);
    });
  });

  fetchArticles();
});