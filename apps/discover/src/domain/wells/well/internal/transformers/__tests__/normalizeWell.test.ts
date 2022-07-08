import { getMockWell } from 'domain/wells/well/service/__fixtures/well';

import { UserPreferredUnit } from 'constants/units';

import { normalizeWell } from '../normalizeWell';

describe('Well utils', () => {
  it('should normalize wells as expected', () => {
    expect(normalizeWell(getMockWell(), UserPreferredUnit.METER)).toMatchObject(
      {
        description: 'test-well-desc',
        id: 'test-well-1',
        name: 'test-well',
        waterDepth: {
          unit: 'm',
          value: 10,
        },
        wellbores: expect.any(Array),
      }
    );
  });
});
