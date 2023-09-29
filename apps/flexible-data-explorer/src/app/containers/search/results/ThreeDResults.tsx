import styled from 'styled-components';

import { EmptyState, Skeleton } from '@cognite/cogs.js';

import { useTranslation } from '../../../../app/hooks/useTranslation';
import {
  useSearchCategoryParams,
  useSelectedInstanceParams,
} from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { useSearchMappedEquipment } from '../../../providers/Mapped3DEquipmentProvider';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';
import { Instance } from '../../../services/types';
import { ZoomTo3DButton } from '../../ThreeD/containers/ZoomTo3DButton';
import { useSearchDataTypeSortedByKeys } from '../hooks/useSearchDataTypeSortedByKeys';
import { useSearchThreeDMappedSortedByKeys } from '../hooks/useSearchThreeDMappedSortedByKeys';
import { areAllValuesZero } from '../utils';

import { FileResults } from './FileResults';
import { GenericResults } from './GenericResults';
import { TimeseriesResults } from './TimeseriesResults';

interface Props {
  displayOnlyMapped3dData?: boolean;
  onZoomButtonClick?: (selectedInstance: Instance | undefined) => void;
}

export const ThreeDResults: React.FC<Props> = ({
  displayOnlyMapped3dData = false,
  onZoomButtonClick,
}) => {
  const client = useFDM();
  const { t } = useTranslation();
  const [category] = useSearchCategoryParams();
  const [selectedInstance] = useSelectedInstanceParams();

  const { data: mappedEquipment, isLoading: isMappedDataLoading } =
    useSearchMappedEquipment(displayOnlyMapped3dData);
  const {
    keys: keys3d,
    counts: counts3d,
    isLoading: isCounts3dLoading,
  } = useSearchThreeDMappedSortedByKeys(displayOnlyMapped3dData);

  const { data: hits, isLoading } = useSearchDataTypesQuery();
  const {
    keys,
    counts,
    isLoading: isCountsLoading,
  } = useSearchDataTypeSortedByKeys();

  const isDataLoading = displayOnlyMapped3dData
    ? isMappedDataLoading || isCounts3dLoading
    : isLoading || isCountsLoading;

  const isNothingFound = displayOnlyMapped3dData
    ? !isCounts3dLoading && areAllValuesZero(counts3d)
    : !isCountsLoading && areAllValuesZero(counts);

  const transformedKeys = displayOnlyMapped3dData ? keys3d : keys;

  if (isDataLoading) {
    return <Skeleton.List lines={3} />;
  }

  if (isNothingFound) {
    return (
      <EmptyStateWrapper>
        <EmptyState
          title={t('SEARCH_RESULTS_EMPTY_TITLE')}
          body={t('SEARCH_RESULTS_EMPTY_BODY')}
          illustration="EmptyStateSearchSad"
        />
      </EmptyStateWrapper>
    );
  }

  const renderZoomTo3dButton = (value: Instance) => {
    return (
      <ZoomTo3DButton
        selectedInstance={value}
        is3dMapped={displayOnlyMapped3dData}
        onZoomButtonClick={onZoomButtonClick}
      />
    );
  };

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
        selectedExternalId={selectedInstance?.externalId}
        type={type}
        values={values}
        disable3dPreview
        selected={selected}
        renderHoverButton={renderZoomTo3dButton}
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

const EmptyStateWrapper = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
