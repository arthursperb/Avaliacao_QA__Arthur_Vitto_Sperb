const { test, expect } = require("@playwright/test");
const { login } = require("../utils/login");

test("Abrir o sistema", async ({ page }) => {
  await login(page);
  // ...
});
