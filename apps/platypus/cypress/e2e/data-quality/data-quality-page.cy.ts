import { getUrl } from '../../utils/url';

describe('Platypus Data Quality Page', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: 'https://unleash-proxy.cognitedata-production.cognite.ai/*',
      },
      {
        body: {
          toggles: [
            {
              name: 'DEVX_DATA_QUALITY_UI',
              enabled: true,
              variant: {
                name: 'disabled',
                enabled: false,
              },
            },
          ],
        },
      }
    );

    window.sessionStorage.setItem('agGridVirtualizationModeDisabled', 'true');
    cy.request('http://localhost:4200/reset');
    cy.visit(getUrl('/blog/blog/latest/data-quality'));
    cy.ensurePageFinishedLoading();
  });

  it('should load page', () => {
    cy.getBySel('dq-page-header').should('be.visible');
    cy.getBySel('dq-page-content').should('be.visible');
  });
});
