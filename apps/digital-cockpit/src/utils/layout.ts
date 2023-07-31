import { BoardLayoutPayloadItem } from 'store/layout/types';
import { GridStackWidget } from 'gridstack';

const INFOGRAPHICS_WIDTH = 3;
const INFOGRAPHICS_HEIGHT = 2;

export const mapGridWidgetToBoardLayout = (
  gridWidget: GridStackWidget[]
): BoardLayoutPayloadItem[] =>
  gridWidget.map(
    ({ id, x, y, h, w }) =>
      ({
        key: id,
        layout: { x, y, w, h },
      } as BoardLayoutPayloadItem)
  );

export const makeDefaultBoardLayout = (type: string | null = '') => ({
  x: undefined,
  y: undefined,
  w: type === 'infographics' ? INFOGRAPHICS_WIDTH : 1, // remove condition in the next release
  h: type === 'infographics' ? INFOGRAPHICS_HEIGHT : 1,
});
