/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cdf360DataModelsDescriptorProvider } from './Cdf360DataModelsDescriptorProvider';

describe(Cdf360DataModelsDescriptorProvider.name, () => {
  test('MyTest', async () => {
    const sdk = new CogniteClient({
      getToken: () => Promise.resolve(''),
      appId: 'MyApp',
      project: '3d-test',
      baseUrl: 'https://greenfield.cognitedata.com'
    });

    const provider = new Cdf360DataModelsDescriptorProvider(sdk);

    const descriptors = await provider.get360ImageDescriptors(
      {
        space: 'christjt-test-system-360',
        image360CollectionExternalId: 'xom-hcu1_north_v02' //xom-hcu1_north_v02
      },
      true
    );

    console.log(descriptors.length);
  }, 10000);
});
