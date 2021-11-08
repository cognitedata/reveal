import { CurveSegment, LineSegment, PathSegment, Point } from './PathSegments';
import { InstanceMatcher } from './InstanceMatcher';

export interface SvgPath {
  svgCommands: string;
  style?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramSymbol {
  symbolName: string;
  svgPaths: SvgPath[];
  boundingBox: BoundingBox;
}

export interface DiagramSymbolInstance {
  symbolName: string;
  svgElements: SVGElement[];
}

const getSvgCommands = (d: string) => {
  const regexStr: string[] = d.split(/(\D\s.+?(?=[a-zA-Z]))/);
  const commands: string[] = regexStr.filter((path) => path.length > 0);
  const commandsWithArgs = commands.map((e) => {
    if (e.length === 0) {
      return [];
    }
    const allArgs: string[] = [];
    const args = e.split(' ');
    for (let i = 1; i < args.length; i++) {
      const res = args[i].split(',').filter((e) => e.length > 0);

      allArgs.push(...res);
    }
    return [args[0], allArgs];
  });
  return commandsWithArgs;
};

/* https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths */
const getEndPosition = (
  curPointer: Point,
  curCommand: any[],
  startPosition: Point
) => {
  let endPosition = null;
  switch (curCommand[0]) {
    case 'M': {
      // Move to
      endPosition = new Point(curCommand[1][0], curCommand[1][1]);
      break;
    }
    case 'L': {
      // line to
      endPosition = new Point(curCommand[1][0], curCommand[1][1]);
      break;
    }
    case 'H': {
      //
      endPosition = new Point(curCommand[1][0], curPointer.y);
      break;
    }
    case 'V': {
      endPosition = new Point(curPointer.x, curCommand[1][0]);
      break;
    }
    case 'C': {
      endPosition = new Point(curCommand[1][4], curCommand[1][5]);
      return {
        endPosition,
        curvePoint1: new Point(curCommand[1][0], curCommand[1][1]),
        curvePoint2: new Point(curCommand[1][2], curCommand[1][3]),
      };
    }
    case 'Z': {
      endPosition = startPosition;
      break;
    }
    default: {
      // console.log('Failed to parse, curCommand', curCommand);
      endPosition = null;
    }
  }
  return { endPosition };
};
const getSegments = (commands: (string | string[])[][]) => {
  const segments: PathSegment[] = [];
  let curPointer: Point = new Point(0, 0);
  let newStartPosition: Point = new Point(0, 0);

  for (let i = 0; i < commands.length; i++) {
    const curCommand = commands[i];
    const { endPosition, curvePoint1, curvePoint2 } = getEndPosition(
      curPointer,
      curCommand,
      newStartPosition
    );
    if (endPosition == null) {
      // This shouldnt happen...
      // eslint-disable-next-line no-continue
      continue;
    }
    // Move commands does not create segments..
    if (curCommand[0] !== 'M') {
      if (curCommand[0] === 'C') {
        if (curvePoint1 && curvePoint2) {
          segments.push(
            new CurveSegment(curvePoint1, curvePoint2, curPointer, endPosition)
          );
        }
      } else {
        segments.push(new LineSegment(curPointer, endPosition));
      }
    }
    if (endPosition) {
      curPointer = endPosition;
    }

    if (curCommand[0] === 'M') {
      newStartPosition = endPosition;
    }
  }
  return segments;
};

export const newMatcher = (
  path: string,
  normalizationPoint: Point | null = null
) => {
  const commands: (string | string[])[][] = getSvgCommands(path as string);
  const segmentList = getSegments(commands);
  return new InstanceMatcher(segmentList, normalizationPoint);
};

export const findAllInstancesOfSymbol = (
  all: SVGElement[],
  symbol: DiagramSymbol
): DiagramSymbolInstance[] => {
  const matches: SVGElement[][] = [];

  const joinedSymbolSvgCommands = symbol.svgPaths
    .map((svgPath) => svgPath.svgCommands)
    .join(' ');

  const matcher = newMatcher(joinedSymbolSvgCommands);
  for (let i = 0; i < all.length; i++) {
    if (all[i] instanceof SVGPathElement) {
      const potMatch = newMatcher(all[i].getAttribute('d') as string);
      const matchCount = matcher.matches(potMatch);

      if (matchCount === matcher.segmentList.length) {
        // a full match
        matches.push([all[i]]);
      } else if (matchCount === potMatch.segmentList.length) {
        // everything in this line segment matched -- lets find the remining pieces
        // loop through things.
        const objs = [all[i]];
        let allPaths = `${all[i].getAttribute('d')}`;
        for (let j = 0; j < all.length; j++) {
          if (
            all[j] != null &&
            !objs.map((obj) => obj.id).includes(all[j].id) &&
            all[j] instanceof SVGPathElement
          ) {
            const pMatch = newMatcher(
              (allPaths + all[j].getAttribute('d')) as string,
              potMatch.normalizationPoint
            );
            const newMatchCount = matcher.matches(pMatch);

            if (newMatchCount === matcher.segmentList.length) {
              objs.push(all[j]);
              matches.push(objs);
            } else if (newMatchCount === pMatch.segmentList.length) {
              // is a submatch
              objs.push(all[j]);
              allPaths += `${all[j].getAttribute('d')}`;
            }
          }
        }
      }
    }
  }

  const symbolInstances = matches.map((match) => {
    return {
      symbolName: symbol.symbolName,
      svgElements: match,
    };
  });

  return symbolInstances;
};
