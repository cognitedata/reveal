import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { Tooltip, Button } from '@cognite/cogs.js';

export const AssetPreviewSidebar = ({
  assetId,
  isBackButtonAvailable = true,
}: {
  assetId: number | null;
  isBackButtonAvailable?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(!!assetId), [assetId]);

  if (!visible || !assetId) {
    return null;
  }

  const closePreviewButton = (
    <Tooltip content="Close preview">
      <Button icon="Close" onClick={() => setVisible(false)} />
    </Tooltip>
  );

  return (
    <SidebarContainer>
      <PreviewWrapper>
        <AssetPreview
          assetId={assetId}
          actions={closePreviewButton}
          isBackButtonAvailable={isBackButtonAvailable}
        />
      </PreviewWrapper>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: absolute;
  padding-inline: 8px;
  width: 600px;
  height: calc(100% - 85px);
  top: 85px;
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
