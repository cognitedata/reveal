export type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  cognuitApiBaseUrl: string;
  cognuitCdfProject: string;
};

export const SIDECAR: Sidecar = {
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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any).__cogniteSidecar,
} as const;
