import { useSearchDataTypesQuery } from '@fdx/services/dataTypes/queries/useSearchDataTypesQuery';
import { useSearchCategoryParams } from '@fdx/shared/hooks/useParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';

import { Skeleton } from '@cognite/cogs.js';

import { useSearchDataTypeSortedByKeys } from '../hooks/useSearchDataTypeSortedByKeys';

import { FileResults } from './FileResults';
import { GenericResults } from './GenericResults';
import { TimeseriesResults } from './TimeseriesResults';

export const SearchResults = () => {
  const client = useFDM();
  const [category] = useSearchCategoryParams();
  const { data: hits, isLoading } = useSearchDataTypesQuery();
  const { keys, isLoading: isCountsLoading } = useSearchDataTypeSortedByKeys();

  const isDataLoading = isLoading && isCountsLoading;

  if (isDataLoading) {
    return <Skeleton.List lines={3} />;
  }

  if (category) {
    if (category === 'File') {
      return <FileResults selected />;
    }

    if (category === 'TimeSeries') {
      return <TimeseriesResults selected />;
    }

    const type = client.allDataTypes?.find((item) => item.name === category);
    const values = hits?.[category];

    return (
      <GenericResults
        dataType={category}
        type={type}
        values={values}
        selected
      />
    );
  }

  return (
    <>
      {keys.map((dataType) => {
        if (dataType === 'File') {
          return <FileResults key={dataType} />;
        }

        if (dataType === 'TimeSeries') {
          return <TimeseriesResults key={dataType} />;
        }

        const type = client.allDataTypes?.find(
          (item) => item.name === dataType
        );

        const values = hits?.[dataType];

        return (
          <GenericResults
            key={dataType}
            dataType={dataType}
            type={type}
            values={values}
          />
        );
      })}
    </>
  );
};
