import { interceptUMS, UMS_ME_UPDATE } from '../interceptions';

const changeMeasurementUnit = (unit: string) => {
  interceptUMS();

  cy.log('click on settings button');
  cy.get('[aria-label="Settings"]').as('settingsBtn');
  cy.get('@settingsBtn').click();

  cy.log(`changing the measurement unit: ${unit}`);

  if (unit === 'Meter') {
    cy.getButton('Meter').click({ force: true }).should('be.focused');
  }

  if (unit === 'Feet') {
    cy.getButton('Feet').click({ force: true }).should('be.focused');
  }

  cy.wait(`@${UMS_ME_UPDATE}`);

  cy.log('close settings menu');
  cy.findAllByTestId('close-icon').click();
};

Cypress.Commands.add('changeMeasurementUnit', changeMeasurementUnit);

export interface SettingsCommands {
  changeMeasurementUnit(unit: string): void;
}
