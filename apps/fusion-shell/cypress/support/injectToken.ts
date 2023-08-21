Cypress.on('window:before:load', async (win) => {
  // @ts-ignore
  win.testAuthOverrides = {
    getToken: () => {
      return Cypress.env('ACCESS_TOKEN');
    },
  };
});
