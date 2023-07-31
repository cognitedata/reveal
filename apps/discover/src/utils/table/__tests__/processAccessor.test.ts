import { getMockNPTEvent } from 'domain/wells/npt/internal/__fixtures/npt';

import { processAccessor } from '../processAccessor';

describe('processAccessor', () => {
  const nptEvent = getMockNPTEvent();

  it('should return the value when it exists in the npt event', () => {
    const accessor = 'nptCode';
    expect(processAccessor(nptEvent, accessor)).toEqual(nptEvent[accessor]);
  });

  it('should return `null` when it does not exist in the npt event', () => {
    const accessor = 'subtype';
    expect(processAccessor(nptEvent, accessor)).toEqual(null);
  });

  it('should return `null` when the value of property in the npt event is empty', () => {
    const accessor = 'nptCode';
    expect(processAccessor({ ...nptEvent, nptCode: '' }, accessor)).toEqual(
      null
    );
  });

  it('should return `number` values when it exists in the npt event', () => {
    const accessor = 'wellboreMatchingId';
    expect(processAccessor(nptEvent, accessor)).toEqual(nptEvent[accessor]);
  });
});
