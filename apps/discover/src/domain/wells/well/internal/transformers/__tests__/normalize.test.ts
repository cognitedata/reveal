import { getMockWell } from 'domain/wells/well/service/__fixtures/well';

import { normalize } from '../normalize';

describe('Well utils', () => {
  it('should normalize wells as expected', () => {
    expect(normalize(getMockWell())).toMatchObject({
      description: 'test-well-desc',
      id: 'test-well-1',
      name: 'test-well',
      sourceAssets: expect.any(Function),
      waterDepth: {
        unit: 'meter',
        value: 10,
      },
      wellbores: expect.any(Array),
    });
  });
});
