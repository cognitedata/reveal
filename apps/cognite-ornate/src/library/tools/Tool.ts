import { KonvaEventObject } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { ICogniteOrnateTool, ShapeSettings } from 'library/types';
import noop from 'lodash/noop';

import { CogniteOrnate } from '../cognite-ornate';

export class Tool implements ICogniteOrnateTool {
  cursor = 'default';
  ornateInstance: CogniteOrnate;
  shapeSettings: ShapeSettings;
  isToolUsingShapeSettings = false;
  constructor(ornateInstance: CogniteOrnate) {
    this.ornateInstance = ornateInstance;
    this.shapeSettings = ornateInstance.shapeSettings;
  }

  onInit = noop;
  onDestroy = noop;

  onMouseDown: (e: KonvaEventObject<MouseEvent>) => void = noop;
  onMouseMove: (e: KonvaEventObject<MouseEvent>) => void = noop;
  onMouseUp: (e: KonvaEventObject<MouseEvent>) => void = noop;
  onAnnotationClick: (e: KonvaEventObject<MouseEvent>, shape: Shape) => void =
    noop;
}
