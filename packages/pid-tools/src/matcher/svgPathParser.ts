import { parseSVG, makeAbsolute, CommandMadeAbsolute } from 'svg-path-parser';

import { CurveSegment, LineSegment, PathSegment, Point } from '../geometry';

type PointTranslationParams = {
  currentElem: SVGPathElement | SVGTSpanElement;
  svg: SVGSVGElement;
};

export const translatePointWithDom = (
  x: number,
  y: number,
  params: PointTranslationParams
): DOMPoint => {
  const { currentElem, svg } = params;

  const screenToSVG = (
    svg: SVGSVGElement,
    screenX: number,
    screenY: number
  ): DOMPoint => {
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = screenX;
    svgPoint.y = screenY;
    return svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());
  };

  const untranslatedPoint = svg.createSVGPoint();
  untranslatedPoint.x = x;
  untranslatedPoint.y = y;

  const translatedPoint = screenToSVG(
    svg,
    untranslatedPoint.matrixTransform(
      currentElem.getScreenCTM() as DOMMatrixInit
    ).x,
    untranslatedPoint.matrixTransform(
      currentElem.getScreenCTM() as DOMMatrixInit
    ).y
  );

  return translatedPoint;
};

const getPoint = (
  x: number,
  y: number,
  params?: PointTranslationParams | undefined
) => {
  if (params === undefined) {
    return new Point(x, y);
  }

  const translatedPoint = translatePointWithDom(x, y, params) as DOMPoint;
  return new Point(translatedPoint.x, translatedPoint.y);
};

export const getSegments = (
  commands: CommandMadeAbsolute[],
  mainSVG: SVGSVGElement | undefined = undefined,
  pathId: string | null = null
): PathSegment[] => {
  const segments: PathSegment[] = [];

  let params: PointTranslationParams | undefined;
  if (pathId && mainSVG) {
    const currentElem = mainSVG.getElementById(
      pathId as string
    ) as SVGPathElement;

    params = { currentElem, svg: mainSVG };
  }

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    if (
      command.code === 'L' ||
      command.code === 'V' ||
      command.code === 'H' ||
      command.code === 'Z'
    ) {
      segments.push(
        new LineSegment(
          getPoint(command.x0, command.y0, params),
          getPoint(command.x, command.y, params)
        )
      );
    } else if (command.code === 'C') {
      segments.push(
        new CurveSegment(
          getPoint(command.x1, command.y1, params),
          getPoint(command.x2, command.y2, params),
          getPoint(command.x0, command.y0, params),
          getPoint(command.x, command.y, params)
        )
      );
    }
  }
  return segments;
};

export const svgCommandsToSegments = (d: string): PathSegment[] => {
  const commands = makeAbsolute(parseSVG(d));
  return getSegments(commands);
};

export const svgCommandsToSegmentsWithDom = (
  d: string,
  mainSVG: SVGSVGElement,
  pathId: string | null = null
): PathSegment[] => {
  const commands = makeAbsolute(parseSVG(d));
  return getSegments(commands, mainSVG, pathId);
};

export const segmentsToSvgCommands = (
  pathSegments: PathSegment[],
  toFixed: null | number = null
) => {
  const newPathList: string[] = [];

  const fmtFloat = (n: number) => {
    if (toFixed === null) return n;
    return n.toFixed(toFixed);
  };

  pathSegments.forEach((pathSegment, index) => {
    if (pathSegment instanceof LineSegment) {
      pathSegment as LineSegment;
      if (
        index === 0 ||
        pathSegments[index - 1].stop.distance(pathSegments[index].start) !== 0
      ) {
        newPathList.push(
          `M ${fmtFloat(pathSegment.start.x)} ${fmtFloat(pathSegment.start.y)}`
        );
      }

      const dx = pathSegment.stop.x - pathSegment.start.x;
      const dy = pathSegment.stop.y - pathSegment.start.y;
      if (dy === 0) {
        newPathList.push(`h ${fmtFloat(dx)}`);
      } else if (dx === 0) {
        newPathList.push(`v ${fmtFloat(dy)}`);
      } else {
        newPathList.push(`l ${fmtFloat(dx)} ${fmtFloat(dy)}`);
      }
    } else if (pathSegment instanceof CurveSegment) {
      newPathList.push(
        `M ${fmtFloat(pathSegment.start.x)} ${fmtFloat(pathSegment.start.y)}`
      );
      newPathList.push(
        `C ${fmtFloat(pathSegment.controlPoint1.x)} ${fmtFloat(
          pathSegment.controlPoint1.y
        )}, ${fmtFloat(pathSegment.controlPoint2.x)} ${fmtFloat(
          pathSegment.controlPoint2.y
        )}, ${fmtFloat(pathSegment.stop.x)} ${fmtFloat(pathSegment.stop.y)}`
      );
    }
  });
  return newPathList.join(' ');
};
