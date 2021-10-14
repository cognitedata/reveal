import React, { useState } from 'react';

import { Asset } from '@cognite/sdk';

import EmptyState from 'components/emptyState';
import { Table } from 'components/tablev2';
import { DIGITAL_ROCK_SAMPLES_ACCESSORS } from 'modules/wellSearch/constants';
import { useDigitalRocksSamples } from 'modules/wellSearch/selectors/asset/digitalRocks';

import DialogPopup from '../common/DialogPopup';

import { DigitalRocksSampleWrapper, TableButton } from './elements';
import GrainAnalysis from './GrainAnalysis';

const columns = [
  {
    Header: 'Name',
    accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.NAME,
  },
  {
    Header: 'Description',
    accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.DESCRIPTION,
  },
  {
    Header: 'Source',
    accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.SOURCE,
  },
  {
    Header: 'Uncertainty',
    accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.UNCERTAINTY,
  },
  {
    Header: 'Volume',
    accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.VOLUME_ID,
  },
  {
    Header: 'Orientation',
    accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.ORIENTATION,
  },
  {
    Header: 'Median grain diameter(microns)',
    accessor: 'metadata.rMedianTrask',
  },
  {
    Header: 'Mean grain diameter(microns)',
    accessor: 'metadata.rMeanTrask',
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

  const extendedColumns = [
    ...columns,
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
