// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    setImportMapOverrides(modules: { module: string; domain: string }[]): void;
  }
}

Cypress.Commands.add('setImportMapOverrides', (modules) => {
  modules.forEach((module) => {
    const key = `import-map-override:${module.module}`;
    window.localStorage.setItem(key, module.domain);
  });
});
