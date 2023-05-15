/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cdf360FdmProvider } from './Cdf360FdmProvider';

describe(Cdf360FdmProvider.name, () => {
  test('MyTest', async () => {
    const sdk = new CogniteClient({
      getToken: () => Promise.resolve(''),
      appId: 'MyApp',
      project: 'connections-industries',
      baseUrl: 'https://greenfield.cognitedata.com'
    });

    const provider = new Cdf360FdmProvider(sdk);

    await provider.get360ImageDescriptors(
      {
        dataModelExternalId: 'Image360Space',
        space: 'Connections_360',
        image360CollectionExternalId: 'asd'
      },
      false
    );
  }, 10000);
});
