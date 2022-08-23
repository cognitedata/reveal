import {
  DocumentHighlight,
  DocumentSearchItem,
  Document,
  DocumentSearchResponse,
} from '@cognite/sdk';

export const getHighlight = (info?: DocumentHighlight) => {
  let result: string[] = [];

  if (!info) {
    return result;
  }

  if (info.content) {
    result = result.concat(info.content);
  }

  return result;
};

export const toDocument = ({
  item,
  highlight,
}: DocumentSearchItem): Document => {
  const documentResponse = {
    ...item,
    highlight: {
      content: getHighlight(highlight),
    },
  };

  return documentResponse;
};

export const toDocuments = (result: DocumentSearchResponse): Document[] => {
  return result.items.map(toDocument);
};
