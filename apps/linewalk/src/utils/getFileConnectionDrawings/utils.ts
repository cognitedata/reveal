import { CogniteOrnate } from '@cognite/ornate';
import Konva from 'konva';

import { Path, Point, Segment } from './types';

const getAnnotationDataById = (
  id: string,
  ornateViewer: CogniteOrnate
): { document: Konva.Node; annotation: Konva.Node } => {
  const annotation = ornateViewer.stage.findOne(`#${id}`);

  if (!annotation) {
    throw new Error(`Unable to find annotation node with id: ${id}`);
  }

  const document = annotation.parent;
  if (!document) {
    throw new Error('Annotation had no parent');
  }

  return {
    document,
    annotation,
  };
};

const getLineToDocumentSide = (
  annotation: Konva.Node,
  document: Konva.Node,
  ornateViewer: CogniteOrnate,
  columnGap: number,
  rowGap: number
): Path => {
  const annotationRect = annotation.getClientRect({
    relativeTo: ornateViewer.stage as any,
    skipStroke: true,
  });
  const documentRect = document.getClientRect({
    relativeTo: ornateViewer.stage as any,
    skipStroke: true,
  });

  const distance = {
    top: annotationRect.y - documentRect.y,
    left: annotationRect.x - documentRect.x,
    right:
      documentRect.x +
      documentRect.width -
      (annotationRect.x + annotationRect.width),
    bottom:
      documentRect.y +
      documentRect.height -
      (annotationRect.y + annotationRect.height),
  };

  const minDistance = Math.min(...Object.values(distance));

  // -1 here is because document client rect is 1px wide that is outside of a document
  const halfColumnGap = columnGap / 2;
  const halfRowGap = rowGap / 2;

  switch (minDistance) {
    case distance.top:
      return [
        { x: annotationRect.x + annotationRect.width / 2, y: annotationRect.y },
        {
          x: annotationRect.x + annotationRect.width / 2,
          y: documentRect.y - halfRowGap,
        },
      ];
    case distance.left:
      return [
        {
          x: annotationRect.x,
          y: annotationRect.y + annotationRect.height / 2,
        },
        {
          x: documentRect.x - halfColumnGap,
          y: annotationRect.y + annotationRect.height / 2,
        },
      ];
    case distance.right:
      return [
        {
          x: annotationRect.x + annotationRect.width,
          y: annotationRect.y + annotationRect.height / 2,
        },
        {
          x: documentRect.x + documentRect.width + halfColumnGap,
          y: annotationRect.y + annotationRect.height / 2,
        },
      ];
    case distance.bottom:
      return [
        {
          x: annotationRect.x + annotationRect.width / 2,
          y: annotationRect.y + annotationRect.height,
        },
        {
          x: annotationRect.x + annotationRect.width / 2,
          y: documentRect.y + documentRect.height + halfRowGap,
        },
      ];
  }

  return [];
};

const buildMiddlePaths = ({
  endPoint,
  path,
  middlePoints,
}: {
  endPoint: Point;
  path: Path;
  middlePoints: Point[];
}): Path[] => {
  const lastPoint = getLast(path);
  const secondLastPoint = path.length > 1 ? path[path.length - 2] : undefined;

  if (lastPoint.x === endPoint.x || lastPoint.y === endPoint.y) {
    return [[...path, endPoint]];
  }

  const connectedMiddlePoints = middlePoints.filter(
    (item) =>
      !path.includes(item) &&
      (item.x === lastPoint.x || item.y === lastPoint.y) &&
      // check that it changes direction but not on the same line
      (!secondLastPoint ||
        (item.x === lastPoint.x && item.x !== secondLastPoint.x) ||
        (item.y === lastPoint.y && item.y !== secondLastPoint.y))
  );

  if (connectedMiddlePoints.length === 0) return [];

  return connectedMiddlePoints
    .map((point) =>
      buildMiddlePaths({
        path: [...path, point],
        endPoint,
        middlePoints,
      })
    )
    .flat()
    .filter((path) => path.length);
};

const findShortestMiddlePath = ({
  startPoint,
  endPoint,
  ornateViewer,
  columnGap,
  rowGap,
  startDocument,
  endDocument,
}: {
  startPoint: Point;
  endPoint: Point;
  ornateViewer: CogniteOrnate;
  columnGap: number;
  rowGap: number;
  startDocument: Konva.Node;
  endDocument: Konva.Node;
}): Path => {
  const halfColumnGap = columnGap / 2;
  const halfRowGap = rowGap / 2;

  const edgePoints = [startDocument, endDocument]
    .map((document) => {
      const d = document.getClientRect({
        relativeTo: ornateViewer.stage as any,
        skipStroke: true,
      });

      return [
        { x: d.x - halfColumnGap, y: d.y - halfRowGap },
        { x: d.x + d.width + halfColumnGap, y: d.y - halfRowGap },
        {
          x: d.x + d.width + halfColumnGap,
          y: d.y + d.height + halfRowGap,
        },
        { x: d.x - halfColumnGap, y: d.y + d.height + halfRowGap },
      ];
    })
    .flat()
    .filter(
      (item, i, list) =>
        i ===
        list.findIndex(
          (listItem) => listItem.x === item.x && listItem.y === item.y
        )
    );

  const middlePaths = buildMiddlePaths({
    endPoint,
    path: [startPoint],
    middlePoints: edgePoints,
  });

  const shortestPath = middlePaths
    .map((path) => ({
      path,
      distance: path.reduce(
        (result, point, i, list) =>
          result +
          (i > 0
            ? Math.abs(point.x - list[i - 1].x) +
              Math.abs(point.y - list[i - 1].y)
            : 0),
        0
      ),
    }))
    .reduce((result: { path: Path; distance: number } | undefined, item) => {
      if (!result) return item;
      if (item.distance < result.distance) return item;
      if (item.path.length < result.path.length) return item;
      return result;
    }, undefined)!.path;

  return shortestPath;
};

const getLast = (path: Path): Point => path[path.length - 1];

type JoinPathProps = {
  startPath: Path;
  middlePath?: Path;
  endPath: Path;
};
const joinPath = ({ startPath, middlePath = [], endPath }: JoinPathProps) =>
  startPath.concat(middlePath, endPath.reverse());

export const getConnectionPath = ({
  annotationIds,
  ornateViewer,
  columnGap,
  rowGap,
}: {
  annotationIds: [string, string];
  ornateViewer: CogniteOrnate;
  columnGap: number;
  rowGap: number;
}): Path => {
  if (annotationIds.length !== 2) {
    throw new Error(
      `!!! Unable to connect annotations: ${JSON.stringify(annotationIds)}`
    );
  }

  let startPath: Path = [];
  let endPath: Path = [];

  const [
    { document: startDocument, annotation: startAnnotation },
    { document: endDocument, annotation: endAnnotation },
  ] = annotationIds.map((annotationId) =>
    getAnnotationDataById(annotationId, ornateViewer)
  );

  startPath = startPath.concat(
    getLineToDocumentSide(
      startAnnotation,
      startDocument,
      ornateViewer,
      columnGap,
      rowGap
    )
  );

  endPath = endPath.concat(
    getLineToDocumentSide(
      endAnnotation,
      endDocument,
      ornateViewer,
      columnGap,
      rowGap
    )
  );

  const middlePath = findShortestMiddlePath({
    startPoint: getLast(startPath)!,
    endPoint: getLast(endPath)!,
    ornateViewer,
    columnGap,
    rowGap,
    startDocument,
    endDocument,
  });

  // remove first and last points as they are already in start and end paths
  middlePath.shift();
  middlePath.pop();

  return joinPath({ startPath, middlePath, endPath });
};

export const getPathsWithoutOverlapsPerAxe = ({
  paths,
  columnGap,
  rowGap,
  axe,
}: {
  paths: Path[];
  columnGap: number;
  rowGap: number;
  axe: 'x' | 'y'; // x: 0, y: 1
}): Path[] => {
  const otherAxe = axe === 'y' ? 'x' : 'y';
  const gap = axe ? columnGap : rowGap;

  const axeSegments = paths.reduce(
    (result, path) =>
      result.concat(
        path.reduce((pathResult, point, i, list) => {
          // skip start and end points
          if ([0, 1, list.length - 1].includes(i)) {
            return pathResult;
          }

          if (point[otherAxe] === list[i - 1][otherAxe]) {
            pathResult.push([list[i - 1], point]);
          }
          return pathResult;
        }, [] as Segment[])
      ),
    [] as Segment[]
  );

  const routes: { [key: number]: { total: number; used: number } } = {};

  const overlapSegments = axeSegments.reduce((result, segment) => {
    const overlaps =
      axeSegments.filter((otherSegment) => {
        if (
          otherSegment === segment ||
          otherSegment[0][otherAxe] !== segment[0][otherAxe]
        ) {
          return false;
        }
        const segmentRange = [segment[0][axe], segment[1][axe]].sort(
          (a, b) => a - b
        );

        const otherSegmentRange = [
          otherSegment[0][axe],
          otherSegment[1][axe],
        ].sort((a, b) => a - b);
        return (
          (otherSegmentRange[0] <= segment[0][axe] &&
            segment[0][axe] <= otherSegmentRange[1]) ||
          (otherSegmentRange[0] <= segment[1][axe] &&
            segment[1][axe] <= otherSegmentRange[1]) ||
          (segmentRange[0] <= otherSegment[0][axe] &&
            otherSegment[0][axe] <= segmentRange[1]) ||
          (segmentRange[0] <= otherSegment[1][axe] &&
            otherSegment[1][axe] <= segmentRange[1])
        );
      })?.length || 0;

    if (overlaps) {
      if (!routes[segment[0][otherAxe]]) {
        routes[segment[0][otherAxe]] = {
          total: 0,
          used: 0,
        };
      }
      routes[segment[0][otherAxe]].total += 1;
      result.push(segment);
    }
    return result;
  }, [] as Segment[]);

  return paths.map((path) => {
    return path.map((point, i) => {
      if ([0, path.length - 1].includes(i)) return point;

      const nextPoint = path[i + 1];
      const isOverlap = overlapSegments.some(
        (item) =>
          item[0].x === point.x &&
          item[0].y === point.y &&
          item[1].x === nextPoint.x &&
          item[1].y === nextPoint.y
      );

      if (isOverlap) {
        const route = routes[point[otherAxe]];
        route.used += 1;
        const newValue =
          point[otherAxe] - gap / 2 + (route.used * gap) / (route.total + 1);

        nextPoint[otherAxe] = newValue;

        const newPoint = point;
        newPoint[otherAxe] = newValue;
        return newPoint;
      }

      return point;
    });
  });
};

export const getPathsWithoutOverlaps = ({
  paths,
  ...props
}: {
  paths: Path[];
  columnGap: number;
  rowGap: number;
}): Path[] => {
  return (['x', 'y'] as ('x' | 'y')[]).reduce(
    (resultPaths, axe) =>
      getPathsWithoutOverlapsPerAxe({ ...props, paths: resultPaths, axe }),
    paths
  );
};
