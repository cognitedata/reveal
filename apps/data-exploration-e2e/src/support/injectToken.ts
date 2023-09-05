Cypress.on('window:before:load', async (win) => {
  win.localStorage.setItem('CY_TOKEN', Cypress.env('ACCESS_TOKEN'));
});
