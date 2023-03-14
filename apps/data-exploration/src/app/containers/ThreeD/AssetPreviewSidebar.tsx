import styled from 'styled-components';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import { Tooltip, Button } from '@cognite/cogs.js';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { ResourceTabType } from '@data-exploration-app/containers/ThreeD/NodePreview';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';

export const AssetPreviewSidebar = ({
  assetId,
  onClose,
  tab = 'details',
}: {
  assetId: number;
  onClose: () => void;
  tab?: ResourceTabType;
}) => {
  const closePreviewButton = (
    <Tooltip content="Close preview">
      <Button
        icon="Close"
        aria-label="close-assets-preview-button"
        onClick={() => {
          onClose();
          trackUsage(EXPLORATION.THREED_ACTION.ASSET_SELECTED, {
            assetId,
            resourceType: '3D',
          });
        }}
      />
    </Tooltip>
  );

  return (
    <PreviewWrapper>
      <AssetPreview
        tab={tab}
        assetId={assetId}
        actions={closePreviewButton}
        hideDefaultCloseActions
      />
    </PreviewWrapper>
  );
};

const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
`;
