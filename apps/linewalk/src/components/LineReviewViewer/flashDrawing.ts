import { CogniteOrnate, Drawing } from '@cognite/ornate';

import delayMs from '../../utils/delayMs';

const flashDrawing = async (
  ornateRef: CogniteOrnate,
  drawing: Drawing,
  times = 4,
  delay = 200
) => {
  for (let i = 0; i < times; i++) {
    ornateRef.addDrawings(drawing);
    // eslint-disable-next-line no-await-in-loop
    await delayMs(delay);
    if (drawing.id) {
      ornateRef.removeShapeById(drawing.id);
    }
    // eslint-disable-next-line no-await-in-loop
    await delayMs(delay);
  }
};

export default flashDrawing;
