import { CogniteClient } from '@cognite/sdk';
import { fetchDocumentAggregates } from 'apps/cdf-document-search/src/services/api';
import { DOCUMENTS_AGGREGATES } from 'apps/cdf-document-search/src/services/constants';
import { Aggregates } from 'apps/cdf-document-search/src/services/types';

export const composeAggregates = async (
  sdk: CogniteClient
): Promise<Aggregates> => {
  const aggregates = await fetchDocumentAggregates(sdk);

  return Object.entries(DOCUMENTS_AGGREGATES).reduce(
    (accumulator, [key, constants]) => {
      const aggregate = aggregates?.find(
        (item) => item.name === constants.name
      );

      const flattenedAggregateResult = aggregate?.groups.flatMap(
        ({ group, value }) => {
          return group?.map((item) => ({
            // FIX_ME: Figure out the type.
            name: (item as any)[constants.group],
            value,
          }));
        }
      );

      return { ...accumulator, [key]: flattenedAggregateResult };
    },
    {} as Aggregates
  );
};
