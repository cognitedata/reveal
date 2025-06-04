import { COGNITE_ASSET_SOURCE } from '../core-dm-provider/dataModels';
import {
  type DmsUniqueIdentifier,
  type NodeItem,
  type SimpleSource,
  type ViewItem
} from '../FdmSDK';
import { isDefined } from '../../utilities/isDefined';

export function getCogniteAssetDirectRelationProperties(
  searchResultNode: NodeItem,
  viewDefinition: ViewItem
): DmsUniqueIdentifier[] {
  const viewProperties = viewDefinition.properties;

  const propertiesMappingToCogniteAsset = Object.keys(viewProperties).filter((property) =>
    isMappingToCogniteAsset(property, viewDefinition)
  );

  // Get the node properties for the given view definition
  const nodeProperties =
    searchResultNode.properties[viewDefinition.space]?.[
      `${viewDefinition.externalId}/${viewDefinition.version}`
    ];

  if (Object.entries(nodeProperties).length === 0) {
    return [];
  }

  // Extract direct relations
  const directRelations = propertiesMappingToCogniteAsset
    .map((propertyKey) => {
      const propertyValue = nodeProperties[propertyKey] as DmsUniqueIdentifier | undefined;
      if (propertyValue === undefined) {
        return undefined;
      }

      const { space, externalId } = propertyValue;

      // Exclude relations linking to itself
      if (searchResultNode.externalId === externalId && searchResultNode.space === space) {
        return undefined;
      }

      return { space, externalId };
    })
    .filter(isDefined);

  return directRelations;
}

function isMappingToCogniteAsset(propertyName: string, viewDefinition: ViewItem): boolean {
  const property = viewDefinition.properties[propertyName];
  if (
    property.type === undefined ||
    property.type.type !== 'direct' ||
    property.type.list === true
  ) {
    return false;
  }

  const directRelationSource = property.type.source as SimpleSource;
  return (
    directRelationSource?.externalId === COGNITE_ASSET_SOURCE.externalId &&
    directRelationSource?.space === COGNITE_ASSET_SOURCE.space &&
    directRelationSource?.version === COGNITE_ASSET_SOURCE.version
  );
}
