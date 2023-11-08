/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cdf360FdmProvider } from './Cdf360FdmProvider';
import { DmsSDK } from './DmsSdk';
import { get360CollectionQuery } from './Cdf360FdmQuery';

describe(Cdf360FdmProvider.name, () => {
  test('MyTest', async () => {
    const sdk = new CogniteClient({
      getToken: () =>
        Promise.resolve(
          ''
        ),
      appId: 'MyApp',
      project: '3d-test',
      baseUrl: 'https://greenfield.cognitedata.com'
    });

    const provider = new DmsSDK(sdk);

    const now = performance.now();
    const query = get360CollectionQuery('Hibernia_RS2', 'christjt-test-system-360');

    const result = await provider.queryNodesAndEdges(query);

    console.log(performance.now() - now);

    console.log(result.images[0].properties.aSpace.);

    // await provider.get360ImageDescriptors(
    //   {
    //     space: 'Image_360',
    //     image360CollectionExternalId: 'c_RC_2'
    //   },
    //   false
    // );
  }, 10000);
});
