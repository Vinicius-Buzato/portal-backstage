document.addEventListener("DOMContentLoaded", async () => {
  const dropdownWrapper = document.querySelector('.dropdown-wrapper');
  const editoriaisToggle = document.getElementById('editoriais-toggle');
  const editoriaisMenu = document.getElementById('editoriais-menu');
  const editorNavContainer = document.getElementById('editor-nav-container');

  if (editoriaisToggle && editoriaisMenu) {
    editoriaisToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editoriaisMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (dropdownWrapper && !dropdownWrapper.contains(e.target)) {
        editoriaisMenu.classList.remove('open');
      }
    });
  }

  if (editorNavContainer && typeof supabaseClient !== 'undefined') {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      editorNavContainer.innerHTML = `<a href="publicar.html" class="nav-link editor-btn">➕ Publicar Matéria</a>`;
    }
  }
});