/* eslint-disable no-continue */
import { PidPath } from '../pid';
import {
  DiagramSymbol,
  DiagramSymbolInstance,
  SvgRepresentation,
} from '../types';

import { InstanceMatcher, MatchResult } from './InstanceMatcher';

export const findAllInstancesOfSymbol = (
  pidPaths: PidPath[],
  symbol: DiagramSymbol
): DiagramSymbolInstance[] => {
  const allMatches: string[][] = [];

  for (
    let svgRepIndex = 0;
    svgRepIndex < symbol.svgRepresentations.length;
    svgRepIndex++
  ) {
    const matches = findAllInstancesOfSvgRepresentation(
      pidPaths,
      symbol.svgRepresentations[svgRepIndex]
    );

    // Should we filter out matches with duplicate path id here?
    matches.forEach((match) => allMatches.push(match));
  }

  const symbolInstances = allMatches.map((match) => {
    return {
      symbolName: symbol.symbolName,
      pathIds: match,
      labels: [],
    } as DiagramSymbolInstance;
  });

  return symbolInstances;
};

const findAllInstancesOfSvgRepresentation = (
  pidPaths: PidPath[],
  svgRepresentation: SvgRepresentation
): string[][] => {
  const matches: PidPath[][] = [];

  const joinedSymbolSvgCommands = svgRepresentation.svgPaths
    .map((svgPath) => svgPath.svgCommands)
    .join(' ');
  const matcher = InstanceMatcher.fromPathCommand(joinedSymbolSvgCommands);

  // Filter out all paths that are a sub match and find matches that only consist of one SVGElement
  const potPidPaths: PidPath[] = [];
  for (let i = 0; i < pidPaths.length; i++) {
    const matchResult = matcher.matches([pidPaths[i]]);
    if (matchResult === MatchResult.SubMatch) {
      potPidPaths.push(pidPaths[i]);
    } else if (matchResult === MatchResult.Match) {
      matches.push([pidPaths[i]]);
    }
  }

  // Combine sub matches to find full matches
  const matchedPotPidPaths = potPidPaths.map(() => false);
  for (let i = 0; i < potPidPaths.length; i++) {
    if (matchedPotPidPaths[i]) continue;
    const potMatchIndexes = [i];
    const matchResult = matchSearch(
      matcher,
      i + 1,
      potMatchIndexes,
      potPidPaths,
      matchedPotPidPaths
    );

    if (matchResult.result === MatchResult.Match) {
      potMatchIndexes.forEach((v) => {
        matchedPotPidPaths[v] = true;
      });
      matches.push(
        potPidPaths.filter((_, index) =>
          matchResult.matchIndexes?.includes(index)
        )
      );
    }
  }

  return matches.map((match) => match.map((svgPath) => svgPath.pathId));
};

interface MatchSearchResult {
  result: MatchResult;
  matchIndexes?: number[];
}

const matchSearch = (
  matcher: InstanceMatcher,
  searchIndex: number,
  potMatchIndexes: number[],
  potPidPaths: PidPath[],
  matchedPotPidPaths: boolean[],
  withoutDepth = 0
): MatchSearchResult => {
  const potMatch = potPidPaths.filter((_, index) =>
    potMatchIndexes.includes(index)
  );
  for (let i = searchIndex; i < potPidPaths.length; i++) {
    if (matchedPotPidPaths[i] || potMatchIndexes.includes(i)) {
      continue;
    }

    const isTooFarAway =
      potMatch[0].midPoint.distance(potPidPaths[i].midPoint) >
      1.2 * matcher.maxMidPointDistance;
    if (isTooFarAway) {
      continue;
    }

    const matchResult = matcher.matches([...potMatch, potPidPaths[i]]);
    if (matchResult === MatchResult.NotMatch) continue;

    if (matchResult === MatchResult.Match) {
      return {
        result: MatchResult.Match,
        matchIndexes: [...potMatchIndexes, i],
      };
    }
    if (matchResult === MatchResult.SubMatch) {
      // Check if it is a match with or without the new potential PidPath
      const matchResultWithNewPotPidPath = matchSearch(
        matcher,
        i + 1,
        [...potMatchIndexes, i],
        potPidPaths,
        matchedPotPidPaths,
        withoutDepth
      );
      if (matchResultWithNewPotPidPath.result === MatchResult.Match) {
        return matchResultWithNewPotPidPath;
      }

      if (withoutDepth >= 1) return { result: MatchResult.NotMatch };

      const matchResultWithoutNewPotPidPath = matchSearch(
        matcher,
        i + 1,
        [...potMatchIndexes],
        potPidPaths,
        matchedPotPidPaths,
        withoutDepth + 1
      );
      if (matchResultWithoutNewPotPidPath.result === MatchResult.Match) {
        return matchResultWithoutNewPotPidPath;
      }

      return { result: MatchResult.NotMatch };
    }
  }
  return { result: MatchResult.NotMatch };
};
