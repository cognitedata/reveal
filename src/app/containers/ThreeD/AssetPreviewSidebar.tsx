import styled from 'styled-components';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { Tooltip, Button } from '@cognite/cogs.js';
import { trackUsage } from 'app/utils/Metrics';
import { ResourceTabType } from 'app/containers/ThreeD/NodePreview';

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
        onClick={() => {
          onClose();
          trackUsage('Exploration.Preview.ThreeDModel', { assetId });
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
