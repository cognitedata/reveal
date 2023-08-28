import { useParams } from 'react-router-dom';

import { Skeleton } from '@cognite/cogs.js';

import { useFDM } from '../../../providers/FDMProvider';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';
import { useSearchDataTypeSortedByKeys } from '../hooks/useSearchDataTypeSortedByKeys';

import { FileResults } from './FileResults';
import { GenericResults } from './GenericResults';
import { TimeseriesResults } from './TimeseriesResults';

export const SearchResults: React.FC = () => {
  const client = useFDM();
  const { type: selectedDataType } = useParams();
  const { data: hits, isLoading } = useSearchDataTypesQuery();
  const { keys, isLoading: isCountsLoading } = useSearchDataTypeSortedByKeys();

  if (isLoading && isCountsLoading) {
    return <Skeleton.List lines={3} />;
  }

  if (selectedDataType) {
    if (selectedDataType === 'File') {
      return <FileResults />;
    }

    if (selectedDataType === 'TimeSeries') {
      return <TimeseriesResults />;
    }

    const type = client.allDataTypes?.find(
      (item) => item.name === selectedDataType
    );
    return (
      <GenericResults
        dataType={selectedDataType}
        type={type}
        values={hits?.[selectedDataType]}
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
