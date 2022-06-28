/**
 * Get CDF Dataset
 */

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { DataSet } from '@cognite/sdk';

export default function useCdfDataset(id: number | undefined) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useCdfItem<DataSet>(
    'datasets',
    { id: id! },
    {
      enabled: Number.isFinite(id),
    }
  );

  return {
    dataset,
    isLoading,
    error,
  };
}
