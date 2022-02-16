import Konva from 'konva';

const isNodeInView = (node: Konva.Node, stage: Konva.Stage) => {
  const box = node.getClientRect();
  if (
    box.x > stage.width() ||
    box.x < -box.width ||
    box.y > stage.height() ||
    box.y < -box.height
  ) {
    return false;
  }
  return true;
};

export default isNodeInView;
