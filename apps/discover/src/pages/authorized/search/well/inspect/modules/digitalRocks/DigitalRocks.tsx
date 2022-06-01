import { useWellInspectWellboreExternalAssetIdMap } from 'domain/wells/well/internal/transformers/useWellInspectIdMap';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row } from 'react-table';

import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { shortDateTime } from 'utils/date';

import { Asset } from '@cognite/sdk';

import EmptyState from 'components/EmptyState';
import { Loading } from 'components/Loading/Loading';
import { Table } from 'components/Tablev3';
import { useDeepEffect } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { DIGITAL_ROCKS_ACCESSORS } from 'modules/wellSearch/constants';
import { useSelectedWellBoresDigitalRocks } from 'modules/wellSearch/selectors/digitalRocks';
import { getWellboreExternalAssetIdReverseMap } from 'modules/wellSearch/utils/common';

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
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
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
    () => columns(userPreferredUnit, dimensionUnit),
    [userPreferredUnit, dimensionUnit]
  );

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
  );
};

export default DigitalRocks;
