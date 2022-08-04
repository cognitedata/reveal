import { GetSearchDataQueryTypeGenerated } from 'graphql/generated';
import { DATA_TYPES } from 'pages/MapOverlay/MapOverlayRouter';

import { getDataFromMap, getDataFromSearch } from '.';

export const getDataFromMapAndSearch = (
  type: string,
  to: string,
  mapData: GetSearchDataQueryTypeGenerated,
  searchData: GetSearchDataQueryTypeGenerated
) => {
  let dataType = type;
  let destData;
  if (!type || type === DATA_TYPES.EQUIPMENT) {
    const { key, item } = getDataFromMap(mapData, to);
    // if the item cannot be found, return nodeId to enable zoom
    destData = item || { nodeId: to };
    dataType = key;
  } else {
    destData = getDataFromSearch(
      searchData,
      to,
      type as keyof GetSearchDataQueryTypeGenerated
    );
  }

  return { data: destData, type: dataType };
};
