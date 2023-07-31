import { getMockNPTEvent } from 'domain/wells/npt/internal/__fixtures/npt';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { adaptNptDataToView } from '../adaptNptDataToView';

describe('adaptNptDataToView', () => {
  it('Add well and wellbore data to event successfully', async () => {
    const mockWellbore = getMockWellbore();
    const mockNptEvent = getMockNPTEvent({
      wellboreMatchingId: mockWellbore.matchingId,
    });
    const result = adaptNptDataToView([mockWellbore], [mockNptEvent]);
    expect(result).not.toBe([]);
    expect(result[0].wellName).not.toEqual('Unknown');
    expect(result[0].wellboreName).not.toEqual('Unknown');
  });

  it('When wellbore is not available mapping doesnt throw error', async () => {
    const mockNptEvent = getMockNPTEvent();
    await expect(() =>
      adaptNptDataToView([], [mockNptEvent])
    ).not.toThrowError();
  });

  it('When wellbore is not available mapping doesnt throw error but map names to unknown', async () => {
    const mockNptEvent = getMockNPTEvent();
    const result = adaptNptDataToView([], [mockNptEvent]);
    expect(result).not.toBe([]);
    expect(result[0].wellName).toEqual('Unknown');
    expect(result[0].wellboreName).toEqual('Unknown');
  });
});
