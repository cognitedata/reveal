import { Skeleton } from '@cognite/cogs.js';

import { useSearchCategoryParams } from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';
import { useSearchDataTypeSortedByKeys } from '../hooks/useSearchDataTypeSortedByKeys';

import { FileResults } from './FileResults';
import { GenericResults } from './GenericResults';
import { TimeseriesResults } from './TimeseriesResults';

export const SearchResults: React.FC = () => {
  const client = useFDM();
  const [category] = useSearchCategoryParams();
  const { data: hits, isLoading } = useSearchDataTypesQuery();
  const { keys, isLoading: isCountsLoading } = useSearchDataTypeSortedByKeys();

  if (isLoading && isCountsLoading) {
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
    return (
      <GenericResults
        dataType={category}
        type={type}
        values={hits?.[category]}
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

        return (
          <GenericResults
            key={dataType}
            dataType={dataType}
            type={type}
            values={hits?.[dataType]}
          />
        );
      })}
    </>
  );
};
