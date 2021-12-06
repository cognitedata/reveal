import React from 'react';
import styled from 'styled-components';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { Tooltip, Button } from '@cognite/cogs.js';

export const AssetPreviewSidebar = ({
  assetId,
  onClose,
}: {
  assetId: number | null;
  onClose: () => void;
}) => {
  const closePreviewButton = (
    <Tooltip content="Close preview">
      <Button icon="Close" onClick={() => onClose()} />
    </Tooltip>
  );

  return (
    <SidebarContainer>
      {assetId && (
        <PreviewWrapper>
          <AssetPreview assetId={assetId} actions={closePreviewButton} />
        </PreviewWrapper>
      )}
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: absolute;
  width: 600px;
  height: 100%;
  top: 0;
  right: 0;
  z-index: 100;
  background: var(--cogs-white);
  overflow: auto;
`;

const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
`;
