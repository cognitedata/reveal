import React from 'react';

import styled from 'styled-components';

import { TitleRowWrapper } from '@data-exploration-app/components/ResourceTitleRow';
import { APPLICATION_ID_CANVAS } from '@data-exploration-app/utils/constants';
import { Canvas } from '@data-exploration-components/containers/Files/Canvas/Canvas';
import { useCanvasFilesFromUrl } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';

import { PageTitle } from '@cognite/cdf-utilities';
import { Button, Title, Flex, Tooltip } from '@cognite/cogs.js';
import { ResourceIcons } from '@cognite/data-exploration';
import { UnifiedViewer } from '@cognite/unified-file-viewer';

export const CanvasPage = () => {
  const { files } = useCanvasFilesFromUrl();
  const [unifiedViewerRef, setUnifiedViewerRef] =
    React.useState<UnifiedViewer | null>(null);

  const onDownloadPress = () => {
    unifiedViewerRef?.exportWorkspaceToPdf();
  };

  return (
    <>
      <PageTitle title="Canvas" />
      <TitleRowWrapper>
        <PreviewLinkWrapper>
          <Flex alignItems="center">
            <ResourceIcons type="file" style={{ marginRight: '10px' }} />
            <Name level="3">Canvas</Name>
          </Flex>
        </PreviewLinkWrapper>

        <StyledGoBackWrapper>
          <Tooltip content="Download canvas as PDF">
            <Button
              icon="Download"
              aria-label="Download"
              onClick={onDownloadPress}
            />
          </Tooltip>
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
