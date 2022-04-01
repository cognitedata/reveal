/* eslint-disable no-console */
import {
  // DiagramConnection,
  DiagramLineInstanceOutputFormat,
  DiagramSymbolInstanceOutputFormat,
  SymbolType,
} from '../../types';
import {
  getUniqueCrossConnections,
  isCrossConnection,
  matchGraphs,
} from '../graphMatching';
import {
  getEditDistanceBetweenPaths,
  getOptimalEditDistanceMapping,
} from '../editDistance';
import { GraphOutputFormat, PathOutputFormat } from '../..';

// import * as isoTest from './data/isoTest-l132-1.json';
// import * as pidTest from './data/pidTest-l132.json';

const MOCK_BBOX = { x: 0, y: 0, width: 0, height: 0 };

const createSymbolInstance = (
  id: string,
  type: SymbolType,
  labelsText: string[],
  inferedLineNumbers: string[] | undefined = undefined
): DiagramSymbolInstanceOutputFormat => {
  const labels = labelsText.map((text, i) => ({
    id: `tspan${i + 1}`,
    text,
    boundingBox: MOCK_BBOX,
  }));

  // eslint-disable-next-line no-param-reassign
  inferedLineNumbers = inferedLineNumbers ?? [];

  return {
    id,
    type,
    labels,
    symbolId: 'Unused-field',
    pathIds: [], // not used
    scale: 1, // not used
    rotation: 0, // not used
    direction: undefined, // not used
    svgRepresentation: { svgPaths: [], boundingBox: MOCK_BBOX },
    labelIds: labels.map((label) => label.id),
    lineNumbers: inferedLineNumbers,
    inferedLineNumbers,
  };
};

const createLineInstance = (
  id: string,
  inferedLineNumbers: string[] | undefined = undefined
): DiagramLineInstanceOutputFormat => {
  // eslint-disable-next-line no-param-reassign
  inferedLineNumbers = inferedLineNumbers ?? [];

  return {
    type: 'Line',
    pathIds: [], // not used
    id,
    svgRepresentation: { svgPaths: [], boundingBox: MOCK_BBOX },
    labels: [],
    labelIds: [],
    lineNumbers: inferedLineNumbers,
    inferedLineNumbers,
  };
};

// const getTestData = (jsonData: any): GraphOutputFormat => {
//   const diagramLineInstances =
//     jsonData.lines as DiagramLineInstanceOutputFormat[];

//   const diagramSymbolInstances =
//     jsonData.symbolInstances as DiagramSymbolInstanceOutputFormat[];

//   const diagramConnections = jsonData.connections as DiagramConnection[];

//   return {
//     diagramLineInstances,
//     diagramSymbolInstances,
//     diagramConnections,
//   };
// };

describe('cross conncetion', () => {
  test('isCrossConnection instrument', async () => {
    const pidInstrument1 = createSymbolInstance('pid-i1', 'Instrument', [
      'ABC',
      '123',
    ]);
    const pidInstrument2 = createSymbolInstance('pid-i2', 'Instrument', [
      'ABC',
    ]);

    const isoInstrument1 = createSymbolInstance('iso-i1', 'Instrument', [
      'ABC',
      '123',
    ]);
    const isoInstrument2 = createSymbolInstance('iso-i2', 'Instrument', [
      'ABC',
    ]);

    expect(isCrossConnection(pidInstrument1, isoInstrument1)).toBe(true);
    expect(isCrossConnection(pidInstrument1, isoInstrument2)).toBe(false);

    expect(isCrossConnection(pidInstrument2, isoInstrument1)).toBe(false);
    expect(isCrossConnection(pidInstrument2, isoInstrument2)).toBe(true);
  });

  test('getUniqueCrossConnections', async () => {
    const pidInstrument1 = createSymbolInstance('pid-i1', 'Instrument', [
      'ABC',
      '123',
    ]);
    const pidInstrument2 = createSymbolInstance('pid-i2', 'Instrument', [
      'ABC',
      '234',
    ]);

    const isoInstrument1 = createSymbolInstance('iso-i1', 'Instrument', [
      'ABC',
      '123',
    ]);
    const isoInstrument2 = createSymbolInstance('iso-i2', 'Instrument', [
      'ABC',
      '123',
    ]);
    const isoInstrument3 = createSymbolInstance('iso-i3', 'Instrument', [
      'ABC',
      '234',
    ]);

    const uniqueCrossConnections = getUniqueCrossConnections(
      [pidInstrument1, pidInstrument2],
      [isoInstrument1, isoInstrument2, isoInstrument3]
    );

    expect(uniqueCrossConnections.length).toBe(1);
    expect(uniqueCrossConnections[0].pidInstanceId).toBe('pid-i2');
    expect(uniqueCrossConnections[0].isoInstanceId).toBe('iso-i3');
  });
});

describe('graph matching', () => {
  test('simple graph all similar', async () => {
    const pidGraph: GraphOutputFormat = {
      diagramSymbolInstances: [
        createSymbolInstance('pid-v', 'Valve', [], ['L001']),
        createSymbolInstance('pid-i', 'Instrument', ['ABC', '123'], ['L001']),
      ],
      diagramLineInstances: [createLineInstance('pid-l', ['L001'])],
      diagramConnections: [
        { start: 'pid-v', end: 'pid-l', direction: 'unknown' },
        { start: 'pid-l', end: 'pid-i', direction: 'unknown' },
      ],
      diagramTags: [],
    };

    const isoGraph: GraphOutputFormat = {
      diagramSymbolInstances: [
        createSymbolInstance('iso-v', 'Valve', [], ['L001']),
        createSymbolInstance('iso-i', 'Instrument', ['ABC', '123'], ['L001']),
      ],
      diagramLineInstances: [createLineInstance('iso-l', ['L001'])],
      diagramConnections: [
        { start: 'iso-v', end: 'iso-l', direction: 'unknown' },
        { start: 'iso-l', end: 'iso-i', direction: 'unknown' },
      ],
      diagramTags: [],
    };

    const { symbolMapping } = matchGraphs(pidGraph, isoGraph);

    expect(symbolMapping.size).toBe(2);
    expect(symbolMapping.has('pid-v')).toBe(true);
    expect(symbolMapping.has('pid-i')).toBe(true);
    expect(symbolMapping.has('pid-l')).toBe(false);

    expect(symbolMapping.get('pid-v')?.isoInstanceId).toBe('iso-v');
    expect(symbolMapping.get('pid-i')?.isoInstanceId).toBe('iso-i');
  });

  test('simple graph one extra element in ISO', async () => {
    const pidGraph: GraphOutputFormat = {
      diagramSymbolInstances: [
        createSymbolInstance('pid-v', 'Valve', [], ['L001']),
        createSymbolInstance('pid-i', 'Instrument', ['ABC', '123'], ['L001']),
      ],
      diagramLineInstances: [createLineInstance('pid-l', ['L001'])],
      diagramConnections: [
        { start: 'pid-v', end: 'pid-l', direction: 'unknown' },
        { start: 'pid-l', end: 'pid-i', direction: 'unknown' },
      ],
      diagramTags: [],
    };

    const isoGraph: GraphOutputFormat = {
      diagramSymbolInstances: [
        createSymbolInstance('iso-v', 'Valve', [], ['L001']),
        createSymbolInstance('iso-i', 'Instrument', ['ABC', '123'], ['L001']),
        createSymbolInstance('iso-r', 'Reducer', [], ['L001']),
      ],
      diagramLineInstances: [createLineInstance('iso-l', ['L001'])],
      diagramConnections: [
        { start: 'iso-v', end: 'iso-l', direction: 'unknown' },
        { start: 'iso-l', end: 'iso-i', direction: 'unknown' },
      ],
      diagramTags: [],
    };

    const { symbolMapping } = matchGraphs(pidGraph, isoGraph);

    expect(symbolMapping.size).toBe(2);
    expect(symbolMapping.has('pid-v')).toBe(true);
    expect(symbolMapping.has('pid-i')).toBe(true);
    expect(symbolMapping.has('pid-l')).toBe(false);

    expect(symbolMapping.get('pid-v')?.isoInstanceId).toBe('iso-v');
    expect(symbolMapping.get('pid-i')?.isoInstanceId).toBe('iso-i');
  });

  test('simple graph one extra element in PID', async () => {
    const mockPid: GraphOutputFormat = {
      diagramSymbolInstances: [
        createSymbolInstance('pid-v', 'Valve', [], ['L001']),
        createSymbolInstance('pid-i', 'Instrument', ['ABC', '123'], ['L001']),
        createSymbolInstance('iso-r', 'Reducer', [], ['L001']),
      ],
      diagramLineInstances: [createLineInstance('pid-l', ['L001'])],
      diagramConnections: [
        { start: 'pid-v', end: 'pid-l', direction: 'unknown' },
        { start: 'pid-l', end: 'pid-i', direction: 'unknown' },
      ],
      diagramTags: [],
    };

    const mockIso: GraphOutputFormat = {
      diagramSymbolInstances: [
        createSymbolInstance('iso-v', 'Valve', [], ['L001']),
        createSymbolInstance('iso-i', 'Instrument', ['ABC', '123'], ['L001']),
      ],
      diagramLineInstances: [createLineInstance('iso-l', ['L001'])],
      diagramConnections: [
        { start: 'iso-v', end: 'iso-l', direction: 'unknown' },
        { start: 'iso-l', end: 'iso-i', direction: 'unknown' },
      ],
      diagramTags: [],
    };

    const { symbolMapping } = matchGraphs(mockPid, mockIso);

    expect(symbolMapping.size).toBe(2);
    expect(symbolMapping.has('pid-v')).toBe(true);
    expect(symbolMapping.has('pid-i')).toBe(true);
    expect(symbolMapping.has('pid-l')).toBe(false);

    expect(symbolMapping.get('pid-v')?.isoInstanceId).toBe('iso-v');
    expect(symbolMapping.get('pid-i')?.isoInstanceId).toBe('iso-i');
  });

  describe('test getEditDistanceBetweenPaths and getOptimalEditDistanceMapping', () => {
    test('simple', async () => {
      const pidI1 = createSymbolInstance('pid-i1', 'Instrument', [
        'ABC',
        '123',
      ]);
      const pidV1 = createSymbolInstance('pid-v1', 'Valve', []);
      const pidI2 = createSymbolInstance('pid-i2', 'Instrument', [
        'ABC',
        '234',
      ]);
      const pidV2 = createSymbolInstance('pid-v2', 'Valve', []);

      const shortestPathsPid: PathOutputFormat[] = [
        {
          from: pidI1.id,
          to: pidI1.id,
          path: [pidI1],
        },
        {
          from: pidI1.id,
          to: pidV1.id,
          path: [pidI1, pidV1],
        },
        {
          from: pidI1.id,
          to: pidI2.id,
          path: [pidI1, pidV1, pidI2],
        },
        {
          from: pidI1.id,
          to: pidV2.id,
          path: [pidI1, pidV1, pidI2, pidV2],
        },
        // From pidI2:
        {
          to: pidI2.id,
          from: pidI2.id,
          path: [pidI2],
        },
        {
          from: pidI2.id,
          to: pidV1.id,
          path: [pidI2, pidV1],
        },
        {
          from: pidI2.id,
          to: pidV2.id,
          path: [pidI2, pidV2],
        },
        {
          from: pidI2.id,
          to: pidI1.id,
          path: [pidI2, pidV2, pidI1],
        },
      ];

      const isoI1 = createSymbolInstance('iso-i1', 'Instrument', [
        'ABC',
        '123',
      ]);
      const isoV1 = createSymbolInstance('iso-v1', 'Valve', []);
      const isoI2 = createSymbolInstance('iso-i2', 'Instrument', [
        'ABC',
        '234',
      ]);
      const isoV2 = createSymbolInstance('iso-v2', 'Valve', []);
      const shortestPathsIso: PathOutputFormat[] = [
        {
          from: isoI1.id,
          to: isoI1.id,
          path: [isoI1],
        },
        {
          from: isoI1.id,
          to: isoV1.id,
          path: [isoI1, isoV1],
        },
        {
          from: isoI1.id,
          to: isoI2.id,
          path: [isoI1, isoV1, isoI2],
        },
        {
          from: isoI1.id,
          to: isoV2.id,
          path: [isoI1, isoV1, isoI2, isoV2],
        },
        // From isoI2:
        {
          to: isoI2.id,
          from: isoI2.id,
          path: [isoI2],
        },
        {
          from: isoI2.id,
          to: isoV1.id,
          path: [isoI2, isoV1],
        },
        {
          from: isoI2.id,
          to: isoV2.id,
          path: [isoI2, isoV2],
        },
        {
          from: isoI2.id,
          to: isoI1.id,
          path: [isoI2, isoV2, isoI1],
        },
      ];

      const editDistances = getEditDistanceBetweenPaths(
        shortestPathsPid,
        shortestPathsIso
      );

      const symbolMapping = getOptimalEditDistanceMapping(editDistances);

      expect(symbolMapping.get(pidI1.id)?.isoInstanceId).toEqual(isoI1.id);
      expect(symbolMapping.get(pidI1.id)?.editDistances.length).toEqual(2);

      expect(symbolMapping.get(pidI2.id)?.isoInstanceId).toEqual(isoI2.id);
      expect(symbolMapping.get(pidV1.id)?.isoInstanceId).toEqual(isoV1.id);
      expect(symbolMapping.get(pidV2.id)?.isoInstanceId).toEqual(isoV2.id);
    });
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  // describe('real test', () => {
  // eslint-disable-next-line jest/no-commented-out-tests
  //   test('simple', async () => {
  //     const mockPid = getTestData(pidTest);
  //     const mockIso = getTestData(isoTest);

  //     const pidIsoMapping = [
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path594-path596',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path126-path26',
  //         },
  //       },
  //       {
  //         from: { fileName: 'pidTest-l132.json', instanceId: 'path582' },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId:
  //             'path170-path174-path178-path182-path186-path190-path194-path198-path202-path206-path210-path214-path218-path222-path226-path230',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1360-path1362',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path318-path326-path330-path334',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path164-path166',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path398-path402-path406',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path4352-path4354',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path3904-path3908-path3912',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1270-path1274',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path978-path982-path994',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1876-path1878-path1880',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path1006-path1010-path986',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1286-path1288',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path912-path940',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1256',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId:
  //             'path2074-path2078-path2082-path2086-path2090-path2094-path2098-path2102-path2106-path2110-path2114-path2118-path2122-path2126-path2130-path2134',
  //         },
  //       },
  //       {
  //         from: { fileName: 'pidTest-l132.json', instanceId: 'path102' },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId:
  //             'path1056-path1060-path1064-path1068-path1072-path1076-path1080-path1084-path1088-path1092-path1096-path1100-path1104-path1108-path1112-path1116',
  //         },
  //       },
  //       {
  //         from: { fileName: 'pidTest-l132.json', instanceId: 'path116' },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path1254-path1258-path1266-path1270-path1274-path1278',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1886-path1888-path602-path606',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path106-path118-path122',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path1246-path1904',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path806-path814-path818-path822',
  //         },
  //       },
  //       {
  //         from: {
  //           fileName: 'pidTest-l132.json',
  //           instanceId: 'path2158-path2160-path2162',
  //         },
  //         to: {
  //           fileName: 'isoTest-l132-1.json',
  //           instanceId: 'path82-path86-path90',
  //         },
  //       },
  //     ];

  //     const { symbolMapping, editDistances } = matchGraphs(mockPid, mockIso);

  //     pidIsoMapping.forEach((pidIsoMap) => {
  //       const pidInstanceId = pidIsoMap.from.instanceId;

  //       const isoInstanceId = pidIsoMap.to.instanceId;

  //       if (
  //         editDistances.get(pidInstanceId)?.get(isoInstanceId) === undefined
  //       ) {
  //         console.log(
  //           `No path to pid '${pidInstanceId}' and/or iso: '${isoInstanceId}'`
  //         );
  //       } else if (
  //         symbolMapping.get(pidInstanceId)?.isoInstanceId !== isoInstanceId
  //       ) {
  //         console.log(
  //           `Not corret symbol mapping from pid: '${pidInstanceId}' to iso: '${isoInstanceId}'`
  //         );

  //         if (symbolMapping.get(pidInstanceId) === undefined) return;

  //         let chosenSum = 0;
  //         symbolMapping.get(pidInstanceId)?.editDistances.forEach((d) => {
  //           chosenSum += d.editDistance;
  //         });
  //         console.log(
  //           'Chosen',
  //           symbolMapping.get(pidInstanceId)?.isoInstanceId,
  //           chosenSum,
  //           symbolMapping.get(pidInstanceId)?.editDistances
  //         );

  //         let expectedSum = 0;
  //         editDistances
  //           .get(pidInstanceId)
  //           ?.get(isoInstanceId)
  //           ?.forEach((d) => {
  //             expectedSum += d.editDistance;
  //           });
  //         console.log(
  //           'Expected',
  //           expectedSum,
  //           editDistances?.get(pidInstanceId)?.get(isoInstanceId)
  //         );
  //       }

  //       expect(symbolMapping.get(pidInstanceId)?.isoInstanceId).toBe(
  //         isoInstanceId
  //       );
  //     });

  //     expect(symbolMapping.size).toBe(pidIsoMapping.length);
  //   });
  // });
});
