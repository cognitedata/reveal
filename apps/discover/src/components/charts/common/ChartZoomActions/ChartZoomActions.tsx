import React from 'react';

import { ResetZoomButton, ZoomInButton, ZoomOutButton } from '../Buttons';

import { ChartActionButtonsContainer } from './elements';
import { ChartZoomActionsProps } from './types';

export const ChartZoomActions: React.FC<ChartZoomActionsProps> = React.memo(
  ({ zoomOut, zoomIn, disableZoomOut, disableZoomIn, resetZoom }) => {
    return (
      <ChartActionButtonsContainer>
        <ZoomOutButton onClick={zoomOut} disabled={disableZoomOut} />
        <ZoomInButton onClick={zoomIn} disabled={disableZoomIn} />
        <ResetZoomButton
          onClick={resetZoom}
          disabled={disableZoomOut || disableZoomIn}
        />
      </ChartActionButtonsContainer>
    );
  }
);
