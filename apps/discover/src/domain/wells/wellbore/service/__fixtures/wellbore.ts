import { Wellbore } from '@cognite/sdk-wells-v3';

export const mockWellboreOptions = {
  trajectory: jest.fn(),
  casings: jest.fn(),
  parentWell: jest.fn(),
  getWellhead: jest.fn(),
  sourceAssets: jest.fn(),
};
export const getMockWellbore = (extras?: Partial<Wellbore>): Wellbore => ({
  name: 'wellbore B',
  matchingId: 'test-well-1',
  wellMatchingId: 'test-well-1',
  // id: 'test-well-1',
  // wellId: 1234,
  description: 'wellbore B desc',
  sources: [],
  ...mockWellboreOptions,
  ...extras,
});
