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
    name: 'test-wellbore',
    description: 'test-wellbore-description',
    sources: [],
    ...mockWellboreOptions,
    ...extras,
  };
};
