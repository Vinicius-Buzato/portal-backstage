// ============================================================================
// PORTAL BACKSTAGE — SCRIPT PRINCIPAL (FRONT-END MODULAR)
// ============================================================================

const EDITORIAL_CATEGORIES = ['Artes', 'Cinema', 'Música'];

let allArticlesCache = [];
let activeViewMode = 'news'; // 'news' | 'editorial' | 'team' | 'social'
let activeEditorialFilter = null;

// ----------------------------------------------------------------------------
// Utilitários de formatação e resolução de URLs
// ----------------------------------------------------------------------------

function formatArticleDate(dateInput) {
  if (!dateInput) return '';
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveStorageImageUrl(pathOrUrl, defaultSubfolder = '') {
  const fallback = 'imgs/logo.png';
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    return fallback;
  }

  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const cleanPath = trimmed.replace(/^\/+/, '');
  const finalPath =
    defaultSubfolder && !cleanPath.startsWith(`${defaultSubfolder}/`)
      ? `${defaultSubfolder}/${cleanPath}`
      : cleanPath;

  if (typeof supabaseClient !== 'undefined' && supabaseClient?.storage) {
    const { data } = supabaseClient.storage
      .from('articles-images')
      .getPublicUrl(finalPath);
    if (data && data.publicUrl) {
      return data.publicUrl;
    }
  }

  return `./imgs/${cleanPath}`;
}

function resolveProfileAvatarUrl(avatarUrl) {
  return resolveStorageImageUrl(avatarUrl, 'profiles');
}

// ----------------------------------------------------------------------------
// Carregamento de matérias no Supabase
// ----------------------------------------------------------------------------

async function fetchArticles() {
  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    console.error('Cliente Supabase não inicializado em config.js.');
    return [];
  }

  const { data, error } = await supabaseClient
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar matérias:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// ----------------------------------------------------------------------------
// Renderização da secção de notícias / editoriais
// ----------------------------------------------------------------------------

function renderBanner(titleText) {
  return `
    <div class="section-banner">
      <h2>${escapeHtml(titleText)}</h2>
    </div>
  `;
}

function createArticleCard(article) {
  const id = encodeURIComponent(article.id);
  const category = article.category || 'Geral';
  const title = article.title || 'Sem título';
  const subtitle = article.subtitle || article.excerpt || '';
  const imageUrl = article.image_url ? resolveStorageImageUrl(article.image_url) : '';
  const dateLabel = formatArticleDate(article.created_at);

  return `
    <article class="article-card">
      <div class="article-card-meta">
        <span class="article-category">${escapeHtml(category)}</span>
        ${dateLabel ? `<span class="article-date">${escapeHtml(dateLabel)}</span>` : ''}
      </div>
      <h3 class="article-title">${escapeHtml(title)}</h3>
      ${subtitle ? `<p class="article-excerpt">${escapeHtml(subtitle)}</p>` : ''}
      ${
        imageUrl
          ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" class="article-thumb" loading="lazy" onerror="this.style.display='none';">`
          : ''
      }
      <a href="materia.html?id=${id}" class="read-more-link">LER MATÉRIA COMPLETA →</a>
    </article>
  `;
}

function renderArticlesFeed(articles, bannerTitle) {
  const container = document.getElementById('news-feed-container');
  if (!container) return;

  const list = Array.isArray(articles) ? articles : [];

  if (list.length === 0) {
    container.innerHTML = `
      ${renderBanner(bannerTitle)}
      <div class="empty-state" style="grid-column: span 12; text-align: center; padding: 32px 16px;">
        <p>Nenhuma matéria encontrada nesta secção no momento.</p>
      </div>
    `;
    return;
  }

  const cardsHtml = list.map(createArticleCard).join('');
  container.innerHTML = `
    ${renderBanner(bannerTitle)}
    <div class="articles-grid" style="grid-column: span 12;">
      ${cardsHtml}
    </div>
  `;
}

// ----------------------------------------------------------------------------
// Renderização dinâmica da aba Equipe (tabela profiles + pasta profiles/)
// ----------------------------------------------------------------------------

async function renderTeamView() {
  const container = document.getElementById('news-feed-container');
  if (!container) return;

  activeViewMode = 'team';
  activeEditorialFilter = null;

  container.innerHTML = `
    <div class="team-header-row">
      <h2>Equipe Backstage</h2>
      <span class="team-count-badge" id="team-count-badge">Carregando...</span>
    </div>
    <div class="team-grid" id="team-grid">
      <p style="grid-column: 1 / -1; text-align: center;">Carregando integrantes...</p>
    </div>
  `;

  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    const countBadge = document.getElementById('team-count-badge');
    const teamGrid = document.getElementById('team-grid');
    if (countBadge) countBadge.textContent = '0 integrantes';
    if (teamGrid) {
      teamGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Conexão com o banco indisponível.</p>';
    }
    return;
  }

  const { data: profiles, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, avatar_url, role, social_handle, updated_at')
    .order('updated_at', { ascending: true });

  const countBadge = document.getElementById('team-count-badge');
  const teamGrid = document.getElementById('team-grid');

  if (error) {
    console.error('Erro ao carregar perfis da tabela profiles:', error);
    if (countBadge) countBadge.textContent = '0 integrantes';
    if (teamGrid) {
      teamGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #b91c1c;">Não foi possível carregar os perfis da equipe.</p>';
    }
    return;
  }

  const members = Array.isArray(profiles) ? profiles : [];
  const total = members.length;

  if (countBadge) {
    countBadge.textContent = `${total} ${total === 1 ? 'integrante' : 'integrantes'}`;
  }

  if (!teamGrid) return;

  if (total === 0) {
    teamGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Nenhum perfil cadastrado na equipe.</p>';
    return;
  }

  teamGrid.innerHTML = members
    .map((member) => {
      const fullName = member.full_name || 'Integrante Backstage';
      const role = member.role || 'Redação Backstage';
      const avatarSrc = resolveProfileAvatarUrl(member.avatar_url);
      const socialHandle = member.social_handle
        ? `<span class="team-handle">${escapeHtml(member.social_handle)}</span>`
        : '';

      return `
        <article class="team-card">
          <img
            src="${escapeHtml(avatarSrc)}"
            alt="${escapeHtml(fullName)}"
            class="team-avatar"
            loading="lazy"
            onerror="this.onerror=null; this.src='imgs/logo.png';"
          >
          <h3 class="team-name">${escapeHtml(fullName)}</h3>
          <p class="team-role">${escapeHtml(role)}</p>
          ${socialHandle}
        </article>
      `;
    })
    .join('');
}

// ----------------------------------------------------------------------------
// Renderização da aba Redes Sociais
// ----------------------------------------------------------------------------

function renderSocialView() {
  const container = document.getElementById('news-feed-container');
  if (!container) return;

  activeViewMode = 'social';
  activeEditorialFilter = null;

  container.innerHTML = `
    ${renderBanner('Redes Sociais')}
    <div class="social-grid">
      <article class="social-card">
        <h3>INSTAGRAM</h3>
        <p>Coberturas visuais, bastidores de eventos, galerias e pautas diárias da cultura e da cidade.</p>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-btn">ACESSAR INSTAGRAM</a>
      </article>
      <article class="social-card">
        <h3>TIKTOK</h3>
        <p>Vídeos curtos, entrevistas rápidas, tendências culturais e momentos ao vivo direto do front.</p>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="social-btn">ACESSAR TIKTOK</a>
      </article>
      <article class="social-card">
        <h3>YOUTUBE</h3>
        <p>Reportagens especiais, bastidores em vídeo, especiais de música, cinema e artes visuais.</p>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-btn">ACESSAR YOUTUBE</a>
      </article>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// Filtros de visualização e navegação
// ----------------------------------------------------------------------------

function showLatestNews() {
  activeViewMode = 'news';
  activeEditorialFilter = null;
  renderArticlesFeed(allArticlesCache, 'Últimas Notícias');
}

function filterByEditorial(categoryName) {
  activeViewMode = 'editorial';
  activeEditorialFilter = categoryName;

  const normalizedTarget = String(categoryName || '').trim().toLowerCase();
  const filtered = allArticlesCache.filter(
    (item) => String(item.category || '').trim().toLowerCase() === normalizedTarget
  );

  renderArticlesFeed(filtered, `Editorial: ${categoryName}`);
}

function setupNavigationListeners() {
  const navNewsBtn = document.getElementById('nav-news') || document.querySelector('[data-view="news"]');
  const navTeamBtn = document.getElementById('nav-team') || document.querySelector('[data-view="team"]');
  const navSocialBtn = document.getElementById('nav-social') || document.querySelector('[data-view="social"]');

  if (navNewsBtn) {
    navNewsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showLatestNews();
    });
  }

  if (navTeamBtn) {
    navTeamBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderTeamView();
    });
  }

  if (navSocialBtn) {
    navSocialBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderSocialView();
    });
  }

  const editorialLinks = document.querySelectorAll('[data-editorial]');
  editorialLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-editorial');
      if (cat) filterByEditorial(cat);
    });
  });

  // Suporte para abrir uma aba específica via hash na URL (#equipe, #redes, #noticias)
  window.addEventListener('hashchange', handleHashNavigation);
}

function handleHashNavigation() {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#equipe' || hash === '#team') {
    renderTeamView();
  } else if (hash === '#redes' || hash === '#social') {
    renderSocialView();
  } else {
    showLatestNews();
  }
}

// ----------------------------------------------------------------------------
// Inicialização da página
// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigationListeners();
  allArticlesCache = await fetchArticles();
  handleHashNavigation();
});