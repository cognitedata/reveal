import { ICogniteOrnateTool } from 'types';

import { Tool } from './Tool';

export class MoveTool extends Tool implements ICogniteOrnateTool {
  cursor = 'move';

  onInit = () => {
    this.ornateInstance.stage.setDraggable(true);
  };

  onDestroy = () => {
    this.ornateInstance.stage.setDraggable(false);
  };

  onMouseUp = () => {
    this.ornateInstance.onViewportChange();
  };
}
