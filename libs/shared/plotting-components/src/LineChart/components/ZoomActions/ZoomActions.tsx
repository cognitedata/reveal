import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { ZoomActionsWrapper } from './elements';
import { PlotElement } from '../Plot';
import { AxisDirectionConfig } from '../../types';
import { useAxisDirection } from '../../hooks/useAxisDirection';
import { getPlotZoomRange } from '../../utils/getPlotZoomRange';

export interface ZoomActionsProps {
  plotRef: React.RefObject<PlotElement>;
  zoomDirectionConfig: AxisDirectionConfig;
}

export const ZoomActions: React.FC<ZoomActionsProps> = ({
  plotRef,
  zoomDirectionConfig,
}) => {
  const zoomDirection = useAxisDirection(zoomDirectionConfig);

  const handleZoom = (mode: 'zoom-in' | 'zoom-out') => {
    if (!zoomDirection) {
      return;
    }

    const newRange = getPlotZoomRange(plotRef.current, zoomDirection, mode);

    if (newRange) {
      plotRef.current?.setPlotRange(newRange);
    }
  };

  if (zoomDirectionConfig === false) {
    return null;
  }

  return (
    <ZoomActionsWrapper>
      <Button
        icon="ZoomOut"
        aria-label="zoom-out"
        onClick={() => handleZoom('zoom-out')}
      />

      <Button
        icon="Restore"
        aria-label="zoom-reset"
        onClick={plotRef.current?.resetPlotRange}
      />

      <Button
        icon="ZoomIn"
        aria-label="zoom-in"
        onClick={() => handleZoom('zoom-in')}
      />
    </ZoomActionsWrapper>
  );
};
