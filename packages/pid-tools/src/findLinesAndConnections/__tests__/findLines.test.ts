import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../../types';
import { detectLines } from '../findLines';

export const createLines = (pathIds: string[]) => {
  return pathIds.map(
    (pathId) =>
      ({
        type: 'Line',
        id: 'something1',
        pathIds: [pathId],
        labelIds: [],
        lineNumbers: [],
      } as DiagramLineInstance)
  );
};

export const createSymbols = (pathIds: string[]) => {
  return pathIds.map(
    (pathId) =>
      ({
        type: 'Instrument',
        symbolId: 'symbolId',
        id: 'something1',
        pathIds: [pathId],
        labelIds: [],
        lineNumbers: [],
      } as DiagramSymbolInstance)
  );
};

describe('findLines', () => {
  test('simple symbol line square all connected', () => {
    const lineInstances: DiagramLineInstance[] = [];
    const symbolInstances = createSymbols(['path001', 'path003']);

    const potentialLineInstanceList = createLines(['path002']);

    const connections: DiagramConnection[] = [
      { start: 'path001', end: 'path002', direction: 'unknown' },
      { start: 'path002', end: 'path003', direction: 'unknown' },
    ];

    const lines = detectLines(
      potentialLineInstanceList,
      connections,
      lineInstances,
      symbolInstances
    );

    expect(lines.length).toBe(1);
    expect(lines[0].pathIds[0]).toBe('path002');
  });

  test('simple line symbol line', () => {
    const lineInstances: DiagramLineInstance[] = createLines(['path002']);
    const symbolInstances = createSymbols(['path001']);

    const potentialLineInstanceList = createLines(['path003']);

    const connections: DiagramConnection[] = [
      { start: 'path001', end: 'path002', direction: 'unknown' },
      { start: 'path001', end: 'path003', direction: 'unknown' },
    ];

    const lines = detectLines(
      potentialLineInstanceList,
      connections,
      lineInstances,
      symbolInstances
    );

    expect(lines.length).toBe(0);
  });

  test('simple loop', () => {
    const lineInstances: DiagramLineInstance[] = createLines(['path002']);
    const symbolInstances = createSymbols(['path001']);

    const potentialLineInstanceList = createLines(['path003', 'path004']);

    const connections: DiagramConnection[] = [
      { start: 'path001', end: 'path002', direction: 'unknown' },
      { start: 'path002', end: 'path003', direction: 'unknown' },
      { start: 'path003', end: 'path004', direction: 'unknown' },
      { start: 'path004', end: 'path001', direction: 'unknown' },
    ];

    const lines = detectLines(
      potentialLineInstanceList,
      connections,
      lineInstances,
      symbolInstances
    );
    expect(lines.length).toBe(2);
  });
});
