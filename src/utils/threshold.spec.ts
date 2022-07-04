import { ChartThreshold } from 'models/charts/charts/types/types';
import { isThresholdValid } from './threshold';

describe('isThresholdValid', () => {
  it('should find invalid threshold without `sourceID` property', () => {
    const goodThreshold: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      type: 'between',
      visible: true,
      lowerLimit: 20,
      upperLimit: 30,
      filter: {},
    };

    const validThreshold = isThresholdValid(goodThreshold);

    expect(validThreshold).toBe(false);
  });

  it('should find invalid threshold without `type` property', () => {
    const thresholdItem = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      name: 'New threshold ',
      visible: true,
      lowerLimit: 50,
      upperLimit: undefined,
      filter: {},
    };

    // @ts-ignore - for default case
    const validThreshold = isThresholdValid(thresholdItem);

    expect(validThreshold).toBe(false);
  });

  it('should find a valid threshold with type, limits and sourceID', () => {
    const goodThreshold: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      type: 'between',
      visible: true,
      lowerLimit: 20,
      upperLimit: 30,
      filter: {},
    };

    const validThreshold = isThresholdValid(goodThreshold);

    expect(validThreshold).toBe(true);
  });

  it('should find invalid threshold for `between` type without `lowerlimit` property', () => {
    const badThreshold: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      type: 'between',
      visible: true,
      lowerLimit: undefined,
      upperLimit: 30,
      filter: {},
    };

    const inValidThreshold = isThresholdValid(badThreshold);

    expect(inValidThreshold).toBe(false);
  });

  it('should find valid threshold for `under` type', () => {
    const thresholdItem: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      type: 'under',
      visible: true,
      lowerLimit: undefined,
      upperLimit: 30,
      filter: {},
    };

    const validThreshold = isThresholdValid(thresholdItem);

    expect(validThreshold).toBe(true);
  });

  it('should find valid threshold for `over` type', () => {
    const thresholdItem: ChartThreshold = {
      id: '1b226194-43ac-4964-a8a7-5ed26d2b867a',
      name: 'New threshold ',
      sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      type: 'over',
      visible: true,
      lowerLimit: 50,
      upperLimit: undefined,
      filter: {},
    };

    const validThreshold = isThresholdValid(thresholdItem);

    expect(validThreshold).toBe(true);
  });
});
