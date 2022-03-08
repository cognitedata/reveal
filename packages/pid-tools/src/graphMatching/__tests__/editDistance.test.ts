import { DiagramInstance, DiagramSymbolInstance } from '../../types';
import { getEditDistance } from '../editDistance';

const getDiagramInstance = (type: string) => {
  return {
    pathIds: ['something'],
    symbolId: 'something1',
    id: 'something1',
    type,
    scale: 1,
    rotation: 0,
    labelIds: [],
    lineNumbers: [],
    inferedLineNumbers: [],
  } as DiagramSymbolInstance;
};

const getDiagramAssetInstance = (assetExternalId: string) => {
  return {
    pathIds: ['something'],
    type: 'Instrument',
    symbolId: 'something1',
    id: 'something1',
    assetExternalId,
    scale: 1,
    rotation: 0,
    labelIds: [],
    lineNumbers: [],
    inferedLineNumbers: [],
  } as DiagramSymbolInstance;
};

describe('getEditDistance', () => {
  test('simple isSimilar', async () => {
    const pathA: DiagramSymbolInstance[] = [
      getDiagramInstance('Valve'),
      getDiagramInstance('Reducer'),
      getDiagramAssetInstance('a'),
    ];
    const pathB: DiagramInstance[] = [
      getDiagramInstance('Valve'),
      getDiagramInstance('Reducer'),
      getDiagramAssetInstance('a'),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(0);
  });

  test('simple random element that shouldnt be there', async () => {
    const pathA: DiagramSymbolInstance[] = [
      getDiagramInstance('Valve'),
      getDiagramInstance('Reducer'),
      getDiagramAssetInstance('a'),
    ];
    const pathB: DiagramInstance[] = [
      getDiagramInstance('Valve'),
      getDiagramInstance('Instrument'),
      getDiagramInstance('Reducer'),
      getDiagramAssetInstance('a'),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(1);
  });

  test('simple wrong assetID', async () => {
    const pathA: DiagramSymbolInstance[] = [
      getDiagramInstance('Valve'),
      getDiagramInstance('Reducer'),
      getDiagramAssetInstance('a'),
    ];
    const pathB: DiagramInstance[] = [
      getDiagramInstance('Valve'),
      getDiagramInstance('Reducer'),
      getDiagramAssetInstance('notCorrectID'),
    ];
    const distance = getEditDistance(pathA, pathB);
    expect(distance).toEqual(1);
  });
});
