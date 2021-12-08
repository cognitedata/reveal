import { DiagramSymbol, SvgRepresentation, DiagramSymbolInstance } from 'types';

import { newMatcher, MatchResult, PidPath, PidTspan } from './InstanceMatcher';

export class SvgDocument {
  pidPaths: PidPath[];
  pidLabels: PidTspan[];
  constructor(paths: PidPath[], labels: PidTspan[]) {
    this.pidPaths = paths;
    this.pidLabels = labels;
  }

  getInternalPathById(pathId: string): PidPath | null {
    // Change to hashmap if any performance issues
    for (let i = this.pidPaths.length - 1; i >= 0; --i) {
      if (this.pidPaths[i].pathId === pathId) {
        return this.pidPaths[i];
      }
    }
    return null;
  }

  getPidTspanById(id: string): PidTspan | null {
    for (let i = this.pidLabels.length - 1; i >= 0; --i) {
      if (this.pidLabels[i].id === id) {
        return this.pidLabels[i];
      }
    }
    return null;
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
        labels: [],
      } as DiagramSymbolInstance;
    });

    return symbolInstances;
  };

  findAllInstancesOfSvgRepresentation = (
    svgRepresentation: SvgRepresentation
  ): string[][] => {
    const matches: PidPath[][] = [];

    const joinedSymbolSvgCommands = svgRepresentation.svgPaths
      .map((svgPath) => svgPath.svgCommands)
      .join(' ');

    const matcher = newMatcher(joinedSymbolSvgCommands);

    const all = this.pidPaths;

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

  static fromSVGElements(svgElements: SVGElement[]) {
    const paths = svgElements
      .filter((svgElement) => svgElement instanceof SVGPathElement)
      .map((svgElement) => {
        return PidPath.fromSVGElement(svgElement as SVGPathElement);
      });
    const labels = svgElements
      .filter((svgElement) => svgElement instanceof SVGTSpanElement)
      .map((svgElement) => {
        return PidTspan.fromSVGTSpan(svgElement as SVGTSpanElement);
      });
    return new SvgDocument(paths, labels);
  }
}
