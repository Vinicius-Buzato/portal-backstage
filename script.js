document.addEventListener("DOMContentLoaded", () => {
  // Substitua pela URL da API do seu Strapi quando estiver no ar
  const API_URL = 'http://localhost:1337/api/articles?populate=*';

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById('news-grid');
      grid.innerHTML = '';

      // Compatibilidade com estruturas de dados do Strapi
      const articles = data.data || [];

      if (articles.length === 0) {
        grid.innerHTML = '<p style="grid-column: span 12; text-align: center;">Nenhuma matéria publicada no momento.</p>';
        return;
      }

      articles.forEach(item => {
        // Extrai propriedades (ajusta se vier plano ou com .attributes dependendo da versão do Strapi)
        const attr = item.attributes || item;
        const title = attr.title || 'Sem título';
        const category = attr.category || 'Geral';
        const size = attr.size || 'span-12';
        const lead = attr.lead || '';
        const bodyText = attr.body || '';
        const caption = attr.imageCaption || '';

        // Tratamento da Imagem
        let imageUrl = '';
        const imgField = attr.coverImage || attr.CoverImage;
        if (imgField) {
          const imgData = imgField.data ? imgField.data.attributes : imgField;
          if (imgData && imgData.url) {
            // Se estiver em produção, use o domínio do seu Strapi na nuvem
            const baseUrl = 'http://localhost:1337'; 
            imageUrl = imgData.url.startsWith('http') ? imgData.url : `${baseUrl}${imgData.url}`;
          }
        }

        const card = document.createElement('article');
        card.className = `article-card ${size}`;

        card.innerHTML = `
          <span class="article-category">${category}</span>
          <h2 class="article-title">${title}</h2>
          ${lead ? `<p class="article-lead">${lead}</p>` : ''}
          ${imageUrl ? `<img class="article-image" src="${imageUrl}" alt="${title}"><div class="article-caption">${caption}</div>` : ''}
          <div class="article-body">
            <p>${bodyText}</p>
          </div>
        `;

        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Erro ao buscar notícias:", err);
      document.getElementById('news-grid').innerHTML = '<p style="grid-column: span 12; text-align: center; color: red;">Erro ao conectar com o painel de notícias.</p>';
    });
});