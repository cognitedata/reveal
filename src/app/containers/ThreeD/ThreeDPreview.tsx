import React, { useEffect, useState } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useParams } from 'react-router-dom';
import {
  use3DModel,
  useDefault3DModelRevision,
} from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import { AssetPreviewSidebar } from 'app/containers/ThreeD/AssetPreviewSidebar';
import { useSearchParamNumber } from 'app/utils/URLUtils';
import { Button, Tooltip } from '@cognite/cogs.js';
import Reveal from './Reveal';
import { AssetMappingsSidebar } from './AssetMappingsSidebar';
import { trackUsage } from 'app/utils/Metrics';

export const ThreeDPreview = ({
  threeDId,
  actions,
}: {
  threeDId: number;
  actions?: React.ReactNode;
}) => {
  const { id } = useParams<{ id: string }>();
  const modelId = parseInt(id!, 10);

  const { data: threeDModel, isLoading } = use3DModel(modelId);
  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const [selectedAssetId, setSelectedAssetId] = useSearchParamNumber('assetId');
  const [isAssetMappingSidebarVisible, setIsAssetMappingSidebarVisible] =
    useState<boolean>(true);
  const { data: revision } = useDefault3DModelRevision(modelId);

  return (
    <>
      <PageTitle title={isLoading ? '...' : threeDModel?.name} />
      <ResourceTitleRow
        title={threeDModel?.name}
        item={{ id: threeDId, type: 'threeD' }}
        afterDefaultActions={actions}
      />
      {revision && (
        <Reveal
          modelId={modelId}
          revisionId={revision.id}
          focusAssetId={selectedAssetId}
        />
      )}
      {!isAssetMappingSidebarVisible && (
        <ToolBarWrapper>
          <Tooltip content="Search">
            <Button
              icon="Search"
              onClick={() => setIsAssetMappingSidebarVisible(true)}
              aria-label="Search"
            />
          </Tooltip>
        </ToolBarWrapper>
      )}
      {isAssetMappingSidebarVisible && (
        <AssetMappingsSidebar
          modelId={threeDModel?.id}
          revisionId={revision?.id}
          selectedAssetId={selectedAssetId}
          setSelectedAssetId={setSelectedAssetId}
          onClose={() => setIsAssetMappingSidebarVisible(false)}
        />
      )}
      {!!selectedAssetId && (
        <AssetPreviewSidebar
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          isBackButtonAvailable={false}
        />
      )}
    </>
  );
};

const ToolBarWrapper = styled.div`
  position: absolute;
  top: 96px;
  left: 96px;

  button {
    margin-left: 5px;
  }
`;
