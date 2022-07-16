import { parseSVG, makeAbsolute } from 'svg-path-parser';

import { CurveSegment, LineSegment, PathSegment, Point } from '../geometry';

const getNormalizedPoint = (
  x: number,
  y: number,
  matixTransform?: DOMMatrix
) => {
  if (matixTransform === undefined) return new Point(x, y);

  const translatedPoint = new DOMPoint(x, y).matrixTransform(matixTransform);
  return new Point(translatedPoint.x, translatedPoint.y);
};

export const getSceenCTMToSvgMatrix = (svg: SVGGraphicsElement): DOMMatrix =>
  svg.getScreenCTM()!.inverse();

export const getSvgElementToSvgMatrix = (
  svgElement: SVGGraphicsElement,
  sceenCTMToSvgMatrix: DOMMatrix
): DOMMatrix => sceenCTMToSvgMatrix.multiply(svgElement.getScreenCTM()!);

export const svgCommandsToPathSegments = (
  d: string,
  svgElementToSvgMatrix?: DOMMatrix
): PathSegment[] => {
  const absoluteCommands = makeAbsolute(parseSVG(d));

  const pathSegments: PathSegment[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const command of absoluteCommands) {
    // Map SVG command to the internal segment representation.
    // See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#path_commands for an overview of possible commands
    switch (command.code) {
      case 'M':
        // This is basically a no-op due to the way `makeAbsolute` works
        // eslint-disable-next-line no-continue
        continue;
      case 'L':
      case 'V':
      case 'H':
      case 'Z':
        // 'L', 'V', 'H' straight up draw line segments from current point to end point.
        // 'Z' results in a line segment by connecting the last point of the path with the first point.
        pathSegments.push(
          new LineSegment(
            getNormalizedPoint(command.x0, command.y0, svgElementToSvgMatrix),
            getNormalizedPoint(command.x, command.y, svgElementToSvgMatrix)
          )
        );
        break;
      case 'C':
        // Cubic Bezier curve
        pathSegments.push(
          new CurveSegment(
            getNormalizedPoint(command.x1, command.y1, svgElementToSvgMatrix),
            getNormalizedPoint(command.x2, command.y2, svgElementToSvgMatrix),
            getNormalizedPoint(command.x0, command.y0, svgElementToSvgMatrix),
            getNormalizedPoint(command.x, command.y, svgElementToSvgMatrix)
          )
        );
        break;
      default:
        // eslint-disable-next-line no-console
        console.error(
          `svgCommandsToPathSegments: Unsupported command code ${command.code}`
        );
    }
  }
  return pathSegments;
};

const isPathSegmentsConnected = (
  pathSegment1: PathSegment,
  pathSegment2: PathSegment
): boolean => pathSegment1.stop.distance(pathSegment2.start) === 0;

export const pathSegmentsToSvgCommands = (
  pathSegments: PathSegment[],
  toFixed: null | number = null
) => {
  const svgCommandsList: string[] = [];

  const fmtFloat = (n: number) => {
    if (toFixed === null) return n;
    return n.toFixed(toFixed);
  };

  pathSegments.forEach((pathSegment, index) => {
    if (pathSegment instanceof LineSegment) {
      if (
        index === 0 ||
        !isPathSegmentsConnected(pathSegments[index - 1], pathSegments[index])
      ) {
        svgCommandsList.push(
          `M ${fmtFloat(pathSegment.start.x)} ${fmtFloat(pathSegment.start.y)}`
        );
      }

      const dx = pathSegment.stop.x - pathSegment.start.x;
      const dy = pathSegment.stop.y - pathSegment.start.y;
      if (dy === 0) {
        svgCommandsList.push(`h ${fmtFloat(dx)}`);
      } else if (dx === 0) {
        svgCommandsList.push(`v ${fmtFloat(dy)}`);
      } else {
        svgCommandsList.push(`l ${fmtFloat(dx)} ${fmtFloat(dy)}`);
      }
    } else if (pathSegment instanceof CurveSegment) {
      svgCommandsList.push(
        `M ${fmtFloat(pathSegment.start.x)} ${fmtFloat(pathSegment.start.y)}`
      );
      svgCommandsList.push(
        `C ${fmtFloat(pathSegment.controlPoint1.x)} ${fmtFloat(
          pathSegment.controlPoint1.y
        )}, ${fmtFloat(pathSegment.controlPoint2.x)} ${fmtFloat(
          pathSegment.controlPoint2.y
        )}, ${fmtFloat(pathSegment.stop.x)} ${fmtFloat(pathSegment.stop.y)}`
      );
    } else {
      // eslint-disable-next-line no-console
      console.error(
        `pathSegmentsToSvgCommands: Unsupported path segment ${pathSegment}`
      );
    }
  });
  return svgCommandsList.join(' ');
};
