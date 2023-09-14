import { Skeleton } from '@cognite/cogs.js';

import { useSearchCategoryParams } from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { useSearchMappedEquipment } from '../../../providers/Mapped3DEquipmentProvider';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';
import { useSearchDataTypeSortedByKeys } from '../hooks/useSearchDataTypeSortedByKeys';
import { useSearchThreeDMappedSortedByKeys } from '../hooks/useSearchThreeDMappedSortedByKeys';

import { FileResults } from './FileResults';
import { GenericResults } from './GenericResults';
import { TimeseriesResults } from './TimeseriesResults';

export type SearchResultsProps = {
  displayOnlyMapped3dData?: boolean;
};

export const ThreeDResults = ({
  displayOnlyMapped3dData = false,
}: SearchResultsProps) => {
  const client = useFDM();
  const [category] = useSearchCategoryParams();
  const { data: hits, isLoading } = useSearchDataTypesQuery();
  const { data: mappedEquipment, isLoading: isMappedDataLoading } =
    useSearchMappedEquipment(displayOnlyMapped3dData);
  const { keys: keys3d, isLoading: isCounts3dLoading } =
    useSearchThreeDMappedSortedByKeys(displayOnlyMapped3dData);

  const { keys, isLoading: isCountsLoading } = useSearchDataTypeSortedByKeys();

  const isDataLoading = displayOnlyMapped3dData
    ? isMappedDataLoading || isCounts3dLoading
    : isLoading || isCountsLoading;

  const transformedKeys = displayOnlyMapped3dData ? keys3d : keys;

  if (isDataLoading) {
    return <Skeleton.List lines={3} />;
  }

  const renderSearchDataType = (
    dataType: string,
    selected: boolean | undefined
  ) => {
    if (dataType === 'File') {
      return <FileResults key={dataType} selected={selected} />;
    }

    if (dataType === 'TimeSeries') {
      return <TimeseriesResults key={dataType} selected={selected} />;
    }

    const type = client.allDataTypes?.find((item) => item.name === dataType);

    const values =
      displayOnlyMapped3dData && mappedEquipment
        ? mappedEquipment[dataType]
        : hits?.[dataType];

    return (
      <GenericResults
        key={dataType}
        dataType={dataType}
        type={type}
        values={values}
        disable3dPreview
        selected={selected}
      />
    );
  };

  if (category) {
    return renderSearchDataType(category, true);
  }

  return (
    <>
      {transformedKeys.map((dataType) => {
        return renderSearchDataType(dataType, false);
      })}
    </>
  );
};
