import { FlagProvider, useFlag } from '.';

describe('Export tests', () => {
  it('Should find the correct exports', () => {
    expect(FlagProvider).toBeDefined();
    expect(useFlag).toBeDefined();
  });
});
