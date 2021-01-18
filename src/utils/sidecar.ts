/* eslint-disable no-underscore-dangle */
import merge from 'lodash/merge';

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  docsSiteBaseUrl: string;
  nomaApiBaseUrl: string;
};

const sidecar = merge(
  {},
  {
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
    applicationId: 'fas-demo',
    applicationName: 'React Demo (staging)',
    docsSiteBaseUrl: 'https://docs.cognite.com',
    nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  (window as any).__cogniteSidecar
) as Sidecar;

export default sidecar;
