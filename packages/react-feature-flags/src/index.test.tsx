import { FlagProvider, useFlag, useVariant } from '.';

describe('Export tests', () => {
  it('Should find the correct exports', () => {
    expect(FlagProvider).toBeDefined();
    expect(useFlag).toBeDefined();
    expect(useVariant).toBeDefined();
  });
});
