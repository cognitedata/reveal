import { getFDMVersion, getUrl } from '../../utils';

const SPACE = 'cypress-test-space';

describe('Data Model Page - Toggle Schema Visualizer', () => {
  const createNewDataModel = (dataModelName: string) => {
    cy.visit(getUrl(''));

    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type(dataModelName);

    // if V3, select space
    if (getFDMVersion() === 'V3') {
      cy.selectSpace(SPACE);
    }

    cy.get('.cogs-modal-footer-buttons > .cogs-button--type-primary')
      .should('be.visible')
      .click();

    cy.getCogsToast('success').contains('Data Model successfully created');
  };

  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest/data'));
  });

  it('should test toggling schema visualizer due to excess types', () => {
    cy.getBySel('edit-schema-btn').should('be.visible').click();

    if (getFDMVersion() === 'V2') {
      cy.get('[aria-label="Code editor"]').click();
    }

    let gqlSchema = ``;

    for (let i = 1; i < 32; i++) {
      gqlSchema += `type Type${i} { field${i}: String }\n`;
    }

    cy.get('.monaco-editor textarea:first')
      .should('be.visible')
      .type(gqlSchema, {
        delay: 0,
        parseSpecialCharSequences: false,
      });

    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.visit(getUrl('/blog/blog/latest/data'));
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('not.exist');

    const newModelName = 'cypress_test';
    createNewDataModel(newModelName);

    if (getFDMVersion() === 'V2') {
      cy.get('[aria-label="Code editor"]').click();
    }

    cy.get('.monaco-editor textarea:first')
      .should('be.visible')
      .type(gqlSchema, {
        delay: 0,
        parseSpecialCharSequences: false,
      });

    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.visit(getUrl(`/${SPACE}/${newModelName}/latest/data`));
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');

    cy.visit(getUrl('/blog/blog/latest/data'));
    cy.getBySel('schema-visualizer-err-ctr').should('not.exist');
  });
});
