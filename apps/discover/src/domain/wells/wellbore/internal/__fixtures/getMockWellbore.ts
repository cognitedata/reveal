import { Wellbore } from '../types';

export const mockWellboreOptions = {
  trajectory: jest.fn(),
  casings: jest.fn(),
  parentWell: jest.fn(),
  getWellhead: jest.fn(),
  sourceAssets: jest.fn(),
};

export const getMockWellbore = (extras?: Partial<Wellbore>): Wellbore => {
  return {
    id: '1234',
    name: 'test-wellbore',
    description: 'test-wellbore-description',
    sourceWellbores: [],
    ...mockWellboreOptions,
    ...extras,
  };
};
