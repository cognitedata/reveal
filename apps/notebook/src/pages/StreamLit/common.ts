import { trackEvent } from '@cognite/cdf-route-tracker';
import { CogniteClient, ExternalFileInfo } from '@cognite/sdk';

import { StreamLitAppSpec } from './types';

export const saveApp = async (app: StreamLitAppSpec, sdk: CogniteClient) => {
  trackEvent('StreamlitApps.Save', { app: app.fileExternalId });
  const body: ExternalFileInfo = {
    name: app.name + '-source.json',
    externalId: app.fileExternalId,
    directory: '/streamlit-apps/',
    metadata: {
      name: app.name,
      description: app.description,
      creator: app.creator,
      published: app?.published ? 'true' : 'false',
    },
  };

  if (app.dataSetId) {
    body.dataSetId = app.dataSetId;
  }

  await sdk.files.upload(body, app.code, true, true);
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const validStreamlitFilename = (filename: string) => {
  const [name, ext] = filename.split('.');
  return name && ext === 'py';
};
