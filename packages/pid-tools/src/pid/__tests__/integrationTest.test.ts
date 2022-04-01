/* eslint-disable no-console,@typescript-eslint/no-unused-vars */
import { readFileSync } from 'fs';
import path from 'path';

import { PidDocument } from '../../pid/PidDocument';
import { InstanceMatcher, MatchResult } from '../../matcher/InstanceMatcher';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '../../types';
import { getNoneOverlappingSymbolInstances } from '../../utils/diagramInstanceUtils';
import { GraphDocument } from '../..';

interface Graph {
  symbols: DiagramSymbol[];
  symbolInstances: DiagramSymbolInstance[];
  lines: DiagramLineInstance[];
}

const loadPidDocumentAndGraph = (
  svgPath: string,
  graphPath: string
): [PidDocument, Graph] => {
  const svgContent = readFileSync(path.resolve(__dirname, svgPath));
  const pidDocument = PidDocument.fromNormalizedSvgString(
    svgContent.toString()
  );

  const rawdata = readFileSync(path.resolve(__dirname, graphPath));
  const graph = JSON.parse(rawdata.toString()) as GraphDocument;

  if (graph.pathReplacementGroups) {
    graph.pathReplacementGroups.forEach((prg) => {
      prg.replacements.forEach((pr) => {
        pidDocument.applyPathReplacement(pr);
      });
    });
  }

  return [pidDocument, graph];
};

const checkIfAllSymbolInstancesIsAMatch = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  symbols: DiagramSymbol[]
) => {
  symbolInstances.forEach((symbolInstance: DiagramSymbolInstance) => {
    const correspondingSymbol = symbols.find(
      (symbol) => symbol.id === symbolInstance.symbolId
    ) as DiagramSymbol;

    const matcher = InstanceMatcher.fromPathCommand(
      correspondingSymbol.svgRepresentation.svgPaths
        .map((svgPath) => svgPath.svgCommands)
        .join(' ')
    );

    const pidPaths = pidDocument.pidPaths.filter((pidPath) =>
      symbolInstance.pathIds.includes(pidPath.pathId)
    );

    // Check if the symbol and symbol instance have the same number of path segments
    expect(pidPaths.flatMap((p) => p.segmentList).length).toBe(
      matcher.pathSegments.length
    );

    const matchResult = matcher
      .rotate(symbolInstance.rotation)
      .matches(pidPaths);
    expect(matchResult.match).toBe(MatchResult.Match);
  });
};

const checkFindAllInstancesOfSymbol = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  symbols: DiagramSymbol[]
) => {
  let allFoundSymbolInstances: DiagramSymbolInstance[] = [];
  symbols.forEach((newSymbol) => {
    const newSymbolInstances = pidDocument.findAllInstancesOfSymbol(newSymbol);
    allFoundSymbolInstances = getNoneOverlappingSymbolInstances(
      pidDocument,
      newSymbolInstances,
      allFoundSymbolInstances
    ).instancesToKeep;
  });

  symbols.forEach((symbol) => {
    const foundSymbolInstances = allFoundSymbolInstances.filter(
      (symbolInstance) => symbolInstance.symbolId === symbol.id
    );
    const expectedSymbolInstances = symbolInstances.filter(
      (symbolInstance) => symbolInstance.symbolId === symbol.id
    );

    if (foundSymbolInstances.length !== expectedSymbolInstances.length) {
      console.log('Not correct', {
        symbol,
        foundSymbolInstances,
        expectedSymbolInstances,
      });
    }

    expect(foundSymbolInstances.length).toBe(expectedSymbolInstances.length);
  });
};

describe('IntegrationMatcherTests', () => {
  test('pid.svg', () => {
    // const svgPath = './data/pid.svg';
    // const [pidDocument, graph] = loadPidDocumentAndGraph(
    //   svgPath,
    //   './data/pidGraph.json'
    // );
    // checkIfAllSymbolInstancesIsAMatch(
    //   pidDocument,
    //   graph.symbolInstances,
    //   graph.symbols
    // );
    // checkFindAllInstancesOfSymbol(
    //   pidDocument,
    //   graph.symbolInstances,
    //   graph.symbols
    // );
  });

  test('iso.svg', () => {
    // const svgPath = './data/iso.svg';
    // const [pidDocument, graph] = loadPidDocumentAndGraph(
    //   svgPath,
    //   './data/isoGraph.json'
    // );
    // checkIfAllSymbolInstancesIsAMatch(
    //   pidDocument,
    //   graph.symbolInstances,
    //   graph.symbols
    // );
    // checkFindAllInstancesOfSymbol(
    //   pidDocument,
    //   graph.symbolInstances,
    //   graph.symbols
    // );
  });
});
