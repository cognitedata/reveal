import React from 'react';
import styled from 'styled-components';
import { ToolBar, ToolBarButton } from '@cognite/cogs.js';

export const ZoomButtonsWrapper = styled.div`
  position: absolute;
  bottom: 22px;
  transform: translate(-50%, 0);
  left: 50%;
`;
interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  const zoomButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'ZoomIn',
        onClick: () => onZoomIn(),
        description: 'Zoom in',
      },
      {
        icon: 'Refresh',
        onClick: () => onReset(),
        description: 'Reset zoom',
      },
      {
        icon: 'ZoomOut',
        onClick: () => onZoomOut(),
        description: 'Zoom out',
      },
    ],
  ];

  return (
    <ZoomButtonsWrapper>
      <ToolBar direction="horizontal" buttonGroups={zoomButtonGroups} />
    </ZoomButtonsWrapper>
  );
};
