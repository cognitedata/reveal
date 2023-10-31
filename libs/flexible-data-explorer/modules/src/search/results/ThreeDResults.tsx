import styled from 'styled-components';

import { useSearchDataTypesQuery } from '@fdx/services/dataTypes/queries/useSearchDataTypesQuery';
import {
  useSearchCategoryParams,
  useSelectedInstanceParams,
  useViewModeParams,
} from '@fdx/shared/hooks/useParams';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { Instance } from '@fdx/shared/types/services';
import { isEqual } from 'lodash';

import { EmptyState, Skeleton } from '@cognite/cogs.js';

import { useSearchMappedEquipment } from '../../ThreeD/providers/Mapped3DEquipmentProvider';
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
  const [, setViewMode] = useViewModeParams();
  const [selectedInstance, setSelectedInstance] = useSelectedInstanceParams();

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
        <Link onClick={() => setViewMode('list')}>
          {t('SEARCH_RESULTS_3D_NO_RESULTS_C2A')}
        </Link>
      </EmptyStateWrapper>
    );
  }

  const handleOnClick = (instance: Instance) => {
    setSelectedInstance(instance);
    onZoomButtonClick?.(instance);
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
        onItemClick={handleOnClick}
        disablePreview={(instance) => {
          return isEqual(instance, selectedInstance);
        }}
        // renderHoverButton={renderZoomTo3dButton}
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

const Link = styled.a`
  text-decoration: underline;
`;
