const googleScriptURL = "https://script.google.com/macros/s/AKfycbxx8qFuuvkYdqEm6joO_0-boWzIW_BGXP6vjKyDiFxvBV_nIZToG1cwmeHXB17sjqv6/exec";


// Alternar seções do menu
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.section).classList.add('active'); 

    });
});

// Envio do relatório
// ========== ENVIO DO RELATÓRIO (somente se existir o formulário no DOM) ==========
if (document.getElementById('formRelatorio')) {
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
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "novoRelatorio", dados }) // <- envia como esperado
    })
    .then(() => {
      alert("Relatório enviado com sucesso!");
      e.target.reset(); // limpa o formulário
      carregarRelatorios?.(); // só chama se existir
    })
    .catch((error) => {
      console.error("Erro ao enviar relatório:", error);
      alert("Erro ao enviar relatório.");
    });
  });
}




// ========== CARREGAR RELATÓRIOS ==========
// ========== INICIAR PAINEL ==========
if (document.getElementById("relatoriosContainer")) {
  carregarRelatorios();
}


function carregarRelatorios() {
  fetch(googleScriptURL + "?acao=listar")
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("relatoriosContainer");
      container.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p>Nenhum relatório encontrado.</p>";
        return;
      }

      // 🔽 Filtros ativos
      const statusSelecionado = document.getElementById("filtroStatus")?.value || "";
      const analistaSelecionado = document.getElementById("filtroAnalista")?.value || "";

      // 🔁 Filtrar os dados
      const filtrados = data.filter(rel => {
        const statusOk = !statusSelecionado || rel.status === statusSelecionado;
        const analistaOk = !analistaSelecionado || rel.analista === analistaSelecionado;
        return statusOk && analistaOk;
      });

      // 🔽 Preencher dropdown de analistas (únicos)
      const selectAnalista = document.getElementById("filtroAnalista");
      if (selectAnalista && selectAnalista.options.length <= 1) {
        const analistasUnicos = [...new Set(data.map(r => r.analista).filter(Boolean))];
        analistasUnicos.forEach(nome => {
          const opt = document.createElement("option");
          opt.value = nome;
          opt.textContent = nome;
          selectAnalista.appendChild(opt);
        });
      }

      if (filtrados.length === 0) {
        container.innerHTML = "<p>Nenhum relatório encontrado com os filtros selecionados.</p>";
        return;
      }

      filtrados.forEach(rel => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <p><strong>ID:</strong> ${rel.id}</p>
          <p><strong>Data:</strong> ${rel.dataEvento}</p>
          <p><strong>Local:</strong> ${rel.local}</p>
          <p><strong>Analista:</strong> ${rel.analista}</p>
          <p><strong>Descrição:</strong> ${rel.descricao}</p>
          <p><strong>Observação:</strong> ${rel.observacao}</p>
          <p><strong>OCorreu algo grave?:</strong> ${rel.criticidade}</p>
          <p><a href="${rel.linkVideo}" target="_blank"><strong>Ver Vídeo</strong></a></p>
          <p><strong>Status atual:</strong> ${rel.status}</p>
          <div class="form-group">
            <!-- <label for="justificativa-${rel.id}">Justificativa (opcional):
            <input type="text" id="justificativa-${rel.id}" required /></label>-->
          </div>
          <br>
          <button onclick="atualizarStatus('${rel.id}', 'Aprovado')" style="padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;"><strong>Aprovar</strong></button>
      
          <button onclick="atualizarStatus('${rel.id}', 'Reprovado')" style="padding: 10px 20px;
      background-color:rgb(175, 83, 76);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;"><strong>Reprovar</strong></button>


      <button onclick='gerarPDF(${JSON.stringify(rel)})'
      style="padding: 10px 20px;
      background-color:rgb(24, 43, 66);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;"><strong>Gerar PDF</strong></button>
      
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Erro ao carregar relatórios:", error);
    });
}

// ========== Ativando os filtros ===================

document.getElementById("filtroStatus")?.addEventListener("change", carregarRelatorios);
document.getElementById("filtroAnalista")?.addEventListener("change", carregarRelatorios);



// ========== ATUALIZAR STATUS ==========
function atualizarStatus(id, status) {
  const fiscal = localStorage.getItem("fiscalLogado") || "Desconhecido";
  const justificativa = document.getElementById(`justificativa-${id}`)?.value || "";

  const dados = {
    acao: "atualizarStatus",
    id,
    status,
    fiscal,
    justificativa
  };

  fetch(googleScriptURL, {
    method: "POST",
    mode: "no-cors", // <- ISSO RESOLVE O ERRO CORS
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
    .then(() => {
      alert(`Relatório ${status.toLowerCase()} Enviado! `);
      carregarRelatorios(); // recarrega lista
    })
    .catch((error) => {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do relatório.");
    });
}


// ========== GERADOR DE PDF ==========
function gerarPDF(relatorio) {
  const {
    id,
    analista,
    dataEvento,
    local,
    descricao,
    observacao,
    criticidade
  } = relatorio;

  const fiscal = localStorage.getItem("fiscalLogado") || "Fiscal não identificado";
  const descricaoFormatada = descricao.replace(/\n/g, "<br>");
  const observacaoFormatada = (observacao || "Sem nenhum adendo.").replace(/\n/g, "<br>");
  const dataFormatada = new Date(dataEvento).toLocaleDateString("pt-BR");

  // Container A4
  const pdfWrapper = document.createElement("div");
  pdfWrapper.style.width = "210mm";
  pdfWrapper.style.minHeight = "297mm";
  pdfWrapper.style.position = "relative";
  pdfWrapper.style.padding = "20mm";
  pdfWrapper.style.boxSizing = "border-box";
  pdfWrapper.style.fontFamily = "'Montserrat', sans-serif";
  pdfWrapper.style.fontSize = "12pt";
  pdfWrapper.style.color = "#000";

  // Marca d'água
  const marca = document.createElement("img");
  marca.src = "logo.png";
  marca.style.position = "absolute";
  marca.style.opacity = "0.35";
  marca.style.top = "1px";
  marca.style.left = "50%";
  marca.style.transform = "translate(-50%, -50%)";
  marca.style.width = "300px";
  marca.style.zIndex = "0";
  pdfWrapper.appendChild(marca);

  // Conteúdo
  const conteudo = document.createElement("div");
  
  conteudo.style.position = "static ";
  conteudo.style.top = "100px";

  conteudo.style.zIndex = "1";
  conteudo.innerHTML = `
    <h1>Relatório de Ocorrência</h1>
    <p><strong>Cliente:</strong> ${local}</p>
    <p><strong>Data da Análise:</strong> ${dataFormatada}</p>

    <h2 style="margin-top: 20px;">Diagnóstico</h2>
    <p>Fomos contratados para realizar uma análise técnica detalhada, aplicando soluções avançadas em segurança e monitoramento.</p>

    <h2 style="margin-top: 20px;">Descrição da Ocorrência</h2>
    <p>${descricaoFormatada}</p>

    ${criticidade === "Sim" ? `<p style="color: red; font-weight: bold;">⚠ Ocorrência considerada crítica</p>` : ""}

    <h2 style="margin-top: 20px;">Observações</h2>
    <p>${observacaoFormatada}</p>

    <hr style="margin: 30px 0;">

    <div style="display: flex; justify-content: space-between;">
      <div><strong>Fiscal:</strong> ${fiscal}</div>
      <div><strong>Analista:</strong> ${analista}</div>
    </div>
    
  `;
  pdfWrapper.appendChild(conteudo);

  // Gerar o PDF
  html2pdf().set({
    margin: 0,
    filename: `Relatorio_${id}.pdf`,
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }).from(pdfWrapper).save();
}
