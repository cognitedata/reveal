import { type NodeItem } from '../data-providers/FdmSDK';

export function removeEmptyProperties(queryResultNode: NodeItem): NodeItem {
  Object.keys(queryResultNode.properties).forEach((space) => {
    const currentSpaceProperties = queryResultNode.properties[space];
    const newProperties: Record<string, Record<string, unknown>> = {};

    Object.keys(currentSpaceProperties).forEach((view) => {
      const currentViewProperties = currentSpaceProperties[view];

      if (Object.keys(currentViewProperties).length !== 0) {
        newProperties[view] = currentViewProperties;
      }
    });

    queryResultNode.properties[space] = newProperties;
  });

  return queryResultNode;
}
