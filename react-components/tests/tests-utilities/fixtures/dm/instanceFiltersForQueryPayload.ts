import { COGNITE_ASSET_SOURCE } from '../../../../src/data-providers/core-dm-provider/dataModels';
import { simpleSourcesFixtures } from './sources';

const existProperty1 = [ simpleSourcesFixtures[0].space, `${simpleSourcesFixtures[0].externalId}/${simpleSourcesFixtures[0].version}`, 'object3D' ];
const existProperty2 = [ simpleSourcesFixtures[1].space, `${simpleSourcesFixtures[1].externalId}/${simpleSourcesFixtures[1].version}`, 'object3D' ];

export const validInstanceFiltersForMappedAssetsQueryPayload = {
  and: [
    {
      hasData: [
        simpleSourcesFixtures[0],
        simpleSourcesFixtures[1]
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
        property: existProperty1
      }
    },
    {
      exists: {
        property: existProperty2
      }
    }
  ]
};
