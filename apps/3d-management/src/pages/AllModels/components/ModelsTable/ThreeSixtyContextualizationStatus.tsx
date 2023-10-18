import { useQuery } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';

import { Button } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import {
  Image360Data,
  useFilesAggregateBySiteId,
} from '@data-exploration-lib/domain-layer';

import { InternalThreeDModelData } from '../../types';

import { getFileCountAggregateByLabelQuery } from './getFileCountAggregateByLabel';
import {
  setStatusButtonIcon,
  setStatusButtonStyle,
  setStatusButtonText,
  UndefindedStatusButton,
} from './stylingThreeSixtyContextualization';

const FINISHED_ASSET_TAG_DETECTION_LABEL = 'asset_tag_detection_finished';
const RUN_ASSET_TAG_DETECTION_LABEL = 'run_asset_tag_detection';

export const ThreeSixtyContextualizationStatus = ({
  row,
}: {
  row: Row<InternalThreeDModelData>;
}) => {
  const model: Image360Data = row.original as Image360Data;
  const sdk = useSDK();
  const { data: image360CollectionFileCount } = useFilesAggregateBySiteId(
    model.siteId,
    'front'
  );

  const { data: image360AssetTagDetectionFinishedFileCount } = useQuery(
    [
      'fileCountAggregateByLabel',
      sdk,
      model.siteId,
      FINISHED_ASSET_TAG_DETECTION_LABEL,
    ],
    getFileCountAggregateByLabelQuery
  );
  const { data: image360AssetTagDetectionRunningFileCount } = useQuery(
    [
      'fileCountAggregateByLabel',
      sdk,
      model.siteId,
      RUN_ASSET_TAG_DETECTION_LABEL,
    ],
    getFileCountAggregateByLabelQuery
  );
  if (
    image360AssetTagDetectionFinishedFileCount === undefined ||
    image360CollectionFileCount === undefined ||
    image360AssetTagDetectionRunningFileCount === undefined
  ) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: `${row.depth * 2}rem`,
        }}
      >
        <UndefindedStatusButton />
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${row.depth * 2}rem`,
      }}
    >
      <Button
        icon={setStatusButtonIcon({
          finishedFileCount: image360AssetTagDetectionFinishedFileCount,
          collectionFileCount: image360CollectionFileCount,
          runningFileCount: image360AssetTagDetectionRunningFileCount,
        })}
        size="small"
        style={setStatusButtonStyle({
          finishedFileCount: image360AssetTagDetectionFinishedFileCount,
          collectionFileCount: image360CollectionFileCount,
          runningFileCount: image360AssetTagDetectionRunningFileCount,
        })}
      >
        {setStatusButtonText({
          finishedFileCount: image360AssetTagDetectionFinishedFileCount,
          collectionFileCount: image360CollectionFileCount,
          runningFileCount: image360AssetTagDetectionRunningFileCount,
        })}
      </Button>
    </div>
  );
};
