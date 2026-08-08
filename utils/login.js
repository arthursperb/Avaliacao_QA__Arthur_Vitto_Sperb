require("dotenv").config();

async function login(page) {
  await page.goto("https://eweb-1383.staging.zweb.com.br/#/sign-in");
  await page
    .getByRole("textbox", { name: "E-mail" })
    .fill(process.env.QA_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.QA_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/dashboard");
}

module.exports = { login };
