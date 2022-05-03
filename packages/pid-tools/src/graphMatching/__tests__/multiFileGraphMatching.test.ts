import {
  GraphDocument,
  DiagramType,
  DiagramSymbolInstanceOutputFormat,
  SymbolType,
  Rect,
  DiagramLineInstanceOutputFormat,
} from '../../types';
import { matchGraphs } from '../graphMatching';
import {
  mutateGraphByAppendingSymbolConnections,
  mutateGraphToGlobalizedIds,
  mergeGraphs,
} from '../multiFileGraphMatching';
import { SymbolConnection } from '../types';

const boundingBox: Rect = { x: 0, y: 0, width: 0, height: 0 };

const getDiagramInstanceOutputFormat = (
  id: string,
  type: SymbolType,
  inferedLineNumbers: string[] | undefined = undefined
): DiagramSymbolInstanceOutputFormat => {
  return {
    pathIds: ['something'],
    symbolId: 'something1',
    id,
    type,
    scale: 1,
    rotation: 0,
    labels: [],
    labelIds: [],
    svgRepresentation: { boundingBox, svgPaths: [] },
    lineNumbers: [],
    inferedLineNumbers: inferedLineNumbers ?? [],
  };
};

const getDiagramLineOutputFormat = (
  id: string,
  inferedLineNumbers: string[] | undefined = undefined
): DiagramLineInstanceOutputFormat => {
  return {
    pathIds: [id],
    id,
    type: 'Line',
    labels: [],
    labelIds: [],
    svgRepresentation: { boundingBox, svgPaths: [] },
    lineNumbers: [],
    inferedLineNumbers: inferedLineNumbers ?? [],
  };
};

const getLabelFromText = (id: string, text: string) => {
  return {
    id: 'mock-id',
    text,
    boundingBox,
  };
};

const getDiagramInstrumentOutputFormat = (
  id: string,
  labelTexts: string[],
  inferedLineNumbers: string[] | undefined = undefined
) => {
  const labels = labelTexts.map((labelText, i) =>
    getLabelFromText(`id-${i}`, labelText)
  );

  return {
    pathIds: ['something'],
    type: 'Instrument',
    symbolId: 'something1',
    id,
    scale: 1,
    rotation: 0,
    labels,
    labelIds: labels.map((label) => label.id),
    svgRepresentation: { boundingBox, svgPaths: [] },
    lineNumbers: [],
    inferedLineNumbers: inferedLineNumbers ?? [],
  } as DiagramSymbolInstanceOutputFormat;
};

describe('convertGraphToGlobalIds', () => {
  test('simple graph, check we add correct id prefix', async () => {
    const graphDocument: GraphDocument = {
      documentMetadata: {
        name: 'file1',
        type: DiagramType.pid,
        documentNumber: 1,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [
        getDiagramInstanceOutputFormat('v1', 'Valve'),
        getDiagramInstrumentOutputFormat('i1', ['ABC', '123']),
      ],
      lines: [getDiagramLineOutputFormat('l1')],
      connections: [
        { start: 'v1', end: 'l1', direction: 'unknown' },
        { start: 'l1', end: 'i1', direction: 'unknown' },
      ],
      pathReplacementGroups: [],
      lineNumbers: ['L132'],
      equipmentTags: [],
      labels: [],
    };

    const filename = graphDocument.documentMetadata.name;
    const newGraph = mutateGraphToGlobalizedIds(graphDocument);

    newGraph.connections.forEach((con) => {
      expect(con.end.startsWith(filename)).toEqual(true);
      expect(con.start.startsWith(filename)).toEqual(true);
    });

    graphDocument.lines.forEach((instance) => {
      expect(instance.id.startsWith(filename)).toEqual(true);
    });

    graphDocument.symbolInstances.forEach((instance) => {
      expect(instance.id.startsWith(filename)).toEqual(true);
    });
  });
});

describe('mergeGraphs', () => {
  test('Merge two graphs', async () => {
    const graphDocument1: GraphDocument = {
      documentMetadata: {
        name: 'file1',
        type: DiagramType.pid,
        documentNumber: 1,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [
        getDiagramInstanceOutputFormat('v1', 'Valve'),
        getDiagramInstrumentOutputFormat('i1', ['ABC', '123']),
      ],
      lines: [getDiagramLineOutputFormat('l1')],
      connections: [
        { start: 'v1', end: 'l1', direction: 'unknown' },
        { start: 'l1', end: 'i1', direction: 'unknown' },
      ],
      pathReplacementGroups: [],
      lineNumbers: ['L132'],
      equipmentTags: [],
      labels: [],
    };

    const graphDocument2: GraphDocument = {
      documentMetadata: {
        name: 'file2',
        type: DiagramType.pid,
        documentNumber: 1,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [getDiagramInstanceOutputFormat('v2', 'Valve')],
      lines: [getDiagramLineOutputFormat('l2')],
      connections: [{ start: 'v2', end: 'l2', direction: 'unknown' }],
      pathReplacementGroups: [],
      lineNumbers: ['L132'],
      equipmentTags: [],
      labels: [],
    };

    const combinedGraph = mergeGraphs([graphDocument1, graphDocument2]);
    expect(combinedGraph.diagramSymbolInstances.length).toEqual(3);
    expect(combinedGraph.diagramLineInstances.length).toEqual(2);
    expect(combinedGraph.diagramConnections.length).toEqual(3);
  });
});

describe('match multifileGraphs', () => {
  test('simple 2 P&IDs -> 2 ISOs.', async () => {
    /*
     * pid1: Instrument -> Valve -> line -> instrument -> fileConnection
     * pid2: fileConnection -> Reducer
     */
    const pid1: GraphDocument = {
      documentMetadata: {
        name: 'pid1',
        type: DiagramType.pid,
        documentNumber: 1,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [
        getDiagramInstrumentOutputFormat('i0', ['ASSET0'], ['L001']),
        getDiagramInstanceOutputFormat('i1', 'Valve', ['L001']),
        getDiagramInstrumentOutputFormat('i3', ['ASSET1'], ['L001']),
        getDiagramInstanceOutputFormat('i4', 'File Connection', ['L001']),
      ],
      lines: [getDiagramLineOutputFormat('i2', ['L001'])],
      connections: [
        { start: 'i0', end: 'i1', direction: 'unknown' },
        { start: 'i1', end: 'i2', direction: 'unknown' },
        { start: 'i2', end: 'i3', direction: 'unknown' },
        { start: 'i3', end: 'i4', direction: 'unknown' },
      ],
      pathReplacementGroups: [],
      lineNumbers: ['L001'],
      equipmentTags: [],
      labels: [],
    };

    const pid2: GraphDocument = {
      documentMetadata: {
        name: 'pid2',
        type: DiagramType.pid,
        documentNumber: 1,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [
        getDiagramInstanceOutputFormat('i1', 'File Connection', ['L001']),
        getDiagramInstanceOutputFormat('i3', 'Reducer', ['L001']),
      ],
      lines: [],
      connections: [{ start: 'i1', end: 'i3', direction: 'unknown' }],
      pathReplacementGroups: [],
      lineNumbers: ['L001'],
      equipmentTags: [],
      labels: [],
    };

    /*
     * iso1: Instrument -> Valve ->fileConnection
     * iso2: fileConnection line -> instrument -> Reducer
     */
    const iso1: GraphDocument = {
      documentMetadata: {
        name: 'iso1',
        type: DiagramType.isometric,
        lineNumber: 'L001',
        pageNumber: 1,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [
        getDiagramInstrumentOutputFormat('i0', ['ASSET0'], ['L001']),
        getDiagramInstanceOutputFormat('i1', 'Valve', ['L001']),
        getDiagramInstanceOutputFormat('i3', 'File Connection', ['L001']),
      ],
      lines: [],
      connections: [
        { start: 'i0', end: 'i1', direction: 'unknown' },
        { start: 'i1', end: 'i3', direction: 'unknown' },
      ],
      pathReplacementGroups: [],
      lineNumbers: ['L001'],
      equipmentTags: [],
      labels: [],
    };

    const iso2: GraphDocument = {
      documentMetadata: {
        name: 'iso2',
        type: DiagramType.isometric,
        lineNumber: 'L001',
        pageNumber: 2,
        unit: 'G0001',
      },
      viewBox: boundingBox,
      symbols: [],
      symbolInstances: [
        getDiagramInstanceOutputFormat('i1', 'File Connection', ['L001']),
        getDiagramInstrumentOutputFormat('i3', ['ASSET1'], ['L001']),
        getDiagramInstanceOutputFormat('i4', 'Reducer', ['L001']),
      ],
      lines: [getDiagramLineOutputFormat('i2', ['L001'])],
      connections: [
        { start: 'i1', end: 'i2', direction: 'unknown' },
        { start: 'i2', end: 'i3', direction: 'unknown' },
        { start: 'i3', end: 'i4', direction: 'unknown' },
      ],
      pathReplacementGroups: [],
      lineNumbers: ['L001'],
      equipmentTags: [],
      labels: [],
    };

    const pid1Graph = mutateGraphToGlobalizedIds(pid1);
    const pid2Graph = mutateGraphToGlobalizedIds(pid2);
    const iso1Graph = mutateGraphToGlobalizedIds(iso1);
    const iso2Graph = mutateGraphToGlobalizedIds(iso2);

    const pidCombinedGraph = mergeGraphs([pid1Graph, pid2Graph]);
    const isoCombinedGraph = mergeGraphs([iso1Graph, iso2Graph]);

    expect(pidCombinedGraph.diagramSymbolInstances.length).toEqual(6);
    expect(isoCombinedGraph.diagramSymbolInstances.length).toEqual(6);

    const pidFileLinks: SymbolConnection[] = [
      {
        from: { fileName: 'pid1', instanceId: 'i4' },
        to: { fileName: 'pid2', instanceId: 'i1' },
      },
    ];
    const isoFileLinks: SymbolConnection[] = [
      {
        from: { fileName: 'iso1', instanceId: 'i3' },
        to: { fileName: 'iso2', instanceId: 'i1' },
      },
    ];
    mutateGraphByAppendingSymbolConnections(pidCombinedGraph, pidFileLinks);
    mutateGraphByAppendingSymbolConnections(isoCombinedGraph, isoFileLinks);

    const { symbolMapping, startObjects } = matchGraphs(
      pidCombinedGraph,
      isoCombinedGraph
    );

    expect(startObjects.length).toEqual(2);

    expect(symbolMapping.size).toEqual(4);
    expect(symbolMapping.get('pid1_GLOBAL_i0')?.isoInstanceId).toEqual(
      'iso1_GLOBAL_i0'
    ); // Instrument
    expect(symbolMapping.get('pid1_GLOBAL_i1')?.isoInstanceId).toEqual(
      'iso1_GLOBAL_i1'
    ); // Valve
    expect(symbolMapping.get('pid1_GLOBAL_i3')?.isoInstanceId).toEqual(
      'iso2_GLOBAL_i3'
    ); // Instrument
    expect(symbolMapping.get('pid2_GLOBAL_i3')?.isoInstanceId).toEqual(
      'iso2_GLOBAL_i4'
    ); // Reducer
  });
});
