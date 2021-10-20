import { ICogniteOrnateTool, OrnatePDFDocument } from 'types';

import { Tool } from './Tool';

export class MoveTool extends Tool implements ICogniteOrnateTool {
  cursor = 'move';

  isDocumentInView = (document: OrnatePDFDocument) => {
    const box = document.group.getClientRect();
    if (
      box.x > window.innerWidth ||
      box.x < -box.width ||
      box.y > window.innerHeight ||
      box.y < -box.height
    ) {
      return false;
    }
    return true;
  };
  onInit = () => {
    this.ornateInstance.stage.setDraggable(true);
  };

  onDestroy = () => {
    this.ornateInstance.stage.setDraggable(false);
  };

  onMouseUp = () => {
    this.ornateInstance.documents.forEach((doc) => {
      if (this.isDocumentInView(doc)) {
        doc.kImage.show();
      } else {
        doc.kImage.hide();
      }
    });
  };
}
