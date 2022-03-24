import {
  Rect,
  DiagramSymbolInstanceOutputFormat,
  SymbolType,
} from '../../types';
import { getEditDistance } from '../editDistance';

const boundingBox: Rect = { x: 0, y: 0, width: 0, height: 0 };

const getDiagramInstanceOutputFormat = (
  type: SymbolType
): DiagramSymbolInstanceOutputFormat => {
  return {
    pathIds: ['something'],
    symbolId: 'something1',
    id: 'something1',
    type,
    scale: 1,
    rotation: 0,
    labels: [],
    labelIds: [],
    svgRepresentation: { boundingBox, svgPaths: [] },
    lineNumbers: [],
    inferedLineNumbers: ['L132'],
  };
};

const getLabelFromText = (id: string, text: string) => {
  return {
    id: 'mock-id',
    text,
    boundingBox,
  };
};

const getDiagramInstrumentOutputFormat = (labelTexts: string[]) => {
  const labels = labelTexts.map((labelText, i) =>
    getLabelFromText(`id-${i}`, labelText)
  );

  return {
    pathIds: ['something'],
    type: 'Instrument',
    symbolId: 'something1',
    id: 'something1',
    scale: 1,
    rotation: 0,
    labels,
    labelIds: labels.map((label) => label.id),
    svgRepresentation: { boundingBox, svgPaths: [] },
    lineNumbers: [],
    inferedLineNumbers: ['L132'],
  } as DiagramSymbolInstanceOutputFormat;
};

describe('getEditDistance', () => {
  test('simple isSimilar', async () => {
    const pathA = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Reducer'),
      getDiagramInstrumentOutputFormat(['ABC']),
    ];
    const pathB = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Reducer'),
      getDiagramInstrumentOutputFormat(['ABC']),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(0);
  });

  test('simple random element that shouldnt be there', async () => {
    const pathA = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Reducer'),
      getDiagramInstrumentOutputFormat(['ABC']),
    ];
    const pathB = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Instrument'),
      getDiagramInstanceOutputFormat('Reducer'),
      getDiagramInstrumentOutputFormat(['ABC']),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(1);
  });

  test('simple wrong assetID', async () => {
    const pathA = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Reducer'),
      getDiagramInstrumentOutputFormat(['ABC']),
    ];
    const pathB = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Reducer'),
      getDiagramInstrumentOutputFormat(['BCD']),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(1);
  });

  test('extra insertions', async () => {
    const pathA = [getDiagramInstanceOutputFormat('Valve')];
    const pathB = [
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Valve'),
      getDiagramInstanceOutputFormat('Valve'),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(4);
  });
});
