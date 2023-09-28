import { getUrl } from '../utils/getUrl';

describe('Home page', () => {
  beforeEach(() => {
    console.log(getUrl());
    cy.visit(getUrl());
    cy.ensurePageFinishedLoading();
  });

  it('Renders all elements', () => {
    cy.getBySel('create-model-button').should('exist');
  });
});
