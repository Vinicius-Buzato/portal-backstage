document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('contact-btn');
  const status = document.getElementById('contact-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('sender_email').value.trim();
    const message = document.getElementById('message').value.trim();

    btn.disabled = true;
    btn.innerText = 'Enviando...';
    status.style.color = '#252525';
    status.innerText = 'Enviando mensagem para a redação...';

    try {
      const response = await fetch("https://formsubmit.co/ajax/backstageuninove@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: email,
          mensagem: message,
          _subject: "Nova mensagem - Portal Backstage"
        })
      });

      const result = await response.json();

      if (response.ok && result.success !== "false") {
        status.style.color = '#5B2A86';
        status.innerText = 'Mensagem enviada com sucesso para backstageuninove@gmail.com!';
        form.reset();
      } else {
        throw new Error("Falha no envio");
      }
    } catch (err) {
      console.error("Erro ao enviar contato:", err);
      status.style.color = '#b8292f';
      status.innerText = 'Não foi possível enviar a mensagem agora. Tente novamente.';
    } finally {
      btn.disabled = false;
      btn.innerText = 'Enviar Mensagem';
    }
  });
});