import { svgCommandToSegments } from './utils/svgPath';
import { InstanceMatcher, MatchResult } from './InstanceMatcher';

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
  svgPathIds: string[];
}

export interface DiagramLineInstance extends DiagramSymbolInstance {
  symbolName: 'Line';
}

export const newMatcher = (path: string) => {
  return new InstanceMatcher(svgCommandToSegments(path));
};

export const findAllInstancesOfSymbol = (
  all: SVGElement[],
  symbol: DiagramSymbol
): DiagramSymbolInstance[] => {
  const allMatches: SVGElement[][] = [];

  for (
    let svgRepIndex = 0;
    svgRepIndex < symbol.svgRepresentations.length;
    svgRepIndex++
  ) {
    const matches = findAllInstancesOfSvgRepresentation(
      all,
      symbol.svgRepresentations[svgRepIndex]
    );

    // Should we filter out matches with duplicate path id here?
    matches.forEach((match) => allMatches.push(match));
  }

  const symbolInstances = allMatches.map((match) => {
    return {
      symbolName: symbol.symbolName,
      svgPathIds: match.map((el) => el.id),
    };
  });

  return symbolInstances;
};

const findAllInstancesOfSvgRepresentation = (
  all: SVGElement[],
  svgRepresentation: SvgRepresentation
): SVGElement[][] => {
  const matches: SVGElement[][] = [];

  const joinedSymbolSvgCommands = svgRepresentation.svgPaths
    .map((svgPath) => svgPath.svgCommands)
    .join(' ');
  const matcher = newMatcher(joinedSymbolSvgCommands);

  // Filter out all paths that are a sub match and find matches that only consist of one SVGElement
  const subMatchers = [];
  const subSvgElements = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i] instanceof SVGPathElement) {
      const potentialSubMatch = newMatcher(all[i].getAttribute('d') as string);
      const matchResult = matcher.matches(potentialSubMatch);
      if (matchResult === MatchResult.SubMatch) {
        subMatchers.push(potentialSubMatch);
        subSvgElements.push(all[i]);
      } else if (matchResult === MatchResult.Match) {
        matches.push([all[i]]);
      }
    }
  }

  // Combine sub matches to find full matches
  const matchedSubMatchers = subMatchers.map(() => false);
  for (let i = 0; i < subMatchers.length; i++) {
    const potentialSubMatch = subMatchers[i];
    const potentialSubMatchIndexes = [i];

    let originalSegmentList = potentialSubMatch.segmentList;
    const potSvgElements = [subSvgElements[i]];
    for (let j = i + 1; j < subMatchers.length; j++) {
      if (matchedSubMatchers[j]) {
        continue; // eslint-disable-line no-continue
      }

      potentialSubMatch.segmentList = [
        ...originalSegmentList,
        ...subMatchers[j].segmentList,
      ];

      const matchResult = matcher.matches(potentialSubMatch);
      if (matchResult === MatchResult.Match) {
        potSvgElements.push(subSvgElements[j]);
        matches.push(potSvgElements);
        potentialSubMatchIndexes.forEach((v) => {
          matchedSubMatchers[v] = true;
        });
        break;
      } else if (matchResult === MatchResult.SubMatch) {
        potSvgElements.push(subSvgElements[j]);
        potentialSubMatchIndexes.push(j);
        originalSegmentList = potentialSubMatch.segmentList;
      }
    }
  }

  return matches;
};
