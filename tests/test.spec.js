const { test, expect } = require("@playwright/test");
const { cadastroItem } = require("../utils/cadastroItem");
const { login } = require("../utils/login");
const { logout } = require("../utils/logout");

test("Emissão de NF-e com item que possui Grade previamente cadastrado no estoque", async ({
  page,
}) => {
  await login(page);
  const nomeProduto = await cadastroItem(page);

  await page
    .locator("#z_app_header_wrapper")
    .getByText("Fiscal", { exact: true })
    .click();
  await page.getByRole("link", { name: "NF-e" }).click();
  await page.getByRole("link", { name: "Cadastrar NF-e" }).first().click();
  await page
    .getByRole("button", { name: "Destinatário" })
    .waitFor({ state: "visible", timeout: 15000 });

  // Natureza
  const botaoNatureza = page.getByRole("button", { name: /^Natureza/ });
  const textoNatureza = (await botaoNatureza.textContent())?.trim();

  if (!textoNatureza?.includes("Venda de mercadoria")) {
    let sucesso = false;
    for (let tentativa = 0; tentativa < 3 && !sucesso; tentativa++) {
      const expandido = await botaoNatureza.getAttribute("aria-expanded");
      if (expandido !== "true") {
        await botaoNatureza.click();
      }

      const campoBuscaNatureza = botaoNatureza.getByLabel("-searchbox");
      const campoVisivel = await campoBuscaNatureza
        .isVisible()
        .catch(() => false);

      if (campoVisivel) {
        await campoBuscaNatureza.fill("venda de mercadoria");
        await campoBuscaNatureza.press("ArrowDown");
        await campoBuscaNatureza.press("Enter");
        sucesso = true;
      } else {
        console.log(
          `Tentativa ${tentativa + 1}: campo de busca da Natureza não apareceu, tentando de novo...`,
        );
      }
    }
  }

  // Destinatário
  await page.getByRole("button", { name: "Destinatário" }).click();
  await page
    .getByLabel("Destinatário")
    .getByRole("textbox", { name: "-searchbox" })
    .fill("Zucchetti");
  await page.getByLabel("Destinatário").getByRole("option").first().click();

  // Itens
  await page.getByRole("button", { name: "Itens R$" }).click();
  await page
    .getByRole("button")
    .filter({ hasText: "Digite descrição, código, có" })
    .click();
  await page
    .getByLabel("Itens R$")
    .getByRole("textbox", { name: "-searchbox" })
    .fill(nomeProduto);
  await page.getByRole("option", { name: new RegExp(nomeProduto) }).click();
  await page
    .getByLabel("Itens R$")
    .getByRole("button")
    .filter({ hasText: /^$/ })
    .last()
    .click();

  // Captura a descrição exibida na tela
  const descricaoNaTela = await page
    .getByLabel("Itens R$")
    .locator("td", { hasText: nomeProduto })
    .first()
    .textContent();
  console.log(
    "Descrição na tela (capturada antes de transmitir):",
    descricaoNaTela?.trim(),
  );

  // Formas de pagamento
  await page
    .locator(".v-toast__text")
    .waitFor({ state: "hidden", timeout: 15000 })
    .catch(() => {});

  await page.getByRole("button", { name: "Formas de pagamento" }).click();
  await page.waitForTimeout(5000);

  // Transmitir
  await page.getByRole("button", { name: "Transmitir" }).click();
  await page
    .locator("#modal-wrapper")
    .getByRole("button", { name: "Transmitir" })
    .click();

  // Gerar e validar o XML — comportamento correto: a descrição da tela
  // deve bater exatamente com o xProd do XML
  await page.locator("#checkbox_table_0").check();

  const botaoAcoes = page.locator(
    'button:has-text("Ações"):not(.dropdown-mobile)',
  );
  await botaoAcoes.first().click();

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Gerar XML" }).click();
  const popup = await popupPromise;

  await popup.waitForLoadState();

  const conteudoXml = await popup.textContent("body").catch(() => null);

  if (conteudoXml) {
    const match = conteudoXml.match(/<xProd>(.*?)<\/xProd>/);
    const xProdNoXml = match ? match[1] : null;

    console.log("xProd encontrado no XML:", xProdNoXml);

    // Deve ser igual a descrição da tela e o xProd do XML
    expect(xProdNoXml?.trim()).toBe(descricaoNaTela?.trim());
  } else {
    console.log(
      "XML não veio como texto direto — pode ter disparado download dentro do popup.",
    );
  }

  await popup.close();

  await logout(page);
});

test("Emissão de NF-e com item de grade cadastrado diretamente na nota", async ({
  page,
}) => {
  await login(page);
  const nomeProduto = `Camisa Teste ${Date.now()}`;

  await page
    .locator("#z_app_header_wrapper")
    .getByText("Fiscal", { exact: true })
    .click();
  await page.getByRole("link", { name: "NF-e" }).click();
  await page.getByRole("link", { name: "Cadastrar NF-e" }).first().click();
  await page
    .getByRole("button", { name: "Destinatário" })
    .waitFor({ state: "visible", timeout: 15000 });

  // Natureza
  const botaoNatureza = page.getByRole("button", { name: /^Natureza/ });
  const textoNatureza = (await botaoNatureza.textContent())?.trim();

  // Em muitos casos a natureza não era selecionada automaticamente,
  // criada a tela de tentativas
  if (!textoNatureza?.includes("Venda de mercadoria")) {
    let sucesso = false;
    for (let tentativa = 0; tentativa < 3 && !sucesso; tentativa++) {
      const expandido = await botaoNatureza.getAttribute("aria-expanded");
      if (expandido !== "true") {
        await botaoNatureza.click();
      }

      const campoBuscaNatureza = botaoNatureza.getByLabel("-searchbox");
      const campoVisivel = await campoBuscaNatureza
        .isVisible()
        .catch(() => false);

      if (campoVisivel) {
        await campoBuscaNatureza.fill("venda de mercadoria");
        await campoBuscaNatureza.press("ArrowDown");
        await campoBuscaNatureza.press("Enter");
        sucesso = true;
      } else {
        console.log(
          `Tentativa ${tentativa + 1}: campo de busca da Natureza não apareceu, tentando de novo...`,
        );
      }
    }
  }

  // Destinatário
  await page.getByRole("button", { name: "Destinatário" }).click();
  await page
    .getByLabel("Destinatário")
    .getByRole("textbox", { name: "-searchbox" })
    .fill("Zucchetti");
  await page.getByLabel("Destinatário").getByRole("option").first().click();

  // Abre o painel de Itens e confirma que expandiu
  await page.getByRole("button", { name: "Itens R$" }).click();
  const itensExpandido = await page
    .getByRole("button", { name: "Itens R$" })
    .getAttribute("aria-expanded");
  if (itensExpandido !== "true") {
    await page.getByRole("button", { name: "Itens R$" }).click();
  }

  await page
    .locator("text=Item*")
    .locator("..")
    .getByRole("button")
    .first()
    .click();

  await page.getByRole("button", { name: "Produtos" }).click();

  await page.getByRole("textbox", { name: "Descrição*" }).fill(nomeProduto);
  await page.locator('[id="product.hasVariations"]').check();

  // Grade
  await page.getByRole("tab", { name: "Grade" }).click();
  await page
    .getByRole("tabpanel", { name: "Grade" })
    .getByLabel("Quantidade")
    .fill("1");
  await page.getByRole("textbox", { name: "Preço", exact: true }).fill("10");

  await page
    .getByRole("button")
    .filter({ hasText: "PretoNenhuma opção" })
    .click();
  await page.locator('[id="variation.color"]').press("ArrowUp");
  await page.locator('[id="variation.color"]').press("Enter");

  await page.getByRole("button").filter({ hasText: "PNenhuma opção" }).click();
  await page.locator('[id="variation.size"]').press("ArrowUp");
  await page.locator('[id="variation.size"]').press("Enter");

  await page.getByRole("button", { name: "Cadastrar grade" }).click();

  // Dados fiscais
  await page.getByRole("tab", { name: "Fiscal" }).click();

  await page.getByRole("button", { name: "Selecione a origem" }).click();
  await page.getByRole("textbox", { name: "fiscal.produto.origem-" }).fill("0");
  await page
    .getByRole("textbox", { name: "fiscal.produto.origem-" })
    .press("ArrowDown");
  await page
    .getByRole("textbox", { name: "fiscal.produto.origem-" })
    .press("Enter");

  await page.getByRole("button", { name: "Selecione um CST" }).first().click();
  await page
    .getByRole("textbox", { name: "fiscal.produto.CST-searchbox" })
    .fill("00");
  await page
    .getByRole("textbox", { name: "fiscal.produto.CST-searchbox" })
    .press("ArrowDown");
  await page
    .getByRole("textbox", { name: "fiscal.produto.CST-searchbox" })
    .press("Enter");

  await page.getByRole("button", { name: "Selecione um CST" }).click();
  await page
    .getByRole("textbox", {
      name: "fiscal.produto.CSTNaoContribuinte-searchbox",
    })
    .fill("00");
  await page
    .getByRole("textbox", {
      name: "fiscal.produto.CSTNaoContribuinte-searchbox",
    })
    .press("ArrowDown");
  await page
    .getByRole("textbox", {
      name: "fiscal.produto.CSTNaoContribuinte-searchbox",
    })
    .press("Enter");

  await page.getByRole("button", { name: "Selecione um NCM" }).click();
  await page
    .getByRole("textbox", { name: "fiscal.produto.NCM-searchbox" })
    .fill("00000000");
  await page.getByRole("option").filter({ hasText: "00000000" }).click();

  // Reforma tributária
  await page.getByRole("tab", { name: "Reforma tributária" }).click();
  await page.locator("#classTribIBSCBS").fill("000001");
  await page.locator("#classTribIBSCBS").press("ArrowDown");
  await page.locator("#classTribIBSCBS").press("Enter");

  await page
    .locator("#modal-wrapper")
    .getByRole("button", { name: "Salvar" })
    .click();

  await page.getByRole("textbox", { name: "Valor unitário R$" }).fill("10");

  await page
    .getByLabel("Itens R$")
    .getByRole("button")
    .filter({ hasText: /^$/ })
    .last()
    .click();

  // Captura a descrição exibida na tela
  const descricaoNaTela = await page
    .getByLabel("Itens R$")
    .locator("td", { hasText: nomeProduto })
    .first()
    .textContent();
  console.log(
    "Descrição na tela (capturada antes de transmitir):",
    descricaoNaTela?.trim(),
  );

  // Formas de pagamento
  await page
    .locator(".v-toast__text")
    .waitFor({ state: "hidden", timeout: 15000 })
    .catch(() => {});

  await page.getByRole("button", { name: "Formas de pagamento" }).click();
  await page.waitForTimeout(5000);

  // Transmitir
  await page.getByRole("button", { name: "Transmitir" }).click();
  await page
    .locator("#modal-wrapper")
    .getByRole("button", { name: "Transmitir" })
    .click();

  // Gerar e validar o XML — comportamento correto seria a descrição da tela
  //  bater com o xProd do XML. Atualmente NÃO bate (bug conhecido — ver Teste 6).
  // Este teste deve falhar até a correção.
  await page.locator("#checkbox_table_0").check();

  const botaoAcoes = page.locator(
    'button:has-text("Ações"):not(.dropdown-mobile)',
  );
  await botaoAcoes.first().click();

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Gerar XML" }).click();
  const popup = await popupPromise;

  await popup.waitForLoadState();

  const conteudoXml = await popup.textContent("body").catch(() => null);

  if (conteudoXml) {
    const match = conteudoXml.match(/<xProd>(.*?)<\/xProd>/);
    const xProdNoXml = match ? match[1] : null;

    console.log("xProd encontrado no XML:", xProdNoXml);

    // A descrição da tela deve ser igual ao xProd do XML.
    // Enquanto o bug existir, esse expect falha — corretamente.
    expect(xProdNoXml?.trim()).toBe(descricaoNaTela?.trim());
  } else {
    console.log(
      "XML não veio como texto direto — pode ter disparado download dentro do popup.",
    );
  }

  await popup.close();

  await logout(page);
});
