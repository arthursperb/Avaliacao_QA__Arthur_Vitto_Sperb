const { test, expect } = require("@playwright/test");
const { cadastroItem } = require("../utils/cadastroItem");
const { login } = require("../utils/login");

test("Emissão de NF-e com item que possui Grade", async ({ page }) => {
  await login(page);
  const nomeProduto = await cadastroItem(page);
  console.log("Produto cadastrado:", nomeProduto);
});
