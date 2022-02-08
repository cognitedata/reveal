import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row } from 'react-table';

import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { shortDateTime } from 'utils/date';

import { Asset } from '@cognite/sdk';

import EmptyState from 'components/emptyState';
import { Loading } from 'components/loading/Loading';
import { Table } from 'components/tablev3';
import { useDeepEffect } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWellbores } from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreExternalAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';
import { DIGITAL_ROCKS_ACCESSORS } from 'modules/wellSearch/constants';
import { useSelectedWellBoresDigitalRocks } from 'modules/wellSearch/selectors/asset/digitalRocks';
import { Wellbore } from 'modules/wellSearch/types';
import { getWellboreExternalAssetIdReverseMap } from 'modules/wellSearch/utils/common';

import { WellboreSelectionWrapper } from '../../elements';
import WellboreSelectionDropdown from '../common/WellboreSelectionDropdown';

import { DigitalRockSamplesTable } from './DigitalRockSamples';

const columns = (depthUnit = '', dimensionUnit = '') =>
  [
    {
      Header: 'Digital Rock identifier',
      accessor: DIGITAL_ROCKS_ACCESSORS.IDENTIFIER,
      width: '240px',
      maxWidth: '1fr',
    },
    {
      Header: 'Timestamp',
      width: '240px',
      accessor: (digitalRock: Asset) => shortDateTime(digitalRock.createdTime),
    },
    {
      Header: 'Core identifier',
      width: '140px',
      accessor: DIGITAL_ROCKS_ACCESSORS.CORE_IDENTIFIER,
    },
    {
      Header: 'Plug identifier',
      width: '140px',
      accessor: DIGITAL_ROCKS_ACCESSORS.PLUG_IDENTIFIER,
    },
    {
      Header: 'Source of material',
      width: '140px',
      accessor: DIGITAL_ROCKS_ACCESSORS.SOURCE_OF_METRIAL,
    },
    {
      Header: `MD Depth${depthUnit && `(${depthUnit})`} / Depth Datum`,
      width: '140px',
      accessor: 'metadata.plugDepthAndDatum',
    },
    {
      Header: 'Voxel resolution',
      width: '140px',
      accessor: 'metadata.image_resolution',
    },
    {
      Header: `Dimension${dimensionUnit && `(${dimensionUnit})`} - (X,Y,Z)`,
      width: '140px',
      accessor: 'metadata.dimensionXYZ',
    },
  ].map((row) => ({ ...row, width: '250px' }));

const tableOptions = {
  checkable: false,
  flex: false,
  hideScrollbars: true,
  expandable: true,
};

type SelectedMap = {
  [key: string]: boolean;
};

export const DigitalRocks: React.FC = () => {
  const { isLoading, digitalRocks } = useSelectedWellBoresDigitalRocks();
  const userPrefferedUnit = useUserPreferencesMeasurement();
  const wellboreAssetIdMap = useWellInspectWellboreExternalAssetIdMap();
  const wellboreAssetIdReverseMap =
    getWellboreExternalAssetIdReverseMap(wellboreAssetIdMap);

  const [selectedWellbores, setSelectedWellbores] = useState<Wellbore[]>([]);
  const [wellboreIdsWithDigitalRocks, setWellboreIdsWithDigitalRocks] =
    useState<string[]>([]);

  useDeepEffect(() => {
    setWellboreIdsWithDigitalRocks(
      digitalRocks.reduce((previous, current) => {
        if (
          current.parentExternalId &&
          !previous.includes(
            wellboreAssetIdReverseMap[current.parentExternalId]
          )
        ) {
          return [
            ...previous,
            wellboreAssetIdReverseMap[current.parentExternalId],
          ];
        }

        return previous;
      }, [] as string[])
    );
  }, [digitalRocks]);

  const wellboresWithDigitalRocks = useWellInspectSelectedWellbores(
    wellboreIdsWithDigitalRocks
  );

  useEffect(() => {
    if (!selectedWellbores.length && wellboresWithDigitalRocks.length) {
      setSelectedWellbores([wellboresWithDigitalRocks[0]]);
    }
  }, [wellboresWithDigitalRocks]);

  const [expandedIds, setExpandedIds] = useState<SelectedMap>({});

  const selectedWellboreIdsMap = useMemo(
    () =>
      selectedWellbores.reduce(
        (previous, current) => ({ ...previous, [current.id]: true }),
        {} as SelectedMap
      ),
    [selectedWellbores]
  );

  const filteredDigitalRocks = useMemo(
    () =>
      digitalRocks.filter((row) =>
        row.parentExternalId
          ? selectedWellboreIdsMap[
              wellboreAssetIdReverseMap[row.parentExternalId]
            ]
          : false
      ),
    [digitalRocks, selectedWellboreIdsMap]
  );

  const dimensionUnit = useMemo(
    () =>
      get(head(filteredDigitalRocks), DIGITAL_ROCKS_ACCESSORS.DIMENSION_UNIT),
    [filteredDigitalRocks]
  );

  const columnsWithUserPrefferedUnits = useMemo(
    () => columns(userPrefferedUnit, dimensionUnit),
    [userPrefferedUnit, dimensionUnit]
  );

  const onSelectWellbore = (selectedWellboreList: Wellbore[]) => {
    setSelectedWellbores(selectedWellboreList);
  };

  const handleRowClick = useCallback((row: Row & { isSelected: boolean }) => {
    const digitalRock = row.original as Asset;
    setExpandedIds((state) => ({
      ...state,
      [digitalRock.id]: !state[digitalRock.id],
    }));
  }, []);

  const renderRowSubComponent = useCallback(
    ({ row }) => (
      <DigitalRockSamplesTable digitalRock={row.original as Asset} />
    ),
    []
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isEmpty(digitalRocks)) {
    return <EmptyState />;
  }

  return (
    <>
      <WellboreSelectionWrapper>
        <WellboreSelectionDropdown
          onSelectWellbore={onSelectWellbore}
          allWellbores={wellboresWithDigitalRocks}
          selectedWellbores={selectedWellbores}
        />
      </WellboreSelectionWrapper>
      <Table<Asset>
        scrollTable
        id="digital-rocks-result-table"
        data={filteredDigitalRocks}
        columns={columnsWithUserPrefferedUnits}
        options={tableOptions}
        expandedIds={expandedIds}
        handleRowClick={handleRowClick}
        renderRowSubComponent={renderRowSubComponent}
      />
    </>
  );
};

export default DigitalRocks;
