const googleScriptURL = "https://script.google.com/macros/s/AKfycbxwQff22yMdsZw29e17vAF4Olnvg4b3ojA8XOj8QivQzre_gLjQFDSaS4pxjr1E7o36/exec";

// Alternar seções do menu
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.section).classList.add('active'); 

    /*
    document.getElementById('formRelatorio').addEventListener('submit', e => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Adicionar um campo "acao" no formData, porque seu Apps Script espera isso
  formData.append('acao', 'novoRelatorio');

  fetch(googleScriptURL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  })
  .then(() => {
    alert("Relatório enviado (sem resposta por CORS).");
    form.reset();
  })
  .catch((error) => {
    console.error("Erro no fetch:", error);
    alert("Erro ao enviar relatório!");
  });
});*/



  });
});

// Envio do relatório
document.getElementById('formRelatorio').addEventListener('submit', e => {
  e.preventDefault();

  const dados = {
    analista: document.getElementById('analista').value,
    dataEvento: document.getElementById('dataEvento').value,
    local: document.getElementById('local').value,
    descricao: document.getElementById('descricao').value,
    observacao: document.getElementById('observacao').value,
    criticidade: document.getElementById('criticidade').value,
    linkVideo: document.getElementById('linkVideo').value,
    status: "Pendente"
  };

  fetch(googleScriptURL, {
    method: "POST",
    mode: "no-cors", // permite o envio mesmo sem resposta do servidor
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ acao: "novoRelatorio", dados })
  })
  .then(() => {
    alert("Relatório enviado (sem resposta por CORS).");
    e.target.reset();
  })
  .catch((error) => {
    console.error("Erro no fetch:", error);
    alert("Erro ao enviar relatório!");
  });
});

// Painel do fiscal (ainda é estático, simulado)
document.getElementById('listaRelatorios').innerHTML = `
  <div class="card">
    <strong>Local:</strong> Entrada principal<br>
    <strong>Evento:</strong> Pessoa pulando catraca<br>
    <strong>Data:</strong> 25/05/2025 10:32<br>
    <strong>Analista:</strong> João Silva<br>
    <strong>Criticidade:</strong> Alta<br>
    <a href="#" target="_blank">Ver Vídeo</a>
    <div style="margin-top:10px">
      <button>Aprovar</button>
      <button>Reprovar</button>
      <button>Editar</button>
    </div>
  </div>
`;
