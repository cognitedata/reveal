import { DiagramSymbol, SvgRepresentation, DiagramSymbolInstance } from 'types';

import { newMatcher, MatchResult, InternalSvgPath } from './InstanceMatcher';

export class SvgDocument {
  allSvgElements: InternalSvgPath[];
  constructor(allSvgElements: InternalSvgPath[]) {
    this.allSvgElements = allSvgElements;
  }

  findAllInstancesOfSymbol = (
    symbol: DiagramSymbol
  ): DiagramSymbolInstance[] => {
    const allMatches: string[][] = [];

    for (
      let svgRepIndex = 0;
      svgRepIndex < symbol.svgRepresentations.length;
      svgRepIndex++
    ) {
      const matches = this.findAllInstancesOfSvgRepresentation(
        symbol.svgRepresentations[svgRepIndex]
      );

      // Should we filter out matches with duplicate path id here?
      matches.forEach((match) => allMatches.push(match));
    }

    const symbolInstances = allMatches.map((match) => {
      return {
        symbolName: symbol.symbolName,
        pathIds: match,
      } as DiagramSymbolInstance;
    });

    return symbolInstances;
  };

  findAllInstancesOfSvgRepresentation = (
    svgRepresentation: SvgRepresentation
  ): string[][] => {
    const matches: InternalSvgPath[][] = [];

    const joinedSymbolSvgCommands = svgRepresentation.svgPaths
      .map((svgPath) => svgPath.svgCommands)
      .join(' ');

    const matcher = newMatcher(joinedSymbolSvgCommands);

    const all = this.allSvgElements;

    // Filter out all paths that are a sub match and find matches that only consist of one SVGElement
    const potMatches = [];
    for (let i = 0; i < all.length; i++) {
      const matchResult = matcher.matches([all[i]]);
      if (matchResult === MatchResult.SubMatch) {
        potMatches.push(all[i]);
      } else if (matchResult === MatchResult.Match) {
        matches.push([all[i]]);
      }
    }

    // Combine sub matches to find full matches
    const matchedPotMatches = potMatches.map(() => false);
    for (let i = 0; i < potMatches.length; i++) {
      let potMatch = [potMatches[i]];
      const potMatchIndexes = [i];
      for (let j = i + 1; j < potMatches.length; j++) {
        if (matchedPotMatches[j]) {
          continue; // eslint-disable-line no-continue
        }

        if (
          potMatches[i].midPoint.distance(potMatches[j].midPoint) >
          matcher.maxMidPointDistance
        ) {
          continue; // eslint-disable-line no-continue
        }

        const newPotentialMatch = [...potMatch, potMatches[j]];
        const matchResult = matcher.matches([...potMatch, potMatches[j]]);
        if (matchResult === MatchResult.Match) {
          matches.push(newPotentialMatch);
          potMatchIndexes.forEach((v) => {
            matchedPotMatches[v] = true;
          });
          break;
        } else if (matchResult === MatchResult.SubMatch) {
          potMatchIndexes.push(j);
          potMatch = newPotentialMatch;
        }
      }
    }

    return matches.map((match) => match.map((svgPath) => svgPath.pathId));
  };
}
