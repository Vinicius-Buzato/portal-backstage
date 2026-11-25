let currentUserId = null;
let currentAuthorName = '';
let currentAuthorAvatar = '';
let editMode = false;
let articleIdToEdit = null;
let existingImageUrl = '';

async function loadAuthorProfile(userId) {
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.warn('Perfil não encontrado em profiles, usando fallback:', error);
    return {
      full_name: 'Editor Backstage',
      avatar_url: 'imgs/logo.png'
    };
  }

  return {
    full_name: profile.full_name || 'Editor Backstage',
    avatar_url: profile.avatar_url || 'imgs/logo.png'
  };
}

async function initPage() {
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError || !session) {
    window.location.href = 'login.html';
    return;
  }

  currentUserId = session.user.id;
  const profile = await loadAuthorProfile(currentUserId);
  currentAuthorName = profile.full_name;
  currentAuthorAvatar = profile.avatar_url;

  const urlParams = new URLSearchParams(window.location.search);
  articleIdToEdit = urlParams.get('edit');

  if (articleIdToEdit) {
    editMode = true;
    document.getElementById('page-title').innerText = 'Editar Matéria - Portal Backstage';
    document.getElementById('form-heading').innerText = 'Editar Matéria';
    document.getElementById('submit-btn').innerText = 'Salvar Alterações';
    await loadArticleData(articleIdToEdit);
  }
}

async function loadArticleData(id) {
  const { data, error } = await supabaseClient
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    alert('Erro ao carregar matéria para edição.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('title').value = data.title || '';
  document.getElementById('category').value = data.category || '';
  document.getElementById('size').value = data.size || 'span-12';
  document.getElementById('lead').value = data.lead || '';
  document.getElementById('image_caption').value = data.image_caption || '';
  document.getElementById('content').value = data.content || '';
  existingImageUrl = data.image_url || '';
}

document.getElementById('news-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('status-message');

  btn.disabled = true;
  btn.innerText = editMode ? 'Salvando...' : 'Publicando...';
  status.style.color = '#252525';
  status.innerText = 'Processando dados e imagem...';

  // Garante dados frescos do perfil no momento do salvamento
  const freshProfile = await loadAuthorProfile(currentUserId);
  currentAuthorName = freshProfile.full_name;
  currentAuthorAvatar = freshProfile.avatar_url;

  let imageUrl = existingImageUrl;

  const fileInput = document.getElementById('image_file');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const MAX_SIZE_MB = 5;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      status.style.color = 'red';
      status.innerText = `A imagem é muito grande! O limite máximo é de ${MAX_SIZE_MB}MB.`;
      btn.disabled = false;
      btn.innerText = editMode ? 'Salvar Alterações' : 'Publicar Matéria no Ar';
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('articles-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      status.style.color = 'red';
      status.innerText = 'Erro ao enviar imagem para o servidor.';
      btn.disabled = false;
      btn.innerText = editMode ? 'Salvar Alterações' : 'Publicar Matéria no Ar';
      return;
    }

    const { data: publicURLData } = supabaseClient.storage
      .from('articles-images')
      .getPublicUrl(filePath);

    imageUrl = publicURLData.publicUrl;
  }

  const articleData = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    size: document.getElementById('size').value,
    lead: document.getElementById('lead').value,
    image_url: imageUrl,
    image_caption: document.getElementById('image_caption').value,
    content: document.getElementById('content').value,
    author_name: currentAuthorName,
    author_avatar: currentAuthorAvatar
  };

  let error;
  if (editMode) {
    const res = await supabaseClient.from('articles').update(articleData).eq('id', articleIdToEdit);
    error = res.error;
  } else {
    const res = await supabaseClient.from('articles').insert([articleData]);
    error = res.error;
  }

  if (error) {
    console.error("Erro Supabase:", error);
    status.style.color = 'red';
    status.innerText = 'Erro ao salvar. Verifique o console para detalhes.';
    btn.disabled = false;
    btn.innerText = editMode ? 'Salvar Alterações' : 'Publicar Matéria no Ar';
  } else {
    status.style.color = '#5B2A86';
    status.innerText = editMode ? 'Matéria atualizada com sucesso!' : 'Matéria publicada com sucesso! Redirecionando...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
});

initPage();