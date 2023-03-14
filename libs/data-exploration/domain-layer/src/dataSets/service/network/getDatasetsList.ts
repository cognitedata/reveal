import { CogniteClient, DataSet, DataSetFilter } from '@cognite/sdk';

export const getDatasetsList = async (
  sdk: CogniteClient,
  {
    filter,
    limit,
  }: {
    filter?: DataSetFilter;
    limit?: number;
  }
) => {
  let cursor: string | undefined;
  const datasets: DataSet[] = [];

  do {
    const { nextCursor, items } = await sdk.datasets.list({
      limit: limit || 1000,
      cursor,
      filter,
    });

    datasets.push(...items);
    cursor = nextCursor;
  } while (cursor !== undefined);

  return datasets;
};
