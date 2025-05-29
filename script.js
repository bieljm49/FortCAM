const googleScriptURL = "https://script.google.com/macros/s/AKfycbxx8qFuuvkYdqEm6joO_0-boWzIW_BGXP6vjKyDiFxvBV_nIZToG1cwmeHXB17sjqv6/exec";



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


// ================== INICIALIZAÇÃO ==================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(link.dataset.section).classList.add('active');
  });
});

if (document.getElementById("relatoriosContainer")) {
  carregarRelatorios();
}

document.getElementById("filtroStatus")?.addEventListener("change", carregarRelatorios);
document.getElementById("filtroAnalista")?.addEventListener("change", carregarRelatorios);

// ================== CARREGAR RELATÓRIOS ==================
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

      const statusSelecionado = document.getElementById("filtroStatus")?.value || "";
      const analistaSelecionado = document.getElementById("filtroAnalista")?.value || "";

      const filtrados = data.filter(rel => {
        const statusOk = !statusSelecionado || rel.status === statusSelecionado;
        const analistaOk = !analistaSelecionado || rel.analista === analistaSelecionado;
        return statusOk && analistaOk;
      });

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

        // Cabeçalho resumido
        const resumo = document.createElement("div");
        resumo.className = "card-resumo";
        resumo.innerHTML = `
          <p><strong>ID:</strong> ${rel.id}</p>
          <p><strong>Analista:</strong> ${rel.analista}</p>
          <p><strong>Status:</strong> ${rel.status}</p>
        `;

        // Conteúdo oculto
        const detalhes = document.createElement("div");
        detalhes.className = "card-detalhes";
        detalhes.style.display = "none"; // oculto por padrão
        detalhes.innerHTML = `
          <p><strong>Data:</strong> ${rel.dataEvento}</p>
          <p><strong>Local:</strong> ${rel.local}</p>
          <p><strong>Descrição:<br></strong> ${rel.descricao}</p>
          <p><strong>Observação:</strong> ${rel.observacao}</p>
          <p><strong>Ocorreu algo grave?:</strong> ${rel.criticidade}</p>          
          <p><strong>Justificativa:</strong> ${rel.justificativa || "—"}</p>
          <p><strong>Aprovado/Reprovado Por:</strong> ${rel.fiscal || "—"}</p>
          <p>
  <a href="${rel.linkVideo}" target="_blank" 
     style="
       display: inline-block; 
       padding: 5px 2px; 
       background-color: #007BFF; 
       color: white; 
       text-decoration: none; 
       border-radius: 5px; 
       font-weight: bold; 
       transition: background-color 0.3s ease;
       box-shadow: 0 4px 6px rgba(0, 123, 255, 0.4);
     "
     onmouseover="this.style.backgroundColor='#0056b3'"
     onmouseout="this.style.backgroundColor='#007BFF'"
  >
    Ver Vídeo
  </a>
            <button onclick="navigator.clipboard.writeText('${rel.linkVideo}')" 
          style="
            margin-left: 10px; 
            padding: 10px 15px; 
            border: none; 
            background-color:rgb(26, 99, 43); 
            color: white; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(40, 167, 69, 0.4);
            transition: background-color 0.3s ease;
          "
          onmouseover="this.style.backgroundColor='#1e7e34'"
          onmouseout="this.style.backgroundColor='#28a745'"
  >
    📋 Copiar link
  </button>
</p>
<hr>

          <div style="margin-top: 10px;">
            <button onclick="atualizarStatus('${rel.id}', 'Aprovado')" class="btn-aprovar">Aprovar</button>
            <button onclick="atualizarStatus('${rel.id}', 'Reprovado')" class="btn-reprovar">Reprovar</button>
            <button onclick="atualizarStatus('${rel.id}', 'Pendente')" class="btn-pendente">Pendente</button>
            <button onclick='gerarPDF(${JSON.stringify(rel)})' class="btn-pdf">Gerar PDF</button>
          </div>
        `;

        // Expandir ao clicar no resumo
        resumo.style.cursor = "pointer";
        resumo.addEventListener("click", () => {
          detalhes.style.display = detalhes.style.display === "none" ? "block" : "none";
        });

        card.appendChild(resumo);
        card.appendChild(detalhes);
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Erro ao carregar relatórios:", error);
    });
}

// ================== ATUALIZAR STATUS ==================
function atualizarStatus(id, status) {
  const fiscal = localStorage.getItem("fiscalLogado") || localStorage.getItem("usuarioLogado") || "Desconhecido";

  const popup = document.createElement("div");
  popup.className = "popup-confirm";
  popup.innerHTML = `
    <div class="popup-box">
      <h3>Confirmar mudança para <strong style="color: blue;">${status.toUpperCase()}</strong>?</h3>
      ${status === "Reprovado" ? `<textarea id="popup-justificativa" placeholder="Justificativa..." style="width:100%; height:80px;"></textarea>` : ""}
      <button class="popup-confirmar">Sim</button>
      <button class="popup-cancelar">Não</button>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector(".popup-confirmar").addEventListener("click", () => {
    let justificativa = "";
    if (status === "Reprovado") {
      justificativa = document.getElementById("popup-justificativa").value.trim();
      if (!justificativa) {
        alert("Justificativa obrigatória.");
        return;
      }
    }

    fetch(googleScriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "atualizarStatus", id, status, fiscal, justificativa })
    })
      .then(() => {
        alert(`Relatório ${status} com sucesso!`);
        carregarRelatorios();
      })
      .catch(error => {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar status.");
      });

    document.body.removeChild(popup);
  });

  popup.querySelector(".popup-cancelar").addEventListener("click", () => {
    document.body.removeChild(popup);
  });
}

// ================== GERAR PDF ==================
function gerarPDF(relatorio) {
  const fiscal = localStorage.getItem("usuarioLogado") || "Fiscal não identificado";
  const dados = { ...relatorio, fiscal };
  const win = window.open("template-pdf.html", "_blank");

  const timer = setInterval(() => {
    if (win && win.document && win.document.readyState === "complete") {
      win.postMessage(dados, "*");
      clearInterval(timer);
    }
  }, 300);
}
