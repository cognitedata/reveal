import { PageTitle } from '@cognite/cdf-utilities';
import { Button, Title, Flex } from '@cognite/cogs.js';
import { ResourceIcons } from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { TitleRowWrapper } from '@data-exploration-app/components/ResourceTitleRow';

import { APPLICATION_ID_CANVAS } from '@data-exploration-app/utils/constants';
import { Canvas } from '@data-exploration-components/containers/Files/Canvas/Canvas';
import { useCanvasFilesFromUrl } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import React from 'react';
import styled from 'styled-components';

export const CanvasPage = () => {
  const sdk = useSDK();
  const { files } = useCanvasFilesFromUrl();
  const [unifiedViewerRef, setUnifiedViewerRef] =
    React.useState<UnifiedViewer | null>(null);

  const onDownloadPress = () => {
    unifiedViewerRef?.exportWorkspaceToPdf();
  };

  return (
    <>
      <PageTitle title="Multiple files" />
      <TitleRowWrapper>
        <PreviewLinkWrapper>
          <Flex alignItems="center">
            <ResourceIcons type="file" style={{ marginRight: '10px' }} />
            <Name level="3">Multiple files</Name>
          </Flex>
        </PreviewLinkWrapper>

        <StyledGoBackWrapper>
          <Button
            icon={'Download'}
            aria-label="Download"
            onClick={onDownloadPress}
          />
        </StyledGoBackWrapper>
      </TitleRowWrapper>
      <PreviewTabWrapper>
        <Canvas
          id={APPLICATION_ID_CANVAS}
          applicationId={APPLICATION_ID_CANVAS}
          files={files}
          onRef={setUnifiedViewerRef}
        />
      </PreviewTabWrapper>
    </>
  );
};

const PreviewTabWrapper = styled.div`
  height: 100%;
`;

const Name = styled(Title)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledGoBackWrapper = styled.div`
  overflow: hidden;
  flex: 0 0 auto;
`;

const PreviewLinkWrapper = styled.div`
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;
