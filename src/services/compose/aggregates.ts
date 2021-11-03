import { CogniteClient } from '@cognite/sdk';
import { fetchDocumentAggregates } from 'services/api';
import { DOCUMENTS_AGGREGATES } from 'services/constants';
import { Aggregates } from 'services/types';

export const composeAggregates = async (
  sdk: CogniteClient
): Promise<Aggregates> => {
  const aggregates = await fetchDocumentAggregates(sdk);

  const transform = Object.entries(DOCUMENTS_AGGREGATES).reduce(
    (accumulator, [key, constants]) => {
      const aggregate = aggregates?.find(
        (item) => item.name === constants.name
      );

      const flattenedAggregateResult = aggregate?.groups.flatMap(
        ({ group, value }) =>
          group.map((item) => ({ name: item[constants.group], value }))
      );

      return { ...accumulator, [key]: flattenedAggregateResult };
    },
    {} as Aggregates
  );

  return transform;
};
