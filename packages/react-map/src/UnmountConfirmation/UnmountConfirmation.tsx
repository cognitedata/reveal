import { drawModes, DrawMode } from '../FreeDraw';
import { MapType } from '../types';

import { UnmountConfirmationListner } from './UnmountConfirmationListner';

/*
 * A simple version of the unmount listner
 * If you need to customise this
 * then use UnmountConfirmationListner directly
 */
export const UnmountConfirmation = ({
  map,
  drawMode,
  setDrawMode,
}: {
  map?: MapType;
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
}) => {
  const enableUnmountWarning = drawMode === drawModes.DRAW_POLYGON;

  const handleCancelUnmountWarning = () => {
    if (drawMode === drawModes.DRAW_POLYGON) {
      setDrawMode(drawModes.SIMPLE_SELECT);
    } else {
      setDrawMode(drawModes.DRAW_POLYGON);
    }
  };

  return (
    <UnmountConfirmationListner
      map={map}
      enabled={enableUnmountWarning}
      onCancel={handleCancelUnmountWarning}
    />
  );
};
