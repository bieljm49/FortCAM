document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFiscal');

    const usuarios = [
        { usuario: 'fiscal', senha: 'fisc@l1234' },
        { usuario: 'fiscal2', senha: 'abcd' },
        { usuario: 'admin', senha: 'admin123' }
    ];

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nomeFiscal = document.getElementById('nomeFiscal').value.trim();
            const senhaFiscal = document.getElementById('senhaFiscal').value.trim();

            const usuarioValido = usuarios.find(user => user.usuario === nomeFiscal && user.senha === senhaFiscal);

            if (usuarioValido) {
                localStorage.setItem('fiscalLogado', 'true');
                window.location.href = 'painel-fiscal.html';  // ajuste se estiver em outra pasta
            } else {
                alert('Usuário ou senha incorretos!');
            }
        });
    }
});

// ========== LOGOUT ==========
function logout() {
  localStorage.removeItem("fiscalLogado");
  window.location.href = "login.html";
  
}