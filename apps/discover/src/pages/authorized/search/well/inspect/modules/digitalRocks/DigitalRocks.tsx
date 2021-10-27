import React, { useCallback, useMemo, useState } from 'react';
import { Row } from 'react-table';

import get from 'lodash/get';
import head from 'lodash/head';
import uniq from 'lodash/uniq';

import { Asset } from '@cognite/sdk';

import { shortDateTime } from '_helpers/date';
import EmptyState from 'components/emptyState';
import { Table } from 'components/tablev3';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { DIGITAL_ROCKS_ACCESSORS } from 'modules/wellSearch/constants';
import { useSelectedWellbores } from 'modules/wellSearch/selectors';
import { useSelectedWellBoresDigitalRocks } from 'modules/wellSearch/selectors/asset/digitalRocks';
import { Wellbore } from 'modules/wellSearch/types';

import { WellboreSelectionWrapper } from '../../elements';
import WellboreSelectionDropdown from '../common/WellboreSelectionDropdown';

import { DigitalRockSamplesTable } from './DigitalRockSamples';

const columns = (depthUnit = '', dimensionUnit = '') =>
  [
    {
      Header: 'Digital Rock identifier',
      accessor: DIGITAL_ROCKS_ACCESSORS.IDENTIFIER,
    },
    {
      Header: 'Timestamp',
      accessor: (digitalRock: Asset) => shortDateTime(digitalRock.createdTime),
    },
    {
      Header: 'Core identifier',
      accessor: DIGITAL_ROCKS_ACCESSORS.CORE_IDENTIFIER,
    },
    {
      Header: 'Plug identifier',
      accessor: DIGITAL_ROCKS_ACCESSORS.PLUG_IDENTIFIER,
    },
    {
      Header: 'Source of material',
      accessor: DIGITAL_ROCKS_ACCESSORS.SOURCE_OF_METRIAL,
    },
    {
      Header: `MD Depth${depthUnit && `(${depthUnit})`} / Depth Datum`,
      accessor: 'metadata.plugDepthAndDatum',
    },
    {
      Header: 'Voxel resolution',
      accessor: 'metadata.image_resolution',
    },
    {
      Header: `Dimension${dimensionUnit && `(${dimensionUnit})`} - (X,Y,Z)`,
      accessor: 'metadata.dimensionXYZ',
    },
  ].map((row) => ({ ...row, width: '250px' }));

const tableOptions = {
  height: '100%',
  checkable: false,
  flex: false,
  hideScrollbars: true,
  expandable: true,
};

type SelectedMap = {
  [key: number]: boolean;
};

export const DigitalRocks: React.FC = () => {
  const { isLoading, digitalRocks } = useSelectedWellBoresDigitalRocks();

  const userPrefferedUnit = useUserPreferencesMeasurement();

  const wellboreIdsWithDigitalRocks = uniq(
    digitalRocks.map((row) => row.parentId)
  ) as number[];

  const wellboresWithDigitalRocks = useSelectedWellbores(
    wellboreIdsWithDigitalRocks
  );

  const [selectedWellbores, setSelectedWellbores] = useState<Wellbore[]>([]);

  if (!selectedWellbores.length && wellboresWithDigitalRocks.length) {
    setSelectedWellbores([wellboresWithDigitalRocks[0]]);
  }

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
      digitalRocks.filter(
        (row) => selectedWellboreIdsMap[row.parentId as number]
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
    // ({ row }: { row: { original: Asset } }) => (
    ({ row }) => (
      <DigitalRockSamplesTable digitalRock={row.original as Asset} />
    ),
    []
  );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
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
