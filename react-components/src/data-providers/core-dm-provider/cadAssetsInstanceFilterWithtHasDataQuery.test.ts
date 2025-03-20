import { describe, it, expect } from 'vitest';
import { cadCogniteAssetsInstanceFilterWithtHasDataQuery } from './cadAssetsInstanceFilterWithtHasDataQuery';
import { type Source } from '../FdmSDK';
import { COGNITE_ASSET_SOURCE } from './dataModels';
import { simpleSourcesFixtures } from '../../../tests/tests-utilities/fixtures/dm/sources';
import { validInstanceFiltersForMappedAssetsQueryPayload } from '../../../tests/tests-utilities/fixtures/dm/instanceFiltersForQueryPayload';

describe(cadCogniteAssetsInstanceFilterWithtHasDataQuery.name, () => {
  it('should generate a valid instance filter with the provided sources', () => {

    const result = cadCogniteAssetsInstanceFilterWithtHasDataQuery(simpleSourcesFixtures);

    expect(result).toEqual(validInstanceFiltersForMappedAssetsQueryPayload);
  });

  it('should handle an empty sourcesToSearch array', () => {
    const sourcesToSearch: Source[] = [];

    const result = cadCogniteAssetsInstanceFilterWithtHasDataQuery(sourcesToSearch);

    expect(result).toEqual({
      and: [
        {
          hasData: []
        },
        {
          exists: {
            property: [
              COGNITE_ASSET_SOURCE.space,
              `${COGNITE_ASSET_SOURCE.externalId}/${COGNITE_ASSET_SOURCE.version}`,
              'object3D'
            ]
          }
        }
      ]
    });
  });

  it('should exclude COGNITE_ASSET_SOURCE from customExistPropertyList', () => {
    const sourcesToSearch: Source[] = [
      {
        type: 'view',
        externalId: COGNITE_ASSET_SOURCE.externalId,
        space: COGNITE_ASSET_SOURCE.space,
        version: COGNITE_ASSET_SOURCE.version
      },
      {
        type: 'view',
        externalId: 'externalId1',
        space: 'space1',
        version: 'v1'
      }
    ];

    const result = cadCogniteAssetsInstanceFilterWithtHasDataQuery(sourcesToSearch);

    expect(result).toEqual({
      and: [
        {
          hasData: [
            {
              type: 'view',
              externalId: COGNITE_ASSET_SOURCE.externalId,
              space: COGNITE_ASSET_SOURCE.space,
              version: COGNITE_ASSET_SOURCE.version
            },
            {
              type: 'view',
              externalId: 'externalId1',
              space: 'space1',
              version: 'v1'
            }
          ]
        },
        {
          exists: {
            property: [
              COGNITE_ASSET_SOURCE.space,
              `${COGNITE_ASSET_SOURCE.externalId}/${COGNITE_ASSET_SOURCE.version}`,
              'object3D'
            ]
          }
        },
        {
          exists: {
            property: [
              'space1',
              'externalId1/v1',
              'object3D'
            ]
          }
        }
      ]
    });
  });
});
