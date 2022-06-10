const changeMeasurementUnit = (unit: string) => {
  cy.log('click on settings button');
  cy.get('[aria-label="Settings"]').as('settingsBtn');
  cy.get('@settingsBtn').click();

  if (unit == 'Meter') {
    cy.getButton('Meter').click({ force: true }).should('be.focused');
  }

  if (unit == 'Feet') {
    cy.getButton('Feet').click({ force: true }).should('be.focused');
  }

  cy.log('close settings menu');
  cy.findAllByTestId('close-icon').click();
};

Cypress.Commands.add('changeMeasurementUnit', changeMeasurementUnit);

export interface SettingsCommands {
  changeMeasurementUnit(unit: string): void;
}
