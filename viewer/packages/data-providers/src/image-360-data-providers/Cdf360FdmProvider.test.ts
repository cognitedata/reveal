/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cdf360FdmProvider } from './Cdf360FdmProvider';
import { DmsSDK, InstanceIdentifier } from './DmsSdk';

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
        space: 'christjt-test-system-360',
        image360CollectionExternalId: 'c_RC_2'
      },
      true
    );
  }, 10000);

  test('Types from queryNodesAndEdges result, given a constant query, should follow DMS spec', async () => {
    const query = {
      with: {
        a: {
          nodes: {}
        },
        b: {
          nodes: {}
        },
        c: {
          nodes: {}
        }
      },
      select: {
        a: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'TestSpaceA',
                externalId: 'aExternalId',
                version: '1'
              },
              properties: ['aPropOne']
            }
          ]
        },
        b: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'TestSpaceB',
                externalId: 'bExternalIdOne',
                version: '1'
              },
              properties: ['bPropOne']
            },
            {
              source: {
                type: 'view',
                space: 'TestSpaceD',
                externalId: 'bExternalIdTwo',
                version: 'v1'
              },
              properties: ['bPropTwo']
            }
          ]
        },
        c: {
          sources: [
            {
              source: {
                type: 'view',
                space: 'TestSpaceC',
                externalId: 'cExternalId',
                version: 'v1'
              },
              properties: ['cPropOne']
            }
          ]
        }
      }
    } as const;

    type QueryResult = Awaited<ReturnType<typeof DmsSDK.prototype.queryNodesAndEdges<typeof query>>>;

    // Test that the resulting property types are correct
    type QueryResultProp = QueryResult['b'][number]['properties']['TestSpaceB']['bExternalIdOne/1']['bPropOne'] extends
      | string
      | number
      | InstanceIdentifier
      ? true
      : false;
    expect<QueryResultProp>(true).toBeTrue();

    // Test that the select keys are correct
    type SelectParams = Exclude<keyof QueryResult, 'a' | 'b' | 'c' | 'nextCursor'> extends never ? true : false;
    expect<SelectParams>(true).toBeTrue();

    // Test that spaces from different select sources are not mixed
    // @ts-expect-error
    type QueryResultPropFromInvalidSpace = QueryResult['b'][number]['properties']['TestSpaceA'];
    expect<QueryResultPropFromInvalidSpace>(true).toBeTrue();

    // Test that properties from a different source does not spill over in the result type
    // @ts-expect-error
    type QueryResultPropFromWrongSource = QueryResult['b'][number]['properties']['TestSpaceB']['bExternalIdTwo/v1'];
    expect<QueryResultPropFromWrongSource>(true).toBeTrue();
  }, 10000);
});
