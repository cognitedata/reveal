import { DmsUniqueIdentifier, NodeItem } from '../FdmSDK';

export function getDirectRelationProperties(searchResultNode: NodeItem): DmsUniqueIdentifier[] {
  const directRelations: DmsUniqueIdentifier[] = [];
  const nodeProperties = searchResultNode.properties;

  Object.keys(nodeProperties).forEach((propertyKey) => {
    const { space, externalId } = nodeProperties[propertyKey] as any;

    if (space !== undefined && externalId !== undefined) {
      directRelations.push({ space, externalId });
    }
  });

  return directRelations;
}
