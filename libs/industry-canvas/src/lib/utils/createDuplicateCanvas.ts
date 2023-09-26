import { toast } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { TOAST_POSITION } from '../constants';
import { SerializedCanvasDocument } from '../types';

import { CreateSerializedCanvasDocumentOptions } from './createSerializedCanvasDocument';

export const createDuplicateCanvas = async ({
  canvas,
  createCanvas,
  t,
}: {
  canvas: SerializedCanvasDocument;
  createCanvas: (
    args?: CreateSerializedCanvasDocumentOptions | undefined
  ) => Promise<SerializedCanvasDocument>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => any;
}) => {
  const { externalId } = await createCanvas({
    name: `${canvas.name} (${t(
      translationKeys.COMMON_CANVAS_NAME_COPY,
      'copy'
    )})`,
    ...canvas.data,
  });

  toast.success(
    t(
      translationKeys.COMMON_CANVAS_DUPLICATE_TOAST,
      'This is your private copy of the canvas. You can share it with other people.'
    ),
    {
      toastId: 'industry-canvas-revoke-invitation-success',
      position: TOAST_POSITION,
    }
  );

  return { externalId };
};
