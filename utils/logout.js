async function logout(page) {
  await page
    .locator(".v-toast__text")
    .waitFor({ state: "hidden", timeout: 15000 })
    .catch(() => {});
  await page.locator("#z_header_user_menu_toggle i").click();
  await page.locator("#logout-action").click();
}

module.exports = { logout };
