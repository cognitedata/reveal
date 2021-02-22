/* eslint-disable no-underscore-dangle */

export type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  docsSiteBaseUrl: string;
  nomaApiBaseUrl: string;
  cognuitApiBaseUrl: string;
  cognuitCdfProject: string;
};

// @ts-expect-error Property '__cogniteSidecar' does not exist on type 'Window & typeof globalThis'
const sidecarOverrides = global.window ? global.window.__cogniteSidecar : {};

(window as any).__cogniteSidecar = {
  // insert any values here for local dev:

  // -- Bluefield -- (Azure)
  // appsApiBaseUrl: 'https://apps-api.bluefield.cognite.ai',
  // cdfApiBaseUrl: 'https://bluefield.cognitedata.com',

  // -- EW1 --
  appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
  cdfApiBaseUrl: 'https://api.cognitedata.com',

  // -- Greenfield --
  // appsApiBaseUrl: 'https://apps-api.greenfield.cognite.ai',
  // cdfApiBaseUrl: 'https://greenfield.cognitedata.com',

  __sidecarFormatVersion: 1,
  applicationId: 'cognuit-dev',

  cognuitApiBaseUrl: 'https://cognuit-cognitedata-development.cognite.ai',
  cognuitCdfProject: 'subsurface-test',

  ...sidecarOverrides,
} as Sidecar;

export default (window as any).__cogniteSidecar;
