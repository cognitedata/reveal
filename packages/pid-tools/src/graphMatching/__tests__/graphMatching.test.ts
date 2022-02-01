/* eslint-disable no-console */
import {
  DiagramConnection,
  DiagramInstanceWithPathsOutputFormat,
  DiagramSymbolInstanceOutputFormat,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../../types';
import { matchGraphs } from '../graphMatching';
import {
  getEditDistanceBetweenPaths,
  getOptimalEditDistanceMapping,
} from '../editDistance';
import { Graph } from '../../graph';

import * as isoTest from './data/isoTest-l132-1.json';
import * as pidTest from './data/pidTest-l132.json';

describe('graph matching', () => {
  test('simple graph all similar', async () => {
    const mockPid = {
      diagramSymbolInstances: [
        { type: 'Valve', pathIds: ['i1'] },
        { type: 'Instrument', pathIds: ['i3'], assetExternalId: 'asset1' },
      ],
      diagramLineInstances: [
        { type: 'Line', pathIds: ['i2'] } as DiagramLineInstance,
      ],
      diagramConnections: [
        { start: 'i1', end: 'i2', direction: 'unknown' },
        { start: 'i2', end: 'i3', direction: 'unknown' },
      ],
    } as Graph;

    const mockIso = {
      diagramSymbolInstances: [
        { type: 'Valve', pathIds: ['p1'] },
        { type: 'Instrument', pathIds: ['p3'], assetExternalId: 'asset1' },
      ],
      diagramLineInstances: [{ type: 'Line', pathIds: ['p2'] }],
      diagramConnections: [
        { start: 'p1', end: 'p2', direction: 'unknown' },
        { start: 'p2', end: 'p3', direction: 'unknown' },
      ],
    } as Graph;

    const { symbolMapping } = matchGraphs(mockPid, mockIso);

    expect(symbolMapping.size).toBe(2);
    expect(symbolMapping.has('i1')).toBe(true);
    expect(symbolMapping.has('i2')).toBe(false);
    expect(symbolMapping.has('i3')).toBe(true);

    expect(symbolMapping.get('i1')?.isoInstanceId).toBe('p1');
    expect(symbolMapping.get('i3')?.isoInstanceId).toBe('p3');
  });

  test('simple graph one extra element in ISO', async () => {
    const mockPid = {
      diagramSymbolInstances: [
        { type: 'Valve', pathIds: ['i1'] },
        { type: 'Instrument', pathIds: ['i3'], assetExternalId: 'asset1' },
      ],
      diagramLineInstances: [
        { type: 'Line', pathIds: ['i2'] } as DiagramLineInstance,
      ],
      diagramConnections: [
        { start: 'i1', end: 'i2', direction: 'unknown' },
        { start: 'i2', end: 'i3', direction: 'unknown' },
      ],
    } as Graph;

    const mockIso = {
      diagramSymbolInstances: [
        { type: 'Valve', pathIds: ['p1'] },
        { type: 'Reducer', pathIds: ['p4'] },
        { type: 'Instrument', pathIds: ['p3'], assetExternalId: 'asset1' },
      ],
      diagramLineInstances: [{ type: 'Line', pathIds: ['p2'] }],
      diagramConnections: [
        { start: 'p1', end: 'p2', direction: 'unknown' },
        { start: 'p2', end: 'p4', direction: 'unknown' },
        { start: 'p4', end: 'p3', direction: 'unknown' },
      ],
    } as Graph;

    const { symbolMapping } = matchGraphs(mockPid, mockIso);

    expect(symbolMapping.size).toBe(2);
    expect(symbolMapping.has('i1')).toBe(true);
    expect(symbolMapping.has('i2')).toBe(false);
    expect(symbolMapping.has('i3')).toBe(true);

    expect(symbolMapping.get('i1')?.isoInstanceId).toBe('p1');
    expect(symbolMapping.get('i3')?.isoInstanceId).toBe('p3');
  });

  test('simple graph - one extra element in PID', async () => {
    const mockPid = {
      diagramSymbolInstances: [
        { type: 'Valve', pathIds: ['i1'] },
        { type: 'Reducer', pathIds: ['i4'] },
        { type: 'Instrument', pathIds: ['i3'], assetExternalId: 'asset1' },
      ],
      diagramLineInstances: [
        { type: 'Line', pathIds: ['i2'] } as DiagramLineInstance,
      ],
      diagramConnections: [
        { start: 'i1', end: 'i2', direction: 'unknown' },
        { start: 'i2', end: 'i4', direction: 'unknown' },
        { start: 'i4', end: 'i3', direction: 'unknown' },
      ],
    } as Graph;

    const mockIso = {
      diagramSymbolInstances: [
        { type: 'Valve', pathIds: ['p1'] },
        { type: 'Instrument', pathIds: ['p3'], assetExternalId: 'asset1' },
      ],
      diagramLineInstances: [{ type: 'Line', pathIds: ['p2'] }],
      diagramConnections: [
        { start: 'p1', end: 'p2', direction: 'unknown' },
        { start: 'p2', end: 'p3', direction: 'unknown' },
      ],
    } as Graph;

    const { symbolMapping } = matchGraphs(mockPid, mockIso);
    // expect(symbolMapping.size).toBe(3);
    expect(symbolMapping.has('i1')).toBe(true);
    expect(symbolMapping.has('i2')).toBe(false);
    expect(symbolMapping.has('i3')).toBe(true);

    expect(symbolMapping.get('i1')?.isoInstanceId).toBe('p1');
    expect(symbolMapping.get('i3')?.isoInstanceId).toBe('p3');
  });
});

describe('test getEditDistanceBetweenPaths and getOptimalEditDistanceMapping', () => {
  test('simple', async () => {
    const shortestPathsPid = [
      {
        to: 'a',
        from: 'a',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'a',
        to: 'p1',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
          { type: 'Valve', pathIds: ['p1'] },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'a',
        to: 'b',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
          { type: 'Valve', pathIds: ['v1'] },
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'a',
        to: 'p2',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
          { type: 'Valve', pathIds: ['p1'] },
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['p2'] },
        ] as DiagramSymbolInstance[],
      },
      // From B:
      {
        to: 'b',
        from: 'b',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'b',
        to: 'p1',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['p1'] },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'b',
        to: 'p2',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['p2'] },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'b',
        to: 'a',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['v1'] },
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
        ] as DiagramSymbolInstance[],
      },
    ];

    const shortestPathsIso = [
      {
        to: 'a',
        from: 'a',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'a',
        to: 'v1',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
          { type: 'Valve', pathIds: ['v1'] },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'a',
        to: 'b',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
          { type: 'Valve', pathIds: ['v1'] },
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'a',
        to: 'v2',
        path: [
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
          { type: 'Valve', pathIds: ['v1'] },
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['v2'] },
        ] as DiagramSymbolInstance[],
      },
      // From B:
      {
        to: 'b',
        from: 'b',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'b',
        to: 'v1',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['v1'] },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'b',
        to: 'v2',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['v2'] },
        ] as DiagramSymbolInstance[],
      },
      {
        from: 'b',
        to: 'a',
        path: [
          { type: 'Instrument', pathIds: ['b'], assetExternalId: 'asset2' },
          { type: 'Valve', pathIds: ['v1'] },
          { type: 'Instrument', pathIds: ['a'], assetExternalId: 'asset1' },
        ] as DiagramSymbolInstance[],
      },
    ];

    const editDistances = getEditDistanceBetweenPaths(
      shortestPathsPid,
      shortestPathsIso
    );

    const symbolMapping = getOptimalEditDistanceMapping(editDistances);

    expect(symbolMapping.get('p1')?.isoInstanceId).toEqual('v1');
    expect(symbolMapping.get('p2')?.isoInstanceId).toEqual('v2');
    expect(symbolMapping.get('a')?.isoInstanceId).toEqual('a');
    expect(symbolMapping.get('b')?.isoInstanceId).toEqual('b');
  });
});

const readTestData = (jsonData: any) => {
  const newLinesOutputFormat =
    jsonData.lines as DiagramInstanceWithPathsOutputFormat[];

  const newLines = newLinesOutputFormat.map((newLineOutputFormat) => {
    return {
      type: 'Line',
      pathIds: newLineOutputFormat.pathIds,
      labelIds: newLineOutputFormat.labelIds,
    } as DiagramLineInstance;
  });

  const newSymbolInstancesOutputFormat =
    jsonData.symbolInstances as DiagramSymbolInstanceOutputFormat[];

  const newSymbolInstances: DiagramSymbolInstance[] = [];
  newSymbolInstancesOutputFormat.forEach((symbolInstanceOutputFormat) => {
    newSymbolInstances.push({
      type: symbolInstanceOutputFormat.type,
      symbolId: symbolInstanceOutputFormat.symbolId,
      pathIds: symbolInstanceOutputFormat.pathIds,
      labelIds: symbolInstanceOutputFormat.labelIds,
      assetExternalId: symbolInstanceOutputFormat.assetExternalId || '',
    } as DiagramSymbolInstance);
  });

  const newConnections = jsonData.connections as DiagramConnection[];

  return {
    diagramLineInstances: newLines,
    diagramSymbolInstances: newSymbolInstances,
    diagramConnections: newConnections,
  };
};

const getTestData = (testData: any) => {
  const data: Graph = readTestData(testData);
  return data;
};

describe('real test', () => {
  test('simple', async () => {
    const mockPid = getTestData(pidTest);

    const mockIso = getTestData(isoTest);

    const pidIsoMapping = [
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path594-path596',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path126-path26',
        },
      },
      {
        from: { fileName: 'pidTest-l132.json', instanceId: 'path582' },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId:
            'path170-path174-path178-path182-path186-path190-path194-path198-path202-path206-path210-path214-path218-path222-path226-path230',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1360-path1362',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path318-path326-path330-path334',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path164-path166',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path398-path402-path406',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path4352-path4354',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path3904-path3908-path3912',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1270-path1274',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path978-path982-path994',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1876-path1878-path1880',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path1006-path1010-path986',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1286-path1288',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path912-path940',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1256',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId:
            'path2074-path2078-path2082-path2086-path2090-path2094-path2098-path2102-path2106-path2110-path2114-path2118-path2122-path2126-path2130-path2134',
        },
      },
      {
        from: { fileName: 'pidTest-l132.json', instanceId: 'path102' },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId:
            'path1056-path1060-path1064-path1068-path1072-path1076-path1080-path1084-path1088-path1092-path1096-path1100-path1104-path1108-path1112-path1116',
        },
      },
      {
        from: { fileName: 'pidTest-l132.json', instanceId: 'path116' },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path1254-path1258-path1266-path1270-path1274-path1278',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1886-path1888-path602-path606',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path106-path118-path122',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path1246-path1904',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path806-path814-path818-path822',
        },
      },
      {
        from: {
          fileName: 'pidTest-l132.json',
          instanceId: 'path2158-path2160-path2162',
        },
        to: {
          fileName: 'isoTest-l132-1.json',
          instanceId: 'path82-path86-path90',
        },
      },
    ];

    const { symbolMapping, editDistances } = matchGraphs(mockPid, mockIso);

    pidIsoMapping.forEach((pidIsoMap) => {
      const pidInstanceId = pidIsoMap.from.instanceId;
      const isoInstanceId = pidIsoMap.to.instanceId;
      if (editDistances.get(pidInstanceId)?.get(isoInstanceId) === undefined) {
        console.log(
          `No path to pid '${pidInstanceId}' and/or iso: '${isoInstanceId}'`
        );
      } else if (
        symbolMapping.get(pidInstanceId)?.isoInstanceId !== isoInstanceId
      ) {
        console.log(
          `Not corret symbol mapping from pid: '${pidInstanceId}' to iso: '${isoInstanceId}'`
        );

        if (symbolMapping.get(pidInstanceId) === undefined) return;

        let chosenSum = 0;
        symbolMapping.get(pidInstanceId)?.editDistances.forEach((d) => {
          chosenSum += d.editDistance;
        });
        console.log(
          'Chosen',
          symbolMapping.get(pidInstanceId)?.isoInstanceId,
          chosenSum,
          symbolMapping.get(pidInstanceId)?.editDistances
        );

        let expectedSum = 0;
        editDistances
          .get(pidInstanceId)
          ?.get(isoInstanceId)
          ?.forEach((d) => {
            expectedSum += d.editDistance;
          });
        console.log(
          'Expected',
          expectedSum,
          editDistances?.get(pidInstanceId)?.get(isoInstanceId)
        );
      }

      expect(symbolMapping.get(pidInstanceId)?.isoInstanceId).toBe(
        isoInstanceId
      );
    });

    expect(symbolMapping.size).toBe(pidIsoMapping.length);
  });
});
