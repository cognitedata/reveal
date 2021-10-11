import React, { useCallback, useMemo, useState } from 'react';
import { Row } from 'react-table';

import get from 'lodash/get';
import head from 'lodash/head';
import uniq from 'lodash/uniq';

import { Asset } from '@cognite/sdk';

import EmptyState from 'components/emptyState';
import { Table } from 'components/tablev2';
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
      accessor: 'metadata.parent_image_id',
    },
    {
      Header: 'Timestamp',
      accessor: 'metadata.created_date',
    },
    {
      Header: 'Core identifier',
      accessor: 'metadata.core_id',
    },
    {
      Header: 'Plug identifier',
      accessor: 'metadata.plug_id',
    },
    {
      Header: 'Source of material',
      accessor: 'metadata.plug_type',
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
  ].map((row) => ({ ...row, width: 'auto' }));

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

  const depthUnit = filteredDigitalRocks.length
    ? get(head(filteredDigitalRocks), 'metadata.plug_depth_unit', '')
    : '';

  const dimensionUnit = filteredDigitalRocks.length
    ? get(head(filteredDigitalRocks), 'metadata.image_resolution_unit', '')
    : '';

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
        columns={columns(depthUnit, dimensionUnit)}
        options={tableOptions}
        expandedIds={expandedIds}
        handleRowClick={handleRowClick}
        renderRowSubComponent={renderRowSubComponent}
      />
    </>
  );
};

export default DigitalRocks;
