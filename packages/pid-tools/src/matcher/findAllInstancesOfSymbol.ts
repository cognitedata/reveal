/* eslint-disable no-continue */
import { isFileConnection } from '../utils';
import { PidDocument, PidPath } from '../pid';
import {
  DiagramSymbol,
  SvgRepresentation,
  DiagramSymbolInstance,
} from '../types';

import { InstanceMatch, InstanceMatcher, MatchResult } from './InstanceMatcher';

export const findAllInstancesOfSymbol = (
  pidDocument: PidDocument,
  symbol: DiagramSymbol
): DiagramSymbolInstance[] => {
  const symbolInstances: DiagramSymbolInstance[] = [];
  const { pidPaths } = pidDocument;

  for (
    let svgRepIndex = 0;
    svgRepIndex < symbol.svgRepresentations.length;
    svgRepIndex++
  ) {
    const matches = findAllInstancesOfSvgRepresentation(
      pidPaths,
      symbol.svgRepresentations[svgRepIndex]
    );

    matches.forEach((match) => {
      symbolInstances.push({
        type: symbol.symbolType,
        symbolId: symbol.id,
        pathIds: match.pathIds,
        scale: match.scale,
        labelIds: [],
        lineNumbers: [],
      });
    });
  }

  if (symbol.symbolType === 'File connection') {
    const fileConnections = symbolInstances.filter(isFileConnection);
    return pidDocument.getFileConnectionsWithPosition(fileConnections);
  }
  return symbolInstances;
};

interface SvgRepresentationMatch {
  pathIds: string[];
  scale?: number;
}

const findAllInstancesOfSvgRepresentation = (
  pidPaths: PidPath[],
  svgRepresentation: SvgRepresentation
): SvgRepresentationMatch[] => {
  const matches: SvgRepresentationMatch[] = [];

  const joinedSymbolSvgCommands = svgRepresentation.svgPaths
    .map((svgPath) => svgPath.svgCommands)
    .join(' ');
  const matcher = InstanceMatcher.fromPathCommand(joinedSymbolSvgCommands);

  // Filter out all paths that are a sub match and find matches that only consist of one SVGElement
  const potPidPaths: PidPath[] = [];
  for (let i = 0; i < pidPaths.length; i++) {
    const matchResult = matcher.matches([pidPaths[i]]);
    if (matchResult.match === MatchResult.SubMatch) {
      potPidPaths.push(pidPaths[i]);
    } else if (matchResult.match === MatchResult.Match) {
      matches.push({ pathIds: [pidPaths[i].pathId], scale: matchResult.scale });
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

    if (matchResult.result.match === MatchResult.Match) {
      potMatchIndexes.forEach((v) => {
        matchedPotPidPaths[v] = true;
      });
      matches.push({
        pathIds: potPidPaths
          .filter((_, index) => matchResult.matchIndexes?.includes(index))
          .map((pidPath) => pidPath.pathId),
        scale: matchResult.result.scale,
      });
    }
  }

  return matches;
};

interface MatchSearchResult {
  result: InstanceMatch;
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
    if (matchResult.match === MatchResult.NotMatch) continue;

    if (matchResult.match === MatchResult.Match) {
      return {
        result: matchResult,
        matchIndexes: [...potMatchIndexes, i],
      };
    }
    if (matchResult.match === MatchResult.SubMatch) {
      // Check if it is a match with or without the new potential PidPath
      const matchResultWithNewPotPidPath = matchSearch(
        matcher,
        i + 1,
        [...potMatchIndexes, i],
        potPidPaths,
        matchedPotPidPaths,
        withoutDepth
      );
      if (matchResultWithNewPotPidPath.result.match === MatchResult.Match) {
        return matchResultWithNewPotPidPath;
      }

      if (withoutDepth >= 1) return { result: { match: MatchResult.NotMatch } };

      const matchResultWithoutNewPotPidPath = matchSearch(
        matcher,
        i + 1,
        [...potMatchIndexes],
        potPidPaths,
        matchedPotPidPaths,
        withoutDepth + 1
      );
      if (matchResultWithoutNewPotPidPath.result.match === MatchResult.Match) {
        return matchResultWithoutNewPotPidPath;
      }

      return { result: { match: MatchResult.NotMatch } };
    }
  }
  return { result: { match: MatchResult.NotMatch } };
};
