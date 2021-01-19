type SidecarConfig = {
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  applicationId: string;
  applicationName: string;
  backgroundImage: string;
  helpLink: string;
  AADClientID?: string;
  AADTenantID?: string;
};

const DEFAULT_SIDECAR: SidecarConfig = {
  // -- Bluefield -- (Azure)
  // appsApiBaseUrl: 'https://apps-api.bluefield.cognite.ai',
  // cdfApiBaseUrl: 'https://bluefield.cognitedata.com',

  // -- EW1 --
  appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
  cdfApiBaseUrl: 'https://api.cognitedata.com',

  // -- Greenfield --
  // appsApiBaseUrl: 'https://apps-api.greenfield.cognite.ai',
  // cdfApiBaseUrl: 'https://greenfield.cognitedata.com',

  applicationId: 'fas-demo',
  applicationName: 'Tenant Selector Test',
  backgroundImage: '',
  helpLink: '',
  AADClientID: 'b7c57241-915b-495a-bd0c-f13140f1c93b', // Cognite React Demo APP: (staging)
  AADTenantID: 'a9ae5b54-3600-4917-a9dc-3020723360b3', // Cognite React Demo APP: (staging)
};

export default (): SidecarConfig => {
  // eslint-disable-next-line no-underscore-dangle
  return (window as any).__cogniteSidecar || DEFAULT_SIDECAR; // eslint-disable-line @typescript-eslint/no-explicit-any
};
