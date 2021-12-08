import { parseSVG, makeAbsolute, CommandMadeAbsolute } from 'svg-path-parser';

import { SVG_ID } from '../constants';

import { CurveSegment, LineSegment, PathSegment, Point } from './PathSegments';

type PointTranslationParams = {
  currentElem: SVGPathElement | SVGTSpanElement;
  svg: SVGSVGElement;
};

export const translatePointWithDOM = (
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

  const translatedPoint = translatePointWithDOM(x, y, params) as DOMPoint;
  return new Point(translatedPoint.x, translatedPoint.y);
};

export const getSegments = (
  commands: CommandMadeAbsolute[],
  pathId: string | null = null
): PathSegment[] => {
  const segments: PathSegment[] = [];

  let params: PointTranslationParams | undefined;
  if (pathId) {
    const mainSVG = document.getElementById(SVG_ID) as unknown as SVGSVGElement;

    const currentElem = document.getElementById(
      pathId as string
    ) as unknown as SVGPathElement;

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

export const svgCommandToSegments = (
  d: string,
  pathId: string | null = null
): PathSegment[] => {
  const commands = makeAbsolute(parseSVG(d));
  return getSegments(commands, pathId);
};

export const segmentsToSVGCommand = (pathSegments: PathSegment[]) => {
  const newPathList: string[] = [];

  pathSegments.forEach((pathSegment) => {
    if (pathSegment instanceof LineSegment) {
      pathSegment as LineSegment;
      newPathList.push(`M ${pathSegment.start.x} ${pathSegment.start.y}`);
      newPathList.push(`L ${pathSegment.stop.x} ${pathSegment.stop.y}`);
    } else if (pathSegment instanceof CurveSegment) {
      newPathList.push(`M ${pathSegment.start.x} ${pathSegment.start.y}`);
      newPathList.push(
        `C ${pathSegment.controlPoint1.x} ${pathSegment.controlPoint1.y}, ${pathSegment.controlPoint2.x} ${pathSegment.controlPoint2.y}, ${pathSegment.stop.x} ${pathSegment.stop.y}`
      );
    }
  });
  return newPathList.join(' ');
};
