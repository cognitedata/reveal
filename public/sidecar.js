/**
 * This is for replacing the FAS sidecar with default values that can be used in the localhost for development
 */

(() => {
  // eslint-disable-next-line no-underscore-dangle
  window.__cogniteSidecar = {
    // -- Bluefield -- (Azure)
    // appsApiBaseUrl: 'https://apps-api.bluefield.cognite.ai',
    // cdfApiBaseUrl: 'https://bluefield.cognitedata.com',

    // -- EW1 --
    appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
    cdfApiBaseUrl: 'https://api.cognitedata.com',

    // -- Greenfield --
    // appsApiBaseUrl: 'https://apps-api.greenfield.cognite.ai',
    // cdfApiBaseUrl: 'https://greenfield.cognitedata.com',

    __sidecarFormatVersion: 0,
    applicationId: 'cognuit-dev',
    cognuitApiBaseUrl: 'https://cognuit-cognitedata-development.cognite.ai',
    cognuitCdfProject: 'subsurface-test',

    AADClientID: 'b7c57241-915b-495a-bd0c-f13140f1c93b', // Cognite React Demo APP: (staging)
    AADTenantID: 'a9ae5b54-3600-4917-a9dc-3020723360b3', // Cognite React Demo APP: (staging)
  };
})();
