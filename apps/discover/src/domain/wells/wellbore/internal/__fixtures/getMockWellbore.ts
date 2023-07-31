import { WellboreInternal } from '../types';

export const mockWellboreOptions = {
  trajectory: jest.fn(),
  casings: jest.fn(),
  parentWell: jest.fn(),
  getWellhead: jest.fn(),
  sourceAssets: jest.fn(),
};

export const getMockWellbore = (
  extras?: Partial<WellboreInternal>
): WellboreInternal => {
  return {
    id: '1234',
    wellMatchingId: '123',
    matchingId: '123',
    wellId: '1234',
    wellName: 'test-wellbore',
    title: 'test-wellbore',
    name: 'test-wellbore',
    color: '#fefefe',
    description: 'test-wellbore-description',
    sources: [],
    ...mockWellboreOptions,
    ...extras,
  };
};
