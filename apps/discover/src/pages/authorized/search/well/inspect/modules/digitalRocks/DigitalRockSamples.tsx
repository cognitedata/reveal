import React, { useState } from 'react';

import get from 'lodash/get';
import head from 'lodash/head';

import { Asset } from '@cognite/sdk';

import EmptyState from 'components/emptyState';
import { Table } from 'components/tablev2';
import { useDigitalRocksSamples } from 'modules/wellSearch/selectors/asset/digitalRocks';

import DialogPopup from '../common/DialogPopup';

import { DigitalRocksSampleWrapper, TableButton } from './elements';
import GrainAnalysis from './GrainAnalysis';

const columns = (rMedianTraskUnit = '', rMeanTraskUnit = '') =>
  [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Description',
      accessor: 'description',
    },
    {
      Header: 'Source',
      accessor: 'source',
    },
    {
      Header: 'Uncertainty',
      accessor: 'metadata.uncertainty',
    },
    {
      Header: 'Volume',
      accessor: 'metadata.volume_id',
    },
    {
      Header: 'Orientation',
      accessor: 'metadata.orientation',
    },
    {
      Header: `Median grain diameter${
        rMedianTraskUnit && `(${rMedianTraskUnit})`
      }`,
      accessor: 'metadata.r_median_trask',
    },
    {
      Header: `Mean grain diameter${rMeanTraskUnit && `(${rMeanTraskUnit})`}`,
      accessor: 'metadata.r_mean_trask',
    },
    {
      Header: 'Dimension(voxels) - (X,Y,Z)',
      accessor: 'metadata.dimensionXYZ',
    },
  ].map((row) => ({ ...row, width: 'auto' }));

export type Props = {
  digitalRock: Asset;
};

const TABLE_ROW_HEIGHT = 49;

const DigitalRockSamples: React.FC<Props> = ({ digitalRock }) => {
  const { isLoading, digitalRockSamples } = useDigitalRocksSamples([
    digitalRock,
  ]);

  const [viewGrainAnalysis, setViewGrainAnalysis] = useState<
    Asset | undefined
  >();

  const rowCount = digitalRockSamples.length;

  const tableHeight = (rowCount + 1) * TABLE_ROW_HEIGHT;

  const options = {
    checkable: false,
    height: `${tableHeight}px`,
    hideBorders: false,
    disableSorting: true,
    flex: false,
  };

  const openGrainAnalysis = (asset: Asset) => {
    const digitalRockSample = {
      ...asset,
      metadata: {
        ...asset.metadata,
        wellboreId: digitalRock.parentId?.toString(),
      },
    };
    setViewGrainAnalysis(digitalRockSample as Asset);
  };

  const grainAnalysisClosed = () => {
    setViewGrainAnalysis(undefined);
  };

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }

  const rMedianTraskUnit = digitalRockSamples.length
    ? get(head(digitalRockSamples), 'metadata.r_median_trask_unit', '')
    : '';
  const rMeanTraskUnit = digitalRockSamples.length
    ? get(head(digitalRockSamples), 'metadata.r_mean_trask_unit', '')
    : '';
  const extendedColumns = [
    ...columns(rMedianTraskUnit, rMeanTraskUnit),
    {
      id: 'grain-analysis-column',
      accessor: (asset: Asset) => (
        <TableButton
          data-testid="grain-analysis-btn"
          onClick={() => openGrainAnalysis(asset)}
          color="primary"
        >
          Grain Analysis
        </TableButton>
      ),
    },
  ];

  return (
    <>
      <DigitalRocksSampleWrapper>
        <Table<Asset>
          scrollTable
          id="digital-rock-samples-result-table"
          data={digitalRockSamples}
          columns={extendedColumns}
          options={options}
        />
      </DigitalRocksSampleWrapper>
      <DialogPopup
        isopen={viewGrainAnalysis !== undefined}
        handleClose={grainAnalysisClosed}
      >
        {viewGrainAnalysis && (
          <GrainAnalysis digitalRockSample={viewGrainAnalysis} />
        )}
      </DialogPopup>
    </>
  );
};

export const DigitalRockSamplesTable = React.memo(DigitalRockSamples);
