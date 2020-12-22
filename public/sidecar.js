/**
 * This is for replacing the FAS sidecar with default values that can be used in the localhost for development
 */

(() => {
  // eslint-disable-next-line no-underscore-dangle
  window.__cogniteSidecar = {
    __sidecarFormatVersion: 0,
    applicationId: 'cognuit-dev',
    cognuitApiBaseUrl: 'https://cognuit-cognitedata-development.cognite.ai',
    cognuitCdfProject: 'subsurface-test',
  };
})();
