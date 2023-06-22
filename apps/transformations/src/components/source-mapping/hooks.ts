import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  Destination,
  isFDMDestination,
  TransformationRead,
} from '@transformations/types';

import { useSDK } from '@cognite/sdk-provider';

import {
  getTransformationMapping,
  suggestRawMappings,
  suggestFDMMappings,
  suggestCleanMappings,
  Suggestion,
} from './utils';

const exactMatch = (destination: Destination) => {
  return !isFDMDestination(destination);
};

export const useSuggestions = (
  transformation: TransformationRead,
  options?: UseQueryOptions<
    Suggestion[],
    unknown,
    Suggestion[],
    (string | any)[]
  >
) => {
  const sdk = useSDK();
  const client = useQueryClient();
  const mapping = getTransformationMapping(transformation.query);
  const exactMapping = exactMatch(transformation.destination);

  return useQuery(
    [
      'transformations',
      'suggestions',
      { exactMapping },
      JSON.stringify(transformation.destination),
      JSON.stringify(mapping),
    ],
    async () => {
      if (!mapping) {
        return Promise.reject('Mapping not found for transformation');
      }
      if (mapping.sourceType === 'raw') {
        return suggestRawMappings(mapping, exactMapping, sdk, client);
      }
      if (mapping.sourceType === 'fdm') {
        return suggestFDMMappings(mapping, exactMapping, sdk, client);
      }
      if (mapping.sourceType === 'clean') {
        return suggestCleanMappings(mapping, exactMapping, sdk, client);
      }
      return Promise.reject('source not done');
    },
    options
  );
};
