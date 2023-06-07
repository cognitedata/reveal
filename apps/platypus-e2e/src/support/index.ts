// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './code-editor';
import './data-model-page';
import './data-model-list';
import './general';
import './query-explorer';
import './ui-editor';
import './data-model-visualizer';
import '@cypress/code-coverage/support';

// https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (err.message.startsWith('ResizeObserver loop limit exceeded')) {
    return false;
  }
});
