import { isEmpty } from 'lodash';
import { isObjectEmpty } from 'utils';
import { InternalEventsData } from '../types';

export const mapEventsMetadataKeysWithQuery = (
  eventsData: InternalEventsData[],
  query?: string
): Record<string, string> | undefined => {
  if (query === undefined || query === '') {
    return undefined;
  }

  const metadataKeys = getUniqueMetadataKeysFromEventsData(eventsData);

  return mergeMetadataKeysWithQuery(query, metadataKeys);
};

const getUniqueMetadataKeysFromEventsData = (
  eventsData: InternalEventsData[]
) => {
  const metadataKeysSet = new Set<string>();

  for (const { metadata } of eventsData) {
    if (isObjectEmpty(metadata)) {
      continue;
    }

    const keys = Object.keys(metadata!);
    keys.forEach(key => metadataKeysSet.add(key));
  }

  return [...metadataKeysSet];
};

const mergeMetadataKeysWithQuery = (query: string, metadataKeys: string[]) => {
  if (isEmpty(metadataKeys)) {
    return undefined;
  }

  return metadataKeys.reduce((accumulator, key) => {
    return {
      ...accumulator,
      [key]: query,
    };
  }, {});
};
