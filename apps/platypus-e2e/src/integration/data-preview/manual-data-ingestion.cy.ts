describe('Platypus Data Preview Page - Manual Data Ingestion', () => {
  beforeEach(() => {
    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/latest/data/data-management/preview');
  });

  it('should create draft row in table and publish it', () => {
    cy.get('[data-testid="User"]').click();
    cy.get('[data-testid="User"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.getBySel('draft-row').should('be.visible');
    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .click()
      .type('{enter}TestName{enter}');

    cy.getBySel('handle-add-row-button').first().click();
    cy.getBySel('toast-body')
      .should('be.visible')
      .and('contain', 'Instance added');
    cy.reload();
    cy.get('[data-testid="User"]').click();
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible');
    cy.getBySel('draft-row').should('not.exist');
  });

  it('should update already published row', () => {
    cy.get('[data-testid="User"]').click();
    cy.get('[data-testid="User"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.intercept('POST', 'api/v1/projects/mock/datamodelstorage/nodes').as(
      'ingestNodes'
    );
    cy.get('div[role="gridcell"][col-id="name"]')
      .should('be.visible')
      .should('contain', 'John Doe')
      .first()
      .focus()
      .click()
      .type('{enter}Not John Doe{enter}');

    cy.wait('@ingestNodes').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
      expect(interception.response.body.items[0].name).to.include(
        'Not John Doe'
      );
    });
  });
  it('should update, remove, and then insert direct relationships', () => {
    cy.get('[data-testid="Post"]').click();
    cy.get('[data-testid="Post"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.intercept('POST', 'api/v1/projects/mock/datamodelstorage/nodes').as(
      'ingestNodes'
    );
    cy.get('div[role="gridcell"][col-id="user"]')
      .should('be.visible')
      .should('contain', '123')
      .first()
      .focus()
      .dblclick()
      .type('321{enter}');

    cy.wait('@ingestNodes').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
      expect(interception.response.body.items[0].user[1]).to.equal('321');
    });

    cy.get('div[role="gridcell"][col-id="user"]')
      .should('be.visible')
      .should('contain', '321')
      .first()
      .focus()
      .dblclick()
      .type('{backspace}{enter}');

    cy.wait('@ingestNodes').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
      expect(interception.response.body.items[0].user).to.equal(null);
    });

    cy.get('div[role="gridcell"][col-id="user"]')
      .should('be.visible')
      .should('contain', '')
      .first()
      .focus()
      .dblclick()
      .type('123{enter}');

    cy.wait('@ingestNodes').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
      expect(interception.response.body.items[0].user[1]).to.equal('123');
    });
  });
  it('should handle row revert on server update error', () => {
    cy.get('[data-testid="User"]').click();
    cy.get('[data-testid="User"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.intercept(
      'POST',
      'api/v1/projects/mock/datamodelstorage/nodes',
      (req) => {
        req.destroy();
      }
    );
    cy.get('div[role="gridcell"][col-id="name"]')
      .should('be.visible')
      .should('contain', 'John Doe')
      .first()
      .focus()
      .click()
      .type('{enter} Not John Doe{enter}');

    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .should('be.visible')
      .contains('John Doe');
  });

  it('should delete published rows', () => {
    cy.get('[data-testid="User"]').click();
    cy.get('[data-testid="User"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');

    cy.intercept(
      'POST',
      'api/v1/projects/mock/datamodelstorage/nodes/delete'
    ).as('deleteNodes');

    // Wait for row to be rendered
    cy.get('div[role="gridcell"][col-id="name"]')
      .should('be.visible')
      .should('contain', 'John Doe');

    cy.get('div[role="gridcell"][col-id="_isDraftSelected"]')
      .first()
      .should('be.visible')
      .click();
    const response = {
      data: {
        listUser: {
          items: [{ externalId: 456, name: 'Jane Doe' }],
        },
        aggregateUser: {
          items: [
            {
              count: {
                externalId: 1,
              },
            },
          ],
        },
      },
    };

    cy.intercept(
      'POST',
      '/api/v1/projects/mock/schema/api/blog/1/graphql',
      response
    );
    cy.on('window:confirm', () => true);
    cy.getBySel('btn-pagetoolbar-delete').click();
    cy.getBySel('data-row-confirm-deletion-checkbox').click();
    cy.getBySel('modal-ok-button').click();

    cy.wait('@deleteNodes').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.get('div[role="gridcell"][col-id="name"]')
      .should('be.visible')
      .should('not.contain', 'John Doe');
    cy.get('[data-testid="User"] .cogs-detail').should('contain', '1 instance');
  });

  it('should delete multiple draft rows in table', () => {
    cy.get('[data-testid="User"]').click();
    cy.get('[data-testid="User"]').should('have.class', 'active');
    cy.getBySel('data-preview-table').should('be.visible');
    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.getBySel('draft-row').should('be.visible');
    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .click()
      .type('TestName{enter}');

    cy.getBySel('draft-row-selection-checkbox').first().click();

    cy.getBySel('create-new-row-btn').should('be.visible').click();
    cy.getBySel('draft-row').should('be.visible');
    cy.get('div[role="gridcell"][col-id="name"]')
      .first()
      .click()
      .type('TestName{enter}');

    cy.getBySel('draft-row-selection-checkbox').first().click();

    cy.getBySel('btn-pagetoolbar-delete').first().click();
    cy.getBySel('data-row-confirm-deletion-checkbox').first().click();
    cy.getBySel('modal-ok-button').first().click();
    cy.getBySel('draft-row').should('not.exist');
  });

  it('should add 0 as an input to numeric cells in data preview table', () => {
    cy.visit('/platypus/data-models/blog/latest');

    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.getBySel('type-list-item-Post').should('be.visible').click();

    cy.addDataModelTypeField('Post', 'intField', 'Int');
    cy.addDataModelTypeField('Post', 'floatField', 'Float');

    cy.getBySel('publish-schema-btn').click();
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.visit(
      '/platypus/data-models/blog/latest/data/data-management/preview?type=Post'
    );

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

  it('should clear non-required cells in data preview table', () => {
    cy.visit('/platypus/data-models/blog/latest');

    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.getBySel('type-list-item-Post').should('be.visible').click();

    cy.addDataModelTypeField('Post', 'strField', 'String');
    cy.addDataModelTypeField('Post', 'intField', 'Int');
    cy.addDataModelTypeField('Post', 'floatField', 'Float');

    cy.getBySel('publish-schema-btn').click();
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.visit(
      '/platypus/data-models/blog/latest/data/data-management/preview?type=Post'
    );

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
