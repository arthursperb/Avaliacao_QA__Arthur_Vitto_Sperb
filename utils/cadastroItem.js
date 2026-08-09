const { login } = require("./login");

async function cadastroItem(page) {
  const nomeProduto = `Camisa Teste ${Date.now()}`;
  await page.locator("#z_app_header_wrapper").getByText("Cadastros").click();
  await page.locator("#z_app_header_wrapper").getByText("Estoque").click();
  await page.getByRole("link", { name: "Produtos" }).click();
  const botaoCadastrar = page
    .getByRole("link", { name: "Cadastrar produto" })
    .first();
  await botaoCadastrar.scrollIntoViewIfNeeded();
  await botaoCadastrar.click();
  await page.getByRole("textbox", { name: "Descrição*" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Descrição*" }).fill(nomeProduto);
  await page.getByRole("textbox", { name: "Descrição*" }).press("Enter");
  await page.locator('[id="product.hasVariations"]').check();
  await page.getByRole("button", { name: "Dados fiscais" }).click();
  await page.getByRole("button", { name: "Selecione a origem" }).click();
  await page
    .getByRole("textbox", { name: "fiscal.produto.origem-" })
    .press("ArrowDown");
  await page
    .getByRole("textbox", { name: "fiscal.produto.origem-" })
    .press("Enter");
  await page
    .getByRole("textbox", { name: "fiscal.produto.CST-searchbox" })
    .press("ArrowUp");
  await page
    .getByRole("textbox", { name: "fiscal.produto.CST-searchbox" })
    .press("Enter");
  await page
    .getByRole("textbox", {
      name: "fiscal.produto.CSTNaoContribuinte-searchbox",
    })
    .press("ArrowUp");
  await page
    .getByRole("textbox", {
      name: "fiscal.produto.CSTNaoContribuinte-searchbox",
    })
    .press("Enter");
  await page.getByRole("button", { name: "Selecione um NCM" }).click();
  await page
    .getByRole("textbox", { name: "fiscal.produto.NCM-searchbox" })
    .fill("00000000");
  await page
    .getByRole("textbox", { name: "fiscal.produto.NCM-searchbox" })
    .press("Enter");
  await page
    .getByRole("textbox", { name: "fiscal.produto.NCM-searchbox" })
    .press("ArrowDown");
  await page
    .getByRole("textbox", { name: "fiscal.produto.NCM-searchbox" })
    .press("Enter");
  await page.getByRole("button", { name: "Reforma tributária" }).click();
  await page.locator("#classTribIBSCBS").waitFor({ state: "visible" });
  await page.locator("#classTribIBSCBS").click();
  await page.locator("#classTribIBSCBS").press("ArrowDown");
  await page.locator("#classTribIBSCBS").press("Enter");
  await page.getByRole("button", { name: "Grade" }).click();
  await page.getByRole("textbox", { name: "Quantidade" }).click();
  await page.getByRole("textbox", { name: "Quantidade" }).fill("1");
  await page.getByRole("textbox", { name: "Preço", exact: true }).click();
  await page.getByRole("textbox", { name: "Preço", exact: true }).fill("0,123");
  await page
    .getByRole("button")
    .filter({ hasText: "VerdePretoAZUL-CLAROAzul" })
    .click();
  await page.locator('[id="variation.color"]').press("ArrowDown");
  await page.locator('[id="variation.color"]').press("ArrowDown");
  await page.locator('[id="variation.color"]').fill("VERDE");
  await page.locator('[id="variation.color"]').press("Enter");
  await page.locator('[id="variation.size"]').press("ArrowDown");
  await page.locator('[id="variation.size"]').press("Enter");
  await page
    .locator("#z_app_content_container")
    .getByRole("button", { name: "Salvar" })
    .click();

  return nomeProduto;
}

module.exports = { cadastroItem };
