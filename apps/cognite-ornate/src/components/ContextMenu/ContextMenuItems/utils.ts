import Color from 'color';
import Konva from 'konva';

export const getInitialOpacity = (node: Konva.Node, fillOpacity?: boolean) => {
  const nodeColor = fillOpacity ? node.getAttr('fill') : node.getAttr('stroke');
  if (!nodeColor) {
    return 0;
  }
  const color = new Color(nodeColor);
  return color.alpha();
};

const getAlignCenterPositionX = (
  x: number,
  width: number,
  clientWidth: number
) => {
  const contextMenuWidth = clientWidth;
  return x + width / 2 - contextMenuWidth / 2;
};

const getAlignRightPositionX = (
  x: number,
  width: number,
  clientWidth: number
) => {
  const contextMenuWidth = clientWidth;
  return x + width - contextMenuWidth;
};

export const getPositionX = (
  x: number,
  width: number,
  clientWidth: number,
  isGroup: boolean
) => {
  if (isGroup) {
    return getAlignRightPositionX(x, width, clientWidth);
  }
  return getAlignCenterPositionX(x, width, clientWidth);
};
