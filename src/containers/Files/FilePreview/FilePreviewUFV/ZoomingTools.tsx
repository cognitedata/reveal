import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import React from 'react';
import { UnifiedViewer } from '@cognite/unified-file-viewer';

export const ZoomingTools = ({
  fileViewerRef,
}: {
  fileViewerRef: UnifiedViewer | null;
}) => {
  const handleZoomOut = () => {
    fileViewerRef?.zoomOut();
  };

  const handleZoomIn = () => {
    fileViewerRef?.zoomIn();
  };

  const resetZoom = () => {
    fileViewerRef?.zoomToFit();
  };

  return (
    <ToolBar>
      <ToolContainer>
        <Button
          icon="ZoomIn"
          aria-label="Zoom in"
          size="small"
          onClick={handleZoomIn}
        />
        <Button
          icon="Restore"
          aria-label="Zoom Reset"
          size="small"
          onClick={resetZoom}
        />
        <Button
          icon="ZoomOut"
          aria-label="Zoom out"
          size="small"
          onClick={handleZoomOut}
        />
      </ToolContainer>
    </ToolBar>
  );
};

const ToolBar = styled.div`
  position: absolute;
  z-index: 100;
  right: 24px;
  bottom: 24px;
`;

const ToolContainer = styled.div`
  display: inline-flex;
  border-radius: 4px;
  overflow: hidden;
  .cogs-btn {
    border-radius: 0;
  }
`;
