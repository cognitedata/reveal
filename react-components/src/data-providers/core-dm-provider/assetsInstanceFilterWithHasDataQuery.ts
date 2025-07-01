import { isDefined } from '../../utilities/isDefined';
import { type InstanceFilter, type Source } from '../FdmSDK';
import { COGNITE_ASSET_SOURCE } from './dataModels';

export function assetsInstanceFilterWithHasDataQuery(sourcesToSearch: Source[]): InstanceFilter {
  const hasDataList = sourcesToSearch.map((sourceToSearch) => {
    return {
      type: 'view' as const,
      externalId: sourceToSearch.externalId,
      space: sourceToSearch.space,
      version: sourceToSearch.version
    };
  });

  const customExistPropertyList = sourcesToSearch
    .map((sourceToSearch) => {
      if (
        sourceToSearch.externalId === COGNITE_ASSET_SOURCE.externalId &&
        sourceToSearch.space === COGNITE_ASSET_SOURCE.space
      ) {
        return undefined;
      }
      return {
        exists: {
          property: [
            sourceToSearch.space,
            `${sourceToSearch.externalId}/${sourceToSearch.version}`,
            'object3D'
          ]
        }
      };
    })
    .filter(isDefined);

  return {
    and: [
      {
        hasData: hasDataList
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
      ...customExistPropertyList
    ]
  };
}
