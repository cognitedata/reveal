import { useQuery } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';

import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import {
  Image360Data,
  useFilesAggregateBySiteId,
} from '@data-exploration-lib/domain-layer';

import PermissioningHintWrapper from '../../../../components/PermissioningHintWrapper';
import { InternalThreeDModelData } from '../../types';

import { getFileCountAggregateByLabelQuery } from './getFileCountAggregateByLabel';

const FINISHED_ASSET_TAG_DETECTION_LABEL = 'asset_tag_detection_finished';
const RUN_ASSET_TAG_DETECTION_LABEL = 'run_asset_tag_detection';

const onOpenInDataExplorer = () => {
  // Open in new tab
  window.open(createLink('/vision/explore'), '_blank');
};

export const ThreeSixtyContextualizationProcess = ({
  row,
  showAssetTagDetectionButton,
  onRunAssetTagClick,
}: {
  row: Row<InternalThreeDModelData>;
  showAssetTagDetectionButton: boolean;
  onRunAssetTagClick: (image360id: string) => void;
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
  const isRunAssetTagDetectionButtonDisabled =
    !showAssetTagDetectionButton ||
    (image360AssetTagDetectionRunningFileCount ?? 0) > 0;

  const assetTagDetectionButtonType =
    (image360AssetTagDetectionRunningFileCount ?? 0) > 0
      ? 'secondary'
      : 'primary';

  const isAssetTagDetectionFinished =
    image360CollectionFileCount !== undefined &&
    image360AssetTagDetectionFinishedFileCount !== undefined &&
    image360AssetTagDetectionFinishedFileCount >=
      6 * image360CollectionFileCount;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${row.depth * 2}rem`,
        gap: '3px',
      }}
    >
      <PermissioningHintWrapper hasPermission={showAssetTagDetectionButton}>
        <Button
          size="small"
          disabled={isRunAssetTagDetectionButtonDisabled}
          type={assetTagDetectionButtonType}
          onClick={() => {
            onRunAssetTagClick(model.siteId);
          }}
        >
          Run Asset tag detection
        </Button>
        {isAssetTagDetectionFinished && (
          <Button
            onClick={onOpenInDataExplorer}
            icon="ExternalLink"
            type="secondary"
            size="small"
          >
            Review
          </Button>
        )}
      </PermissioningHintWrapper>
    </div>
  );
};
