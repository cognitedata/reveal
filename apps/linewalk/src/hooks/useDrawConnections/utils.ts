import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import Konva from 'konva';

type Point = [number, number];
export type Path = Point[];

const getAnnotationDataById = (
  id: string,
  ornateViewer: CogniteOrnate
): { document: OrnatePDFDocument; annotation: Konva.Node } => {
  let annotation: any;

  const document = ornateViewer.documents.find((document) => {
    annotation = document.group.children?.find(
      (annotation) => annotation.attrs.id === id
    ) as Konva.Node;
    return annotation;
  });

  if (!document || !annotation) {
    throw new Error(`!!! Unable to find annotation: ${id}`);
  }

  return {
    document,
    annotation,
  };
};

const getLineToDocumentSide = (
  annotation: Konva.Node,
  document: OrnatePDFDocument,
  ornateViewer: CogniteOrnate,
  columnGap: number,
  rowGap: number
): Path => {
  const a = annotation.getClientRect({
    relativeTo: ornateViewer.stage as any,
  });
  const d = document.group.getClientRect({
    relativeTo: ornateViewer.stage as any,
  });

  const distance = {
    top: a.y - d.y,
    left: a.x - d.x,
    right: d.x + d.width - (a.x + a.width),
    bottom: d.y + d.height - (a.y + a.height),
  };

  const minDistance = Math.min(...Object.values(distance));

  // -1 here is because document client rect is 1px wide that is outside of a document
  const halfColumnGap = columnGap / 2 - 1;
  const halfRowGap = rowGap / 2 - 1;

  switch (minDistance) {
    case distance.top:
      return [
        [a.x + a.width / 2, a.y],
        [a.x + a.width / 2, d.y - halfRowGap],
      ];
    case distance.left:
      return [
        [a.x, a.y + a.height / 2],
        [d.x - halfColumnGap, a.y + a.height / 2],
      ];
    case distance.right:
      return [
        [a.x + a.width, a.y + a.height / 2],
        [d.x + d.width + halfColumnGap, a.y + a.height / 2],
      ];
    case distance.bottom:
      return [
        [a.x + a.width / 2, a.y + a.height],
        [a.x + a.width / 2, d.y + d.height + halfRowGap],
      ];
  }

  return [];
};

type BuildMiddlePathsProps = {
  endPoint: Point;
  path: Path;
  middlePoints: Point[];
};

const buildMiddlePaths = ({
  endPoint,
  path,
  middlePoints,
}: BuildMiddlePathsProps): Path[] => {
  const lastPoint = getLast(path);
  const secondLastPoint = path.length > 1 ? path[path.length - 2] : undefined;

  if (lastPoint[0] === endPoint[0] || lastPoint[1] === endPoint[1]) {
    return [[...path, endPoint]];
  }

  const connectedMiddlePoints = middlePoints.filter(
    (item) =>
      !path.includes(item) &&
      (item[0] === lastPoint[0] || item[1] === lastPoint[1]) &&
      // check that it changes direction but not on the same line
      (!secondLastPoint ||
        (item[0] === lastPoint[0] && item[0] !== secondLastPoint[0]) ||
        (item[1] === lastPoint[1] && item[1] !== secondLastPoint[1]))
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
  return [];
};

type FindShortestPathProps = {
  startPoint: Point;
  endPoint: Point;
  ornateViewer: CogniteOrnate;
  columnGap: number;
  rowGap: number;
};

const findShortestMiddlePath = ({
  startPoint,
  endPoint,
  ornateViewer,
  columnGap,
  rowGap,
}: FindShortestPathProps): Path => {
  // -1 here is because document client rect is 1px wide that is outside of a document
  const halfColumnGap = columnGap / 2 - 1;
  const halfRowGap = rowGap / 2 - 1;

  const edgePoints = ornateViewer.documents
    .map((document) => {
      const d = document.group.getClientRect({
        relativeTo: ornateViewer.stage as any,
      });

      return [
        [d.x - halfColumnGap, d.y - halfRowGap] as Point,
        [d.x + d.width + halfColumnGap, d.y - halfRowGap] as Point,
        [d.x + d.width + halfColumnGap, d.y + d.height + halfRowGap] as Point,
        [d.x - halfColumnGap, d.y + d.height + halfRowGap] as Point,
      ];
    })
    .flat()
    .filter(
      (item, i, list) =>
        i ===
        list.findIndex(
          (listItem) => listItem[0] === item[0] && listItem[1] === item[1]
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
            ? Math.abs(point[0] - list[i - 1][0]) +
              Math.abs(point[1] - list[i - 1][1])
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

type GetConnectionPathProps = {
  annotationIds: [string, string];
  ornateViewer: CogniteOrnate;
  columnGap: number;
  rowGap: number;
};

export const getConnectionPath = ({
  annotationIds,
  ornateViewer,
  columnGap,
  rowGap,
}: GetConnectionPathProps): Path => {
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
  ] = annotationIds.map((id) => getAnnotationDataById(id, ornateViewer));

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
  });

  // remove first and last points as they are already in start and end paths
  middlePath.shift();
  middlePath.pop();

  return joinPath({ startPath, middlePath, endPath });
};

type DrawConnectionLineProps = {
  path: Path;
  ornateViewer: CogniteOrnate;
};

export const drawConnectionLine = ({
  path: points,
  ornateViewer,
}: DrawConnectionLineProps) => {
  const connectionLine = new Konva.Line({
    tension: 0,
    points: points.flat(),
    stroke: 'rgba(0,0,0,1)',
    dash: [6, 6],
    strokeWidth: 6,
    userGenerated: true,
    name: 'drawing',
    type: 'line',
    unselectable: true,
  });
  ornateViewer.baseLayer.add(connectionLine);
  return connectionLine;
};

type GetPathsWithoutOverlapsPerAxeProps = {
  paths: Path[];
  columnGap: number;
  rowGap: number;
  axe: 0 | 1; // x: 0, y: 1
};

type Segment = [Point, Point];

export const getPathsWithoutOverlapsPerAxe = ({
  paths,
  columnGap,
  rowGap,
  axe,
}: GetPathsWithoutOverlapsPerAxeProps): Path[] => {
  const otherAxe = axe ? 0 : 1;
  const gap = axe ? columnGap : rowGap;

  const axeSegments = paths.reduce(
    (result, path) =>
      result.concat(
        path.reduce((pathResult, point, i, list) => {
          // skip start and end points
          if ([0, 1, list.length - 1].includes(i)) return pathResult;
          if (point[otherAxe] === list[i - 1][otherAxe])
            pathResult.push([list[i - 1], point]);
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
          item[0][0] === point[0] &&
          item[0][1] === point[1] &&
          item[1][0] === nextPoint[0] &&
          item[1][1] === nextPoint[1]
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

type GetPathsWithoutOverlapsProps = {
  paths: Path[];
  columnGap: number;
  rowGap: number;
};

export const getPathsWithoutOverlaps = ({
  paths,
  ...props
}: GetPathsWithoutOverlapsProps): Path[] => {
  return ([0, 1] as (0 | 1)[]).reduce(
    (resultPaths, axe) =>
      getPathsWithoutOverlapsPerAxe({ ...props, paths: resultPaths, axe }),
    paths
  );
};
