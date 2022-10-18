import React, { useEffect } from 'react';
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
import Reveal from './Reveal';
import { AssetMappingsSidebar } from './AssetMappingsSidebar';
import { trackUsage } from 'app/utils/Metrics';
import { ExpandButton, FocusAssetButton } from './ThreeDToolbar';
import { Flex } from '@cognite/cogs.js';
import { Slider } from 'app/containers/ThreeD/slider/Slider';
import { Cognite3DModel } from '@cognite/reveal';

export const ThreeDPreview = ({
  threeDId,
  actions,
}: {
  threeDId: number;
  actions?: React.ReactNode;
}) => {
  const { id } = useParams<{ id: string }>();
  const modelId = parseInt(id!, 10);

  const { data: apiThreeDModel, isLoading } = use3DModel(modelId);
  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const [selectedAssetId, setSelectedAssetId] = useSearchParamNumber('assetId');
  const { data: revision } = useDefault3DModelRevision(modelId);

  return (
    <>
      <PageTitle title={isLoading ? '...' : apiThreeDModel?.name} />
      <ResourceTitleRow
        title={apiThreeDModel?.name}
        item={{ id: threeDId, type: 'threeD' }}
        afterDefaultActions={actions}
      />
      <PreviewContainer>
        {revision && (
          <Reveal
            key={`${modelId}.${revision.id}`}
            modelId={modelId}
            revisionId={revision.id}
            focusAssetId={selectedAssetId}
          >
            {({ model, viewer, boundingBox }) => {
              return (
                <SidebarContainer gap={15}>
                  <AssetMappingsSidebar
                    modelId={modelId}
                    revisionId={revision.id}
                    selectedAssetId={selectedAssetId}
                    setSelectedAssetId={setSelectedAssetId}
                  />
                  <Flex gap={4}>
                    <ExpandButton viewer={viewer} viewerModel={model} />
                    {model.type === 'cad' && selectedAssetId && (
                      <FocusAssetButton
                        boundingBox={boundingBox}
                        viewer={viewer}
                        viewerModel={model as Cognite3DModel}
                      />
                    )}
                    {model.type === 'cad' && (
                      <Slider
                        viewer={viewer}
                        viewerModel={model as Cognite3DModel}
                      />
                    )}
                  </Flex>
                </SidebarContainer>
              );
            }}
          </Reveal>
        )}

        {!!selectedAssetId && (
          <MakeDetailsSeethrough>
            <AssetPreviewSidebar
              assetId={selectedAssetId}
              onClose={() => setSelectedAssetId(null)}
              isBackButtonAvailable={false}
            />
          </MakeDetailsSeethrough>
        )}
      </PreviewContainer>
    </>
  );
};

const MakeDetailsSeethrough = styled.div`
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
`;

const SidebarContainer = styled(Flex)`
  position: absolute;
  width: 300px;
  top: 100px;
  left: 30px;
  z-index: 100;
  overflow: hidden;
`;

const PreviewContainer = styled.div`
  height: calc(100% - 85px);
  width: 100%;
`;
