import { KonvaEventObject } from 'konva/lib/Node';
import { ICogniteOrnateTool } from 'library/types';
import noop from 'lodash/noop';

import { CogniteOrnate } from '../cognite-ornate';

export class Tool implements ICogniteOrnateTool {
  cursor = 'default';
  ornateInstance: CogniteOrnate;
  constructor(ornateInstance: CogniteOrnate) {
    this.ornateInstance = ornateInstance;
  }

  onInit = noop;
  onDestroy = noop;

  onMouseDown: (e: KonvaEventObject<MouseEvent>) => void = noop;
  onMouseMove: (e: KonvaEventObject<MouseEvent>) => void = noop;
  onMouseUp: (e: KonvaEventObject<MouseEvent>) => void = noop;
}
