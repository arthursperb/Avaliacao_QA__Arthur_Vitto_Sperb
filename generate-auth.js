const { chromium } = require('@playwright/test');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://eweb-1383.staging.zweb.com.br/#/sign-in');
  await page.getByRole('textbox', { name: 'E-mail' }).fill(process.env.QA_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.QA_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/dashboard');
  
  await page.context().storageState({ path: 'auth.json' });
  console.log('auth.json criado com sucesso!');
  
  await browser.close();
})();
