import { readFileSync, existsSync } from 'fs';
import path from 'path';

import { PidDocument } from '../../pid/PidDocument';
import { InstanceMatcher, MatchResult } from '../../matcher/InstanceMatcher';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '../../types';
import { getNoneOverlappingSymbolInstances } from '../../utils/diagramInstanceUtils';

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
  const isoGraph = JSON.parse(rawdata.toString());

  return [pidDocument, isoGraph];
};

const checkIfAllSymbolInstancesIsAMatch = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  symbols: DiagramSymbol[]
) => {
  symbolInstances.forEach((symbolInstance: DiagramSymbolInstance) => {
    const correspondingSymbol = symbols.find(
      (symbol) => symbol.symbolName === symbolInstance.symbolName
    ) as DiagramSymbol;

    const matcher = InstanceMatcher.fromPathCommand(
      correspondingSymbol.svgRepresentations[0].svgPaths
        .map((svgPath) => svgPath.svgCommands)
        .join(' ')
    );

    const pidPaths = pidDocument.pidPaths.filter((pidPath) =>
      symbolInstance.pathIds.includes(pidPath.pathId)
    );

    // Check if the symbol and symbol instance have the same number of path segments
    expect(
      pidPaths.map((p) => p.segmentList.length).reduce((a, b) => a + b)
    ).toBe(matcher.segmentList.length);

    const matchResult = matcher.matches(pidPaths);
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
    );
  });

  symbols.forEach((symbol) => {
    const foundSymbolInstances = allFoundSymbolInstances.filter(
      (symbolInstance) => symbolInstance.symbolName === symbol.symbolName
    );
    const expectedSymbolInstances = symbolInstances.filter(
      (symbolInstance) => symbolInstance.symbolName === symbol.symbolName
    );

    expect(foundSymbolInstances.length).toBe(expectedSymbolInstances.length);
  });
};

const fileExists = (filePath: string) => {
  return existsSync(path.resolve(__dirname, filePath));
};

describe('IntegrationMatcherTests', () => {
  test('pid.svg', () => {
    const svgPath = './data/pid.svg';
    if (!fileExists(svgPath)) return;

    const [pidDocument, graph] = loadPidDocumentAndGraph(
      svgPath,
      './data/pidGraph.json'
    );

    checkIfAllSymbolInstancesIsAMatch(
      pidDocument,
      graph.symbolInstances,
      graph.symbols
    );

    checkFindAllInstancesOfSymbol(
      pidDocument,
      graph.symbolInstances,
      graph.symbols
    );
  });

  test('iso.svg', () => {
    const svgPath = './data/iso.svg';
    if (!fileExists(svgPath)) return;

    const [pidDocument, graph] = loadPidDocumentAndGraph(
      './data/iso.svg',
      './data/isoGraph.json'
    );

    checkIfAllSymbolInstancesIsAMatch(
      pidDocument,
      graph.symbolInstances,
      graph.symbols
    );

    // checkFindAllInstancesOfSymbol(
    //   pidDocument,
    //   graph.symbolInstances,
    //   graph.symbols
    // );
  });
});
