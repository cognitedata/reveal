import { getDiagramInstanceIdFromPathIds } from '../../utils';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../../types';
import { detectLines } from '../findLines';

export const createLines = (pathIds: string[]): DiagramLineInstance[] => {
  return pathIds.map(
    (pathId): DiagramLineInstance => ({
      type: 'Line',
      id: getDiagramInstanceIdFromPathIds([pathId]),
      pathIds: [pathId],
      labelIds: [],
      lineNumbers: [],
      inferedLineNumbers: [],
    })
  );
};

export const createSymbols = (
  pathIdsList: string[][]
): DiagramSymbolInstance[] => {
  return pathIdsList.map(
    (pathIds): DiagramSymbolInstance => ({
      type: 'Instrument',
      symbolId: 'symbolId',
      id: getDiagramInstanceIdFromPathIds(pathIds),
      scale: 1,
      rotation: 0,
      pathIds,
      labelIds: [],
      lineNumbers: [],
      inferedLineNumbers: [],
    })
  );
};

describe('findLines', () => {
  test('simple symbol line square all connected', () => {
    const symbolInstances = createSymbols([['path1'], ['path3']]);
    const lineInstances: DiagramLineInstance[] = [];
    const potentialLines = createLines(['path2']);

    const [path1, path3] = symbolInstances;
    const [path2] = potentialLines;
    const connections: DiagramConnection[] = [
      { start: path1.id, end: path2.id, direction: 'unknown' },
      { start: path2.id, end: path3.id, direction: 'unknown' },
    ];

    const lines = detectLines(
      potentialLines,
      connections,
      lineInstances,
      symbolInstances
    );

    expect(lines.length).toBe(1);
    expect(lines[0].pathIds[0]).toBe(path2.pathIds[0]);
  });

  test('simple line symbol line', () => {
    const symbolInstances = createSymbols([['path1']]);
    const lineInstances: DiagramLineInstance[] = createLines(['path2']);
    const potentialLines = createLines(['path3']);

    const [path1] = symbolInstances;
    const [path2] = lineInstances;
    const [path3] = potentialLines;

    const connections: DiagramConnection[] = [
      { start: path1.id, end: path2.id, direction: 'unknown' },
      { start: path1.id, end: path3.id, direction: 'unknown' },
    ];

    const lines = detectLines(
      potentialLines,
      connections,
      lineInstances,
      symbolInstances
    );

    expect(lines.length).toBe(0);
  });

  test('simple loop', () => {
    const symbolInstances = createSymbols([['path1']]);
    const lineInstances: DiagramLineInstance[] = createLines(['path2']);
    const potentialLines = createLines(['path3', 'path4']);

    const [path1] = symbolInstances;
    const [path2] = lineInstances;
    const [path3, path4] = potentialLines;

    const connections: DiagramConnection[] = [
      { start: path1.id, end: path2.id, direction: 'unknown' },
      { start: path2.id, end: path3.id, direction: 'unknown' },
      { start: path3.id, end: path4.id, direction: 'unknown' },
      { start: path4.id, end: path1.id, direction: 'unknown' },
    ];

    const lines = detectLines(
      potentialLines,
      connections,
      lineInstances,
      symbolInstances
    );

    expect(lines.length).toBe(2);
  });
});
