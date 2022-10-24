import styled from 'styled-components';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { Tooltip, Button } from '@cognite/cogs.js';

export const AssetPreviewSidebar = ({
  assetId,
  onClose,
}: {
  assetId: number;
  onClose: () => void;
}) => {
  const closePreviewButton = (
    <Tooltip content="Close preview">
      <Button icon="Close" onClick={onClose} />
    </Tooltip>
  );

  return (
    <PreviewWrapper>
      <AssetPreview
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
