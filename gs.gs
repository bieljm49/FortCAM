
function doPost(e) {
  const dados = JSON.parse(e.postData.contents);

  // AÇÃO DE LOGIN
  if (dados.acao === "login") {
    const usuariosSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
    const usuarios = usuariosSheet.getDataRange().getValues();

    const nome = dados.usuario;
    const senha = dados.senha;
    const tipo = dados.tipo;

    for (let i = 1; i < usuarios.length; i++) {
      if (
        usuarios[i][0] === nome &&
        usuarios[i][1] === senha &&
        usuarios[i][2] === tipo
      ) {
        return ContentService.createTextOutput(JSON.stringify({
          sucesso: true,
          nome: nome,
          tipo: tipo
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ sucesso: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }


  // INSERIR NOVO RELATÓRIO
  if (dados.acao === "novoRelatorio") {
    const r = dados.dados;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Relatorios");
    sheet.appendRow([
      new Date().getTime(),         // ID (coluna A)
      r.analista,                   // B
      r.dataEvento,                 // C
      r.local,                      // D
      r.descricao,                  // E
      r.observacao,                 // F
      r.criticidade,                // G
      r.linkVideo,                  // H
      r.status,                     // I
      "",                           // J - fiscal (será preenchido na aprovação)
      "",                           // K - justificativa
      new Date().toLocaleString()   // L - data de atualização
    ]);
    return ContentService.createTextOutput("OK");
  }

  // ATUALIZAR STATUS
  if (dados.acao === "atualizarStatus") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Relatorios");
    const range = sheet.getDataRange().getValues();

    for (let i = 1; i < range.length; i++) {
      if (String(range[i][0]) === String(dados.id)) {
        sheet.getRange(i + 1, 9).setValue(dados.status);            // Coluna I
        sheet.getRange(i + 1, 10).setValue(dados.fiscal);           // Coluna J
        sheet.getRange(i + 1, 11).setValue(dados.justificativa || ""); // Coluna K
        sheet.getRange(i + 1, 12).setValue(new Date().toLocaleString()); // Coluna L
        return ContentService.createTextOutput("Status atualizado.");
      }
    }

    return ContentService.createTextOutput("ID não encontrado.");
  }
}


function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Relatorios");
  const dados = sheet.getDataRange().getValues();
  const json = [];

  for (let i = 1; i < dados.length; i++) {
    json.push({
      id: dados[i][0],
      analista: dados[i][1],
      dataEvento: dados[i][2],
      local: dados[i][3],
      descricao: dados[i][4],
      observacao: dados[i][5],
      criticidade: dados[i][6],
      linkVideo: dados[i][7],
      status: dados[i][8],
      fiscal: dados[i][9],
      justificativa: dados[i][10]
    });
  }

  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}
