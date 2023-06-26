import styled from 'styled-components';

import { Tooltip, Button } from '@cognite/cogs.js';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import { ResourceTabType } from '@data-exploration-app/containers/ThreeD/NodePreview';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useTranslation } from '@data-exploration-lib/core';

export const AssetPreviewSidebar = ({
  assetId,
  onClose,
  tab = 'details',
}: {
  assetId: number;
  onClose: () => void;
  tab?: ResourceTabType;
}) => {
  const { t } = useTranslation();
  const closePreviewButton = (
    <Tooltip content={t('CLOSE_PREVIEW', 'Close preview')}>
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
