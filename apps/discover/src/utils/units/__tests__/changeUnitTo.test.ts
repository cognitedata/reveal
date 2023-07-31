import { changeUnitTo } from '../changeUnitTo';

describe('changeUnitTo', () => {
  it('should be ok', () => {
    expect(changeUnitTo(1, 'm', 'ft')).toEqual(3.281);
  });
  it('should handle custom conversion', () => {
    expect(changeUnitTo(1, 'meter', 'ft')).toEqual(3.281);
  });

  describe('bad tests', () => {
    const originalConsole = global.console;

    beforeAll(() => {
      // @ts-expect-error - missing other keys
      global.console = { error: jest.fn() };
    });

    afterAll(() => {
      global.console = originalConsole;
    });

    it('should not like bad values', () => {
      // @ts-expect-error no conversion for bad things
      expect(changeUnitTo(1, 'meters', 'ft')).toBeUndefined();
    });
  });
});
