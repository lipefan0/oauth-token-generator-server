// src/services/customers.service.js
import ExcelJS from "exceljs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createCustomer(customerData, token) {
  try {
    const payload = {
      nome: customerData.nome,
      tipo: customerData.tipo, // F ou J
      numeroDocumento: customerData.numeroDocumento,
      situacao: "A", // Ativo por padrão
      email: customerData.email,
      telefone: customerData.telefone,
      celular: customerData.celular,
      endereco: {
        geral: {
          endereco: customerData.endereco,
          numero: customerData.numero,
          complemento: customerData.complemento,
          bairro: customerData.bairro,
          cep: customerData.cep,
          municipio: customerData.municipio,
          uf: customerData.uf,
        },
      },
    };

    // Campos opcionais
    if (customerData.codigo) payload.codigo = customerData.codigo;
    if (customerData.fantasia) payload.fantasia = customerData.fantasia;
    if (customerData.ie) {
      payload.indicadorIe = 1; // Contribuinte ICMS
      payload.ie = customerData.ie;
    }
    if (customerData.rg) payload.rg = customerData.rg;
    if (customerData.orgaoEmissor)
      payload.orgaoEmissor = customerData.orgaoEmissor;

    // Dados adicionais
    if (
      customerData.dataNascimento ||
      customerData.sexo ||
      customerData.naturalidade
    ) {
      payload.dadosAdicionais = {};
      if (customerData.dataNascimento)
        payload.dadosAdicionais.dataNascimento = customerData.dataNascimento;
      if (customerData.sexo) payload.dadosAdicionais.sexo = customerData.sexo;
      if (customerData.naturalidade)
        payload.dadosAdicionais.naturalidade = customerData.naturalidade;
    }

    // Endereço de cobrança (se diferente do geral)
    if (customerData.enderecoCobranca) {
      payload.endereco.cobranca = customerData.enderecoCobranca;
    } else {
      payload.endereco.cobranca = { ...payload.endereco.geral };
    }

    // Dados financeiros
    if (
      customerData.limiteCredito ||
      customerData.condicaoPagamento ||
      customerData.categoriaId
    ) {
      payload.financeiro = {};
      if (customerData.limiteCredito)
        payload.financeiro.limiteCredito = Number(customerData.limiteCredito);
      if (customerData.condicaoPagamento)
        payload.financeiro.condicaoPagamento = customerData.condicaoPagamento;
      if (customerData.categoriaId) {
        payload.financeiro.categoria = {
          id: Number(customerData.categoriaId),
        };
      }
    }

    // Vendedor
    if (customerData.vendedorId) {
      payload.vendedor = {
        id: Number(customerData.vendedorId),
      };
    }

    // País
    if (customerData.pais) {
      payload.pais = {
        nome: customerData.pais,
      };
    }

    const response = await fetch("https://www.bling.com.br/Api/v3/contatos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function processExcelCustomers(buffer, token) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet("Dados");

  if (worksheet.rowCount <= 1) {
    return {
      message: "Planilha vazia",
      error:
        "A planilha não contém contatos para importar. Por favor, utilize o template fornecido.",
    };
  }

  const results = {
    message: "Processamento concluído",
    total: 0,
    success: 0,
    errors: [],
    processedItems: [],
  };

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    // Verificar se a linha tem dados
    const nome = row.getCell(1).value;
    const tipo = row.getCell(2).value;
    const numeroDocumento = row.getCell(3).value;

    // Pular linhas vazias
    if (!nome && !tipo && !numeroDocumento) {
      continue;
    }

    results.total++;

    try {
      const customer = {
        nome: nome,
        tipo: tipo === "Física" ? "F" : "J",
        numeroDocumento: numeroDocumento?.toString().replace(/\D/g, ""),
        codigo: row.getCell(4).value?.toString(),
        ie: row.getCell(5).value?.toString(),
        rg: row.getCell(6).value?.toString(),
        orgaoEmissor: row.getCell(7).value?.toString(),
        email: row.getCell(8).value,
        telefone: row.getCell(9).value?.toString(),
        celular: row.getCell(10).value?.toString(),
        fantasia: row.getCell(11).value,
        endereco: row.getCell(12).value,
        numero: row.getCell(13).value?.toString(),
        complemento: row.getCell(14).value,
        bairro: row.getCell(15).value,
        cep: row.getCell(16).value?.toString().replace(/\D/g, ""),
        municipio: row.getCell(17).value,
        uf: row.getCell(18).value,
        dataNascimento:
          row.getCell(19).value instanceof Date
            ? row.getCell(19).value.toISOString().split("T")[0]
            : row.getCell(19).value,
        sexo: row.getCell(20).value,
        naturalidade: row.getCell(21).value,
        limiteCredito: row.getCell(22).value
          ? Number(row.getCell(22).value)
          : undefined,
        condicaoPagamento: row.getCell(23).value?.toString(),
        categoriaId: row.getCell(24).value
          ? Number(row.getCell(24).value)
          : undefined,
        vendedorId: row.getCell(25).value
          ? Number(row.getCell(25).value)
          : undefined,
        pais: row.getCell(26).value,
      };

      // Validação dos campos obrigatórios
      const camposFaltantes = [];
      if (!customer.nome) camposFaltantes.push("Nome");
      if (!customer.tipo) camposFaltantes.push("Tipo de Pessoa");
      if (!customer.numeroDocumento) camposFaltantes.push("CPF/CNPJ");
      if (!customer.email) camposFaltantes.push("Email");
      if (!customer.endereco) camposFaltantes.push("Endereço");
      if (!customer.numero) camposFaltantes.push("Número");
      if (!customer.bairro) camposFaltantes.push("Bairro");
      if (!customer.cep) camposFaltantes.push("CEP");
      if (!customer.municipio) camposFaltantes.push("Município");
      if (!customer.uf) camposFaltantes.push("UF");

      if (camposFaltantes.length > 0) {
        throw new Error(
          `Campos obrigatórios ausentes: ${camposFaltantes.join(", ")}`
        );
      }

      // Validações específicas
      if (!["F", "J"].includes(customer.tipo)) {
        throw new Error('Tipo de pessoa inválido. Use "Física" ou "Jurídica"');
      }

      if (
        (customer.tipo === "F" && customer.numeroDocumento.length !== 11) ||
        (customer.tipo === "J" && customer.numeroDocumento.length !== 14)
      ) {
        throw new Error("CPF/CNPJ com formato inválido");
      }

      // Aguardar 500ms antes de cada requisição
      await delay(500);

      const response = await createCustomer(customer, token);
      results.success++;
      results.processedItems.push({
        index: rowNumber - 1,
        status: "success",
        contato: response,
      });
    } catch (error) {
      results.errors.push({
        index: rowNumber - 1,
        row: rowNumber,
        error: error.message,
      });
      results.processedItems.push({
        index: rowNumber - 1,
        status: "error",
        error: error.message,
      });
    }
  }

  return results;
}

export async function getExcelTemplate() {
  const workbook = new ExcelJS.Workbook();

  // Planilha principal de Contatos
  const worksheetPrincipal = workbook.addWorksheet("Dados");

  // Configurar colunas
  worksheetPrincipal.columns = [
    { header: "Nome*", key: "nome", width: 30 },
    { header: "Tipo de Pessoa*", key: "tipo", width: 15 },
    { header: "CPF/CNPJ*", key: "numeroDocumento", width: 20 },
    { header: "Código", key: "codigo", width: 15 },
    { header: "Inscrição Estadual", key: "ie", width: 20 },
    { header: "RG", key: "rg", width: 15 },
    { header: "Órgão Emissor", key: "orgaoEmissor", width: 15 },
    { header: "Email*", key: "email", width: 30 },
    { header: "Telefone", key: "telefone", width: 15 },
    { header: "Celular", key: "celular", width: 15 },
    { header: "Nome Fantasia", key: "fantasia", width: 30 },
    { header: "Endereço*", key: "endereco", width: 30 },
    { header: "Número*", key: "numero", width: 10 },
    { header: "Complemento", key: "complemento", width: 20 },
    { header: "Bairro*", key: "bairro", width: 20 },
    { header: "CEP*", key: "cep", width: 10 },
    { header: "Município*", key: "municipio", width: 25 },
    { header: "UF*", key: "uf", width: 5 },
    { header: "Data Nascimento", key: "dataNascimento", width: 15 },
    { header: "Sexo", key: "sexo", width: 5 },
    { header: "Naturalidade", key: "naturalidade", width: 20 },
    { header: "Limite Crédito", key: "limiteCredito", width: 15 },
    { header: "Condição Pagamento", key: "condicaoPagamento", width: 20 },
    { header: "ID Categoria", key: "categoriaId", width: 15 },
    { header: "ID Vendedor", key: "vendedorId", width: 15 },
    { header: "País", key: "pais", width: 20 },
  ];

  // Exemplo de contato
  worksheetPrincipal.addRow({
    nome: "João da Silva",
    tipo: "Física",
    numeroDocumento: "12345678900",
    codigo: "CLI001",
    ie: "123456789",
    rg: "1234567",
    orgaoEmissor: "SSP",
    email: "joao@email.com",
    telefone: "(11) 3333-4444",
    celular: "(11) 99999-8888",
    fantasia: "João Comércio",
    endereco: "Rua Exemplo",
    numero: "123",
    complemento: "Sala 45",
    bairro: "Centro",
    cep: "01234567",
    municipio: "São Paulo",
    uf: "SP",
    dataNascimento: "1990-01-01",
    sexo: "M",
    naturalidade: "Brasileira",
    limiteCredito: 1000,
    condicaoPagamento: "30",
    categoriaId: "12345",
    vendedorId: "67890",
    pais: "BRASIL",
  });

  // Planilha de Referências
  const worksheetRef = workbook.addWorksheet("Referências");
  worksheetRef.columns = [
    { header: "Tipos de Pessoa", key: "tiposPessoa", width: 15 },
    { header: "UFs", key: "ufs", width: 5 },
    { header: "Sexo", key: "sexo", width: 10 },
  ];

  // Dados de referência
  const tiposPessoa = ["Física", "Jurídica"];
  const ufs = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];
  const sexos = ["M", "F"];

  // Adicionar dados de referência
  tiposPessoa.forEach((tipo, index) => {
    worksheetRef.getCell(index + 2, 1).value = tipo;
  });

  ufs.forEach((uf, index) => {
    worksheetRef.getCell(index + 2, 2).value = uf;
  });

  sexos.forEach((sexo, index) => {
    worksheetRef.getCell(index + 2, 3).value = sexo;
  });

  // Estilizar todas as planilhas
  [worksheetPrincipal, worksheetRef].forEach((worksheet) => {
    // Estilo do cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Ajustar largura automática
    worksheet.columns.forEach((column) => {
      column.width = Math.max(column.width || 10, 15);
    });
  });

  // Adicionar instruções
  worksheetPrincipal.addRow([]);
  worksheetPrincipal.addRow(["* Campos obrigatórios"]);
  worksheetPrincipal.addRow(["Observações importantes:"]);
  worksheetPrincipal.addRow([
    "- Data de Nascimento deve estar no formato AAAA-MM-DD",
  ]);
  worksheetPrincipal.addRow(["- Sexo deve ser M ou F"]);
  worksheetPrincipal.addRow(["- CPF deve ter 11 dígitos para Pessoa Física"]);
  worksheetPrincipal.addRow([
    "- CNPJ deve ter 14 dígitos para Pessoa Jurídica",
  ]);
  worksheetPrincipal.addRow([
    "- Telefones devem incluir DDD Ex: 11",
  ]);
  worksheetPrincipal.addRow(["- CEP deve ser informado sem hífen"]);
  worksheetPrincipal.addRow([
    '- Consulte a aba "Referências" para valores permitidos',
  ]);

  // Formatação das instruções
  for (
    let i = worksheetPrincipal.rowCount - 9;
    i <= worksheetPrincipal.rowCount;
    i++
  ) {
    worksheetPrincipal.getRow(i).font = {
      italic: true,
      color: { argb: "FF808080" },
    };
  }

  // Adicionar validações nos campos principais
  // Tipo de Pessoa
  worksheetPrincipal
    .getColumn("B")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: ['"Fisica, Juridica"'],
        };
      }
    });

  // UF
  worksheetPrincipal
    .getColumn("R")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [
            '"AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO"',
          ],
        };
      }
    });

  // Sexo
  worksheetPrincipal
    .getColumn("T")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: ['"M,F"'],
        };
      }
    });

  // Data de Nascimento
  worksheetPrincipal
    .getColumn("S")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "date",
          allowBlank: true,
          showErrorMessage: true,
          errorStyle: "error",
          errorTitle: "Data inválida",
          error: "Por favor, insira uma data válida no formato AAAA-MM-DD",
        };
      }
    });

  // Limite de Crédito
  worksheetPrincipal
    .getColumn("V")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "decimal",
          allowBlank: true,
          showErrorMessage: true,
          errorStyle: "error",
          errorTitle: "Valor inválido",
          error: "Por favor, insira um valor numérico válido",
          formulae: [0], // Valor mínimo
        };
      }
    });

  return await workbook.xlsx.writeBuffer();
}
