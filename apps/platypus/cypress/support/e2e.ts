// ***********************************************************
// This example support/e2e.ts is processed and
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

// Import commands.ts using ES2015 syntax:

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
// This works perfectly fine, there is some eslint rule that complains that should return a value
// @ts-ignore
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (err.message.startsWith('ResizeObserver loop limit exceeded')) {
    return false;
  }
});

// This works perfectly fine, there is some eslint rule that complains that should return a value
// @ts-ignore
Cypress.on('uncaught:exception', (err, runnable, promise) => {
  // when the exception originated from an unhandled promise
  // rejection, the promise is provided as a third argument
  // you can turn off failing the test in this case
  if (promise) {
    return false;
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
});
