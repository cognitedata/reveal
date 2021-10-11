import { getMockWell } from '__test-utils/fixtures/well';

import { normalizeWell } from '../wells';

describe('Well normalize', () => {
  it('should be ok', () => {
    expect(normalizeWell(getMockWell())).toEqual({
      description: 'test-well-desc',
      id: 1234,
      name: 'test-well',
      sourceAssets: expect.any(Function),
      spudDate: new Date('2021-05-28T08:32:32.316Z'),
      waterDepth: {
        unit: 'ft',
        value: 23.523422,
      },
      wellbores: undefined,
    });
  });
});
