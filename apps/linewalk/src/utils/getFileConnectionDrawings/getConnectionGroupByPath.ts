import { Drawing } from '@cognite/ornate';

import { Group } from '../../components/LineReviewViewer/ReactOrnate';

import { Path, Point } from './types';

const getIdByPoint = ({ x, y }: Point) => `${x}-${y}`;
const getIdByPath = (path: Path) => path.map(getIdByPoint).join('-');

const getConnectionGroupByPath = (
  path: Path,
  {
    onSelect,
    selectedId,
  }: {
    onSelect: (id: string) => void;
    selectedId: string | undefined;
  }
): Group => {
  const pathId = getIdByPath(path);
  const drawings: Drawing[] = [];

  for (let i = 1; i < path.length; i++) {
    const points = [
      {
        x: path[i - 1].x,
        y: path[i - 1].y,
      },
      {
        x: path[i].x,
        y: path[i].y,
      },
    ];
    const color = selectedId === pathId ? 'magenta' : '#404040';
    drawings.push({
      id: getIdByPath(points),
      type: 'arrow',
      attrs: {
        tension: 0,
        points: points.flatMap(({ x, y }) => [x, y]),
        stroke: color,
        pointerLength: 15,
        pointerWidth: 15,
        dash: [6, 6],
        strokeWidth: 2,
        hitStrokeWidth: 10,
        userGenerated: true,
        fill: color,
        name: 'drawing',
        type: 'line',
        unselectable: true,
      },
    });
  }

  const group: Group = {
    id: pathId,
    type: 'group',
    onClick: () => {
      onSelect(pathId);
    },
    drawings,
  };
  return group;
};

export default getConnectionGroupByPath;
