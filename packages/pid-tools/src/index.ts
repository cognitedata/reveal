import { Point } from './PathSegments';
import { svgCommandToSegments } from './utils/svgPath';
import { InstanceMatcher } from './InstanceMatcher';

export * from './utils/boundingBox';

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

export interface SvgRepresentation {
  svgPaths: SvgPath[];
  boundingBox: BoundingBox;
}

export interface DiagramSymbol {
  symbolName: string;
  svgRepresentations: SvgRepresentation[];
}

export interface DiagramSymbolInstance {
  symbolName: string;
  svgElements: SVGElement[];
}

export const newMatcher = (
  path: string,
  normalizationPoint: Point | null = null
) => {
  const segmentList = svgCommandToSegments(path);
  return new InstanceMatcher(segmentList, normalizationPoint);
};

export const findAllInstancesOfSymbol = (
  all: SVGElement[],
  symbol: DiagramSymbol
): DiagramSymbolInstance[] => {
  const matches: SVGElement[][] = [];
  for (
    let svgRepresentationIndex = 0;
    svgRepresentationIndex < symbol.svgRepresentations.length;
    svgRepresentationIndex++
  ) {
    const joinedSymbolSvgCommands = symbol.svgRepresentations[
      svgRepresentationIndex
    ].svgPaths
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
  }

  const symbolInstances = matches.map((match) => {
    return {
      symbolName: symbol.symbolName,
      svgElements: match,
    };
  });

  return symbolInstances;
};
