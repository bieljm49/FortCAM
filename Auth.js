document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginFiscal');

  const usuarios = [
    { usuario: 'fiscal', senha: 'fisc@l1234', tipo: 'fiscal' },
    { usuario: 'analista1', senha: 'an@lista', tipo: 'analista' },
    { usuario: 'admin', senha: 'admin123', tipo: 'gestao' },
    
    { usuario: 'gabriel.medeiros', senha: 'fortcam', tipo: 'gestao' },
    { usuario: 'miguel.fernando', senha: 'fortcam', tipo: 'gestao' },
    { usuario: 'daniel.henrique', senha: 'fortcam', tipo: 'gestao' }
  ];

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const nome = document.getElementById('nomeFiscal').value.trim();
      const senha = document.getElementById('senhaFiscal').value.trim();
      const tipo = document.getElementById('tipoUsuario').value;

      const usuarioValido = usuarios.find(
        u => u.usuario === nome && u.senha === senha && u.tipo === tipo
      );

      if (usuarioValido) {
        localStorage.setItem("usuarioLogado", nome);
        localStorage.setItem("tipoUsuario", tipo);

        // Redirecionar de acordo com o tipo
        if (tipo === "fiscal") window.location.href = "painel-fiscal.html";
        if (tipo === "analista") window.location.href = "painel-analista.html"; // <-- index.html não deve ser usado como painel
        if (tipo === "gestao") window.location.href = "dashboard.html";
      } else {
        alert("Usuário, senha ou tipo incorretos!");
      }
    });
  }

  // Preencher campo "analista" automaticamente no formulário
  if (document.getElementById("analista")) {
    const tipo = localStorage.getItem("tipoUsuario");
    const nome = localStorage.getItem("usuarioLogado");

    if (tipo !== "analista" && tipo !== "gestao") {
      alert("Acesso não autorizado!");
      location.href = "index.html";
    } else {
      const campo = document.getElementById("analista");
      campo.value = nome;
      campo.setAttribute("readonly", true);
    }
  }
});

// Logout global
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

 const nome = localStorage.getItem("usuarioLogado") || "Usuário";
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
  logoutLink.textContent = `Seja bem-vindo ${nome}`;
}


