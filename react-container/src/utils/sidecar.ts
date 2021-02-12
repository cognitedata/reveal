type SidecarConfig = {
  __sidecarFormatVersion: number;
  AADClientID?: string;
  AADTenantID?: string;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  backgroundImage: string;
  cdfApiBaseUrl: string;
  cdfCluster: string;
  helpLink: string;
};

const DEFAULT_SIDECAR: SidecarConfig = {
  // -- Bluefield -- (Azure)
  appsApiBaseUrl: 'https://apps-api.bluefield.cognite.ai',
  cdfApiBaseUrl: 'https://bluefield.cognitedata.com',

  // -- EW1 --
  // appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
  // cdfApiBaseUrl: 'https://api.cognitedata.com',

  // -- Greenfield --
  // appsApiBaseUrl: 'https://apps-api.greenfield.cognite.ai',
  // cdfApiBaseUrl: 'https://greenfield.cognitedata.com',

  __sidecarFormatVersion: 1,
  applicationId: 'fas-demo',
  applicationName: 'React Container',
  backgroundImage: '',
  helpLink: '',

  cdfCluster: 'bluefield',
  // cdfCluster: 'ew1',
  // cdfCluster: 'greenfield',

  // use the demo app if you are testing this:
  // if you need access, please ask in #frontend
  AADTenantID: 'reactdemoapp.onmicrosoft.com',

  // created with terraform:
  AADClientID: '7e8b0cb9-c1bf-46df-bf79-13cb1b19a8f8', // Demo App: bluefield (staging)
  // AADClientID: '52106ea0-e93b-40bc-99dc-5f7deacceda1', // Demo App: ew1 (staging)
  // AADClientID: 'e0e9ac77-f9cc-49ca-9bb2-eef01313751b', // Demo App: greenfield (staging)
};

export const getSidecar = (): SidecarConfig => {
  // eslint-disable-next-line no-underscore-dangle
  return (window as any).__cogniteSidecar || DEFAULT_SIDECAR; // eslint-disable-line @typescript-eslint/no-explicit-any
};
