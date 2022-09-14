import { getMockNptAggregateRowInternal } from 'domain/wells/npt/internal/__fixtures/npt';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { adaptNptAggregatesDataToView } from '../adaptNptAggregatesDataToView';

describe('adaptNptAggregatesDataToView', () => {
  it('Add well and wellbore data to aggregate successfully', async () => {
    const mockWellbore = getMockWellbore();
    const mockNptAggregate = getMockNptAggregateRowInternal({
      wellboreMatchingId: mockWellbore.matchingId,
    });
    const result = adaptNptAggregatesDataToView(
      [mockWellbore],
      [mockNptAggregate]
    );
    expect(result).not.toBe([]);
    expect(result[0].wellName).not.toEqual('Unknown');
    expect(result[0].wellboreName).not.toEqual('Unknown');
  });

  it('When wellbore is not available mapping doesnt throw error', async () => {
    const mockNptAggregate = getMockNptAggregateRowInternal();
    await expect(() =>
      adaptNptAggregatesDataToView([], [mockNptAggregate])
    ).not.toThrowError();
  });

  it('When wellbore is not available mapping doesnt throw error but map names to unknown', async () => {
    const mockNptAggregate = getMockNptAggregateRowInternal();
    const result = adaptNptAggregatesDataToView([], [mockNptAggregate]);
    expect(result).not.toBe([]);
    expect(result[0].wellName).toEqual('Unknown');
    expect(result[0].wellboreName).toEqual('Unknown');
  });
});
