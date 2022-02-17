/// <reference types="cypress" />

import { And, Given } from 'cypress-cucumber-preprocessor/steps';

Given(`I open the Charts page`, () => {
  cy.viewport('macbook-13');
  cy.visit('https://charts.cogniteapp.com');
});

And(`I perform login`, () => {
  cy.wait(10000);
});

And(`I create an empty chart`, () => {
  cy.get('a').click();
});
