import { GetSearchDataQueryTypeGenerated } from 'graphql/generated';
import { DATA_TYPES } from 'pages/MapOverlay/MapOverlayRouter';

export const getDataFromSearch = (
  data: GetSearchDataQueryTypeGenerated,
  to: string,
  toType: keyof GetSearchDataQueryTypeGenerated
) => {
  /* @ts-expect-error: This expression is not callable. */
  return data[toType]?.items.find((item: any) => {
    if (toType === DATA_TYPES.ROOM) {
      return String(item.nodeId) === to;
    }
    if (toType === DATA_TYPES.PERSON) {
      return String(item.externalId) === to;
    }
    return false;
  });
};
