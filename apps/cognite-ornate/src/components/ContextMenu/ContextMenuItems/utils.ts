import Konva from 'konva';

export const defaultColor = `rgba(255, 220, 127, 1)`;

export const defaultColorTransparent = `rgba(255, 220, 127, 0)`;

/* eslint-disable no-bitwise */
export const getRGBAString = (
  r: number,
  g: number,
  b: number,
  a: number
): string => {
  return `rgba(${r},${g},${b},${a})`;
};

export const getOpacityFromRGBA = (rgba: string) => {
  return Number(rgba.match(/[^,]+(?=\))/));
};

export const setOpacityFromRGBA = (rgba: string, value: string) => {
  return rgba.replace(/[^,]+(?=\))/, value);
};

export const hexToRGBA = (hex: string, returnString = true) => {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = `0x${c.join('')}`;
    return returnString
      ? `rgba(${[
          ((c as any) >> 16) & 255,
          ((c as any) >> 8) & 255,
          c as any & 255,
        ].join(',')},1)`
      : {
          r: ((c as any) >> 16) & 255,
          g: ((c as any) >> 8) & 255,
          b: c as any & 255,
          a: 1,
        };
  }
  throw new Error('Bad Hex');
};

export const isHexColor = (color: string) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const getInitialOpacity = (node: Konva.Node, fillOpacity?: boolean) => {
  let color = fillOpacity ? node.getAttr('fill') : node.getAttr('stroke');
  if (isHexColor(color)) {
    color = hexToRGBA(color);
  }
  if (!color) {
    color = defaultColorTransparent;
  }
  return getOpacityFromRGBA(color) || 0;
};

export const getAlignCenterPositionX = (
  x: number,
  width: number,
  clientWidth: number
) => {
  const contextMenuWidth = clientWidth;
  return x + width / 2 - contextMenuWidth / 2;
};
