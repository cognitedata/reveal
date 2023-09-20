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
      project: '3d-test',
      baseUrl: 'https://greenfield.cognitedata.com'
    });

    const provider = new Cdf360FdmProvider(sdk);

    await provider.get360ImageDescriptors(
      {
        space: 'Image_360',
        image360CollectionExternalId: 'c_RC_2'
      },
      false
    );
  }, 10000);
});
