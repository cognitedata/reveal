export type FDMVersion = 'V2' | 'V3';

export const getFDMVersion = (): FDMVersion => {
  return Cypress.env('FDM_VERSION') === '3' ? 'V3' : 'V2';
};
