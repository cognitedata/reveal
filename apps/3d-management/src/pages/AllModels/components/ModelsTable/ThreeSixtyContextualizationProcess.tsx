import { Row } from '@tanstack/react-table';
import { ColorsTagDetection } from '@vision/constants/Colors';

import { Button } from '@cognite/cogs.js';

import { Image360Data } from '@data-exploration-lib/domain-layer';

import PermissioningHintWrapper from '../../../../components/PermissioningHintWrapper';
import { InternalThreeDModelData } from '../../types';

export const ThreeSixtyContextualizationProcess = ({
  row,
  showAssetTagDetectionButton,
  onRunAssetTagClick,
}: {
  row: Row<InternalThreeDModelData>;
  showAssetTagDetectionButton: boolean;
  onRunAssetTagClick: (image360id: string) => void;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${row.depth * 2}rem`,
      }}
    >
      <PermissioningHintWrapper hasPermission={showAssetTagDetectionButton}>
        <Button
          icon="Assets"
          size="small"
          disabled={!showAssetTagDetectionButton}
          style={
            showAssetTagDetectionButton
              ? {
                  backgroundColor: ColorsTagDetection.backgroundColor,
                  color: ColorsTagDetection.color,
                }
              : {
                  backgroundColor: 'var(--cogs-surface--medium)',
                  color: 'var(--cogs-text-color--secondary)',
                }
          }
          onClick={() => {
            onRunAssetTagClick((row.original as Image360Data).siteId);
          }}
        >
          Run Asset tag detection
        </Button>
      </PermissioningHintWrapper>
    </div>
  );
};
