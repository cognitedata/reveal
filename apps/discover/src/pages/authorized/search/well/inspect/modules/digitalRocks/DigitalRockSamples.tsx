import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import EmptyState from 'components/EmptyState';
import { Modal } from 'components/Modal';
import { RowProps, Table } from 'components/Tablev3';
import { useWellInspectWellboreExternalAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';
import { DIGITAL_ROCK_SAMPLES_ACCESSORS } from 'modules/wellSearch/constants';
import { useDigitalRocksSamples } from 'modules/wellSearch/selectors/asset/digitalRocks';
import { getWellboreExternalAssetIdReverseMap } from 'modules/wellSearch/utils/common';
import { FlexRow } from 'styles/layout';

import { DigitalRocksSampleWrapper } from './elements';
import GrainAnalysis from './GrainAnalysis';

export type Props = {
  digitalRock: Asset;
};

const DigitalRockSamples: React.FC<Props> = ({ digitalRock }) => {
  const wellboreAssetIdMap = useWellInspectWellboreExternalAssetIdMap();
  const wellboreAssetIdReverseMap =
    getWellboreExternalAssetIdReverseMap(wellboreAssetIdMap);
  const { isLoading, digitalRockSamples } = useDigitalRocksSamples([
    digitalRock,
  ]);

  const [viewGrainAnalysis, setViewGrainAnalysis] = useState<
    Asset | undefined
  >();

  const columns = [
    {
      Header: 'Name',
      accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.NAME,
      width: '240px',
      maxWidth: '1fr',
    },
    {
      Header: 'Description',
      accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.DESCRIPTION,
      width: '140px',
    },
    {
      Header: 'Source',
      accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.SOURCE,
      width: '140px',
    },
    {
      Header: 'Uncertainty',
      accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.UNCERTAINTY,
      width: '140px',
    },
    {
      Header: 'Volume',
      accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.VOLUME_ID,
      width: '140px',
    },
    {
      Header: 'Orientation',
      accessor: DIGITAL_ROCK_SAMPLES_ACCESSORS.ORIENTATION,
      width: '140px',
    },
    {
      Header: 'Median grain diameter(microns)',
      accessor: 'metadata.rMedianTrask',
      width: '140px',
    },
    {
      Header: 'Mean grain diameter(microns)',
      accessor: 'metadata.rMeanTrask',
      width: '140px',
    },
    {
      Header: 'Dimension(voxels) - (X,Y,Z)',
      accessor: 'metadata.dimensionXYZ',
      width: '140px',
    },
  ].map((row) => ({ ...row, width: 'auto' }));

  const openGrainAnalysis = (asset: Asset) => {
    const digitalRockSample = {
      ...asset,
      metadata: {
        ...asset.metadata,
        wellboreId:
          wellboreAssetIdReverseMap[digitalRock.parentExternalId || 0],
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

  const options = {
    checkable: false,
    flex: false,
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps<Asset>;
  }> = ({ row }) => {
    return (
      <FlexRow>
        <Button
          style={{ whiteSpace: 'nowrap' }}
          onClick={() => openGrainAnalysis(row.original)}
          type="primary"
        >
          Open grain analysis
        </Button>
      </FlexRow>
    );
  };

  return (
    <>
      <DigitalRocksSampleWrapper>
        <Table<Asset>
          scrollTable
          id="digital-rock-samples-result-table"
          data={digitalRockSamples}
          columns={columns}
          options={options}
          indent
          renderRowHoverComponent={renderRowHoverComponent}
        />
      </DigitalRocksSampleWrapper>
      <Modal
        onCancel={grainAnalysisClosed}
        onOk={grainAnalysisClosed}
        fullWidth
        visible={!!viewGrainAnalysis}
      >
        {viewGrainAnalysis && (
          <GrainAnalysis digitalRockSample={viewGrainAnalysis} />
        )}
      </Modal>
    </>
  );
};

export const DigitalRockSamplesTable = React.memo(DigitalRockSamples);
