import { getMockNPTEvent } from '__test-utils/fixtures/npt';

import { renderNPTCodeWithColor } from '../utils';

describe('renderNPTCodeWithColor', () => {
  const nptEvent = getMockNPTEvent();

  it('should return element as expected', () => {
    expect(renderNPTCodeWithColor(nptEvent)).toBeTruthy();
  });

  it('should return element even when `nptCode` is empty`', () => {
    expect(renderNPTCodeWithColor({ ...nptEvent, nptCode: '' })).toBeTruthy();
  });
});
