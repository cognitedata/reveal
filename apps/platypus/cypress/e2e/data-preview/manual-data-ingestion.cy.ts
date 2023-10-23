/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getUrl } from '../../utils/url';

describe('Platypus Data Preview Page - Manual Data Ingestion', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    window.localStorage.setItem(
      '@cognite.fusion.data-modeling.platypus.DEVX_MANUAL_POPULATION',
      'true'
    );
    // window.localStorage.setItem(
    //   '@cognite.fusion.data-modeling.platypus.DEVX_MATCHMAKER_SUGGESTIONS_UI',
    //   'true'
    // );
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest/data-management/preview'));
    cy.ensurePageFinishedLoading();
  });

  it('should create draft row in table and publish it', () => {
    cy.get('[data-testid="UserType"]').click();
    cy.get('[data-testid="UserType"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .click()
      .type('{enter}TestName{enter}');

    cy.getBySel('handle-add-row-button').first().click();
    cy.getBySel('toast-body')
      .should('be.visible')
      .and('contain', 'Instance added');
    cy.reload();
    cy.ensurePageFinishedLoading();
    cy.get('[data-testid="UserType"]').click();
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible');
    cy.getBySel('draft-row').should('not.exist');
  });

  it('should update already published row', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.intercept('POST', 'api/v1/projects/platypus/models/instances').as(
      'ingestInstance'
    );
    cy.intercept('POST', 'api/v1/projects/platypus/models/instances/delete', {
      statusCode: 200,
    }).as('deleteInstance');

    cy.get('div[role="gridcell"][col-id="title"]')
      .should('be.visible')
      .should('contain', 'Lorem Ipsum');
    cy.get('div[role="gridcell"][col-id="title"]').first().click();
    cy.get('div[role="gridcell"][col-id="title"]')
      .first()
      .type('{enter}Not John Doe{enter}');

    cy.wait('@ingestInstance').then((interception) => {
      expect(interception!.response!.statusCode).to.equal(201);
      // expect(interception!.response!.body.items[0].title).to.include(
      //   'Not John Doe'
      // );
    });
    cy.wait('@deleteInstance').then((interception) => {
      expect(interception!.response!.statusCode).to.equal(200);
    });
  });

  // // skipping as this is low priority
  // it.skip('should update, remove, and then insert direct relationships', () => {
  //   cy.get('[data-testid="Post"]').click();
  //   cy.get('[data-testid="Post"]').should('have.class', 'active');
  //   cy.getBySel('data-preview-table').should('be.visible');
  //   cy.intercept('POST', 'api/v1/projects/platypus/datamodelstorage/nodes').as(
  //     'ingestNodes'
  //   );

  //   // first make sure table is rendered fully (all 3 rows)
  //   cy.get('div[role="gridcell"][col-id="user"]')
  //     .should('contain', '123')
  //     .should('contain', '456');

  //   cy.get('div[role="gridcell"][col-id="user"]')
  //     .first()
  //     .dblclick()
  //     .should('have.class', 'ag-cell-inline-editing')
  //     .type('321{enter}');

  //   cy.wait('@ingestNodes').then((interception) => {
  //     expect(interception!.response!.statusCode).to.equal(201);
  //     expect(interception!.response!.body.items[0].user[1]).to.equal('321');
  //   });

  //   cy.get('div[role="gridcell"][col-id="user"]')
  //     .should('be.visible')
  //     .should('contain', '321')
  //     .first()
  //     .focus()
  //     .dblclick()
  //     .type('{backspace}{enter}');

  //   cy.wait('@ingestNodes').then((interception) => {
  //     expect(interception!.response!.statusCode).to.equal(201);
  //     expect(interception!.response!.body.items[0].user).to.equal(null);
  //   });

  //   cy.get('div[role="gridcell"][col-id="user"]')
  //     .should('be.visible')
  //     .should('contain', '')
  //     .first()
  //     .focus()
  //     .dblclick()
  //     .type('123{enter}');

  //   cy.wait('@ingestNodes').then((interception) => {
  //     expect(interception!.response!.statusCode).to.equal(201);
  //     expect(interception!.response!.body.items[0].user[1]).to.equal('123');
  //   });
  // });

  it('should handle row revert on server update error', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.intercept('POST', 'api/v1/projects/platypus/models/instances', (req) => {
      req.destroy();
    });
    cy.get('div[role="gridcell"][col-id="title"]')
      .should('be.visible')
      .should('contain', 'Lorem Ipsum');
    cy.get('div[role="gridcell"][col-id="title"]').first().focus();
    cy.get('div[role="gridcell"][col-id="title"]')
      .first()
      .click({ force: true });
    cy.get('div[role="gridcell"][col-id="title"]')
      .first()
      .type('{enter} Not John Doe{enter}');

    cy.get('div[role="gridcell"][col-id="title"]')
      .first()
      .should('be.visible')
      .contains('Lorem Ipsum');
  });

  // will fix it later
  it.skip('should delete published rows', () => {
    cy.get('[data-testid="Comment"]').click();
    cy.get('[data-testid="Comment"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    cy.intercept('POST', 'api/v1/projects/platypus/models/instances/delete', {
      statusCode: 200,
      body: {
        items: [
          {
            instanceType: 'node',
            externalId: '987',
            space: 'blog',
          },
        ],
      },
    }).as('deleteInstance');

    // Wait for *all* row to be rendered
    cy.get('div[role="gridcell"][col-id="body"]')
      .should('be.visible')
      .should('contain', 'Consectetur adipiscing elit')
      .should('contain', 'Random comment 996')
      .should('contain', 'Random comment 997');

    cy.get('div[role="gridcell"][col-id="_isDraftSelected"]')
      .first()
      .should('be.visible')
      .click();

    cy.getBySel('btn-pagetoolbar-delete').click();
    cy.getBySel('data-row-confirm-deletion-checkbox').click();
    cy.get(
      '.cogs-modal-footer-buttons > .cogs-button--type-destructive'
    ).click();

    cy.wait('@deleteInstance').then((interception) => {
      expect(interception!.response!.statusCode).to.equal(200);
    });

    // TODO: fix it later, need to implment the API in the mock server
    // cy.get('div[role="gridcell"][col-id="body"]')
    //   .should('be.visible')
    //   .should('not.contain', 'Consectetur adipiscing elit');

    // cy.get('[data-testid="Comment"] .cogs-detail').should(
    //   'contain',
    //   '3 instances'
    // );
  });

  // will fix it later, UI throws an error probably because of the mock server
  it.skip('should delete multiple draft rows in table', () => {
    cy.get('[data-testid="UserType"]').click();
    cy.get('[data-testid="UserType"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .click()
      .type('TestName{enter}');

    cy.getBySel('draft-row-selection-checkbox').first().click();

    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .click()
      .type('TestName{enter}');

    cy.getBySel('draft-row-selection-checkbox').first().click();

    cy.getBySel('btn-pagetoolbar-delete').first().click();
    cy.getBySel('data-row-confirm-deletion-checkbox').first().click();
    cy.get('.cogs-modal-footer-buttons > .cogs-button--type-destructive')
      .first()
      .click();
    cy.getBySel('draft-row').should('not.exist');
  });

  // Will revist later, there is something weird going on with the mock server?
  it.skip('should add 0 as an input to numeric cells in data preview table', () => {
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();

    cy.enableEditMode();
    cy.openUiEditorTab();
    cy.ensureUIEditorIsVisible();
    cy.goToUIEditorType('Post');

    cy.addFieldViaUIEditor('intField', 'Int');
    cy.addFieldViaUIEditor('floatField', 'Float');

    cy.publishSchema();

    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.visit(getUrl('/blog/blog/latest/data-management/preview?type=Post'));
    cy.ensurePageFinishedLoading();

    cy.getBySel('create-new-row-btn').click({ force: true });

    cy.get('div[role="gridcell"][col-id="intField"]')
      .should('contain', '')
      .first()
      .focus()
      .click()
      .type('{enter}0{enter}');
    cy.get('div[role="gridcell"][col-id="intField"]').should('contain', '0');

    cy.get('div[role="gridcell"][col-id="floatField"]')
      .should('contain', '')
      .first()
      .focus()
      .click()
      .type('{enter}0{enter}');
    cy.get('div[role="gridcell"][col-id="floatField"]').should(
      'contain',
      '0.0'
    );
  });

  // Will revist later
  it.skip('should clear non-required cells in data preview table', () => {
    cy.visit(getUrl('/blog/blog/latest'));
    cy.ensurePageFinishedLoading();

    cy.enableEditMode();
    cy.openUiEditorTab();
    cy.ensureUIEditorIsVisible();
    cy.goToUIEditorType('Post');

    cy.addFieldViaUIEditor('strField', 'String');
    cy.addFieldViaUIEditor('intField', 'Int');
    cy.addFieldViaUIEditor('floatField', 'Float');

    cy.publishSchema();

    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.visit(getUrl('/blog/blog/latest/data-management/preview?type=Post'));
    cy.ensurePageFinishedLoading();

    cy.getBySel('create-new-row-btn').click({ force: true });

    cy.get('div[role="gridcell"][col-id="strField"]')
      .first()
      .should('contain', '')
      .focus()
      .click()
      .type('{enter}Dummy Text{enter}');
    cy.get('div[role="gridcell"][col-id="strField"]')
      .first()
      .should('contain', 'Dummy Text');
    cy.get('div[role="gridcell"][col-id="strField"]')
      .first()
      .type('{enter}{selectAll}{del}{enter}');
    cy.get('div[role="gridcell"][col-id="strField"]')
      .first()
      .should('contain', '');

    cy.get('div[role="gridcell"][col-id="intField"]')
      .first()
      .should('contain', '')
      .focus()
      .click()
      .type('{enter}0{enter}');
    cy.get('div[role="gridcell"][col-id="intField"]')
      .first()
      .should('contain', '0');
    cy.get('div[role="gridcell"][col-id="intField"]')
      .first()
      .type('{enter}{selectAll}{del}{enter}');
    cy.get('div[role="gridcell"][col-id="intField"]')
      .first()
      .should('contain', '');

    cy.get('div[role="gridcell"][col-id="floatField"]')
      .first()
      .should('contain', '')
      .focus()
      .click()
      .type('{enter}0{enter}');
    cy.get('div[role="gridcell"][col-id="floatField"]')
      .first()
      .should('contain', '0.0');
    cy.get('div[role="gridcell"][col-id="floatField"]')
      .first()
      .type('{enter}{selectAll}{del}{enter}');
    cy.get('div[role="gridcell"][col-id="floatField"]')
      .first()
      .should('contain', '');
  });
});
