import { useState } from 'react';

import { toast } from '@cognite/cogs.js';

import { TOAST_POSITION } from '../constants';
import { useIndustryCanvasContext } from '../IndustryCanvasContext';
import { SerializedCanvasDocument } from '../types';

const useCanvasDeletion = () => {
  const [canvasToDelete, setCanvasToDelete] = useState<
    SerializedCanvasDocument | undefined
  >(undefined);

  const { isArchivingCanvas, archiveCanvas } = useIndustryCanvasContext();

  const onDeleteCanvasConfirmed = (canvas: SerializedCanvasDocument) => {
    archiveCanvas(canvas);
    toast.success(`Deleted canvas '${canvas.name}'`, {
      toastId: `deleted-canvas-${canvas.externalId}`,
      position: TOAST_POSITION,
    });
    setCanvasToDelete(undefined);
  };

  return {
    canvasToDelete,
    setCanvasToDelete,
    onDeleteCanvasConfirmed,
    isDeletingCanvas: isArchivingCanvas,
  };
};

export default useCanvasDeletion;
