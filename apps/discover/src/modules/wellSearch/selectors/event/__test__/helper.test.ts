import { FEET } from 'constants/units';

import { getNdsUnitChangeAccessors } from '../helper';

describe('Test helpers', () => {
  it('Accessors should have passed unit', async () => {
    const accessors = getNdsUnitChangeAccessors(FEET);
    accessors.forEach((accessor) =>
      expect(accessor).toEqual(expect.objectContaining({ to: FEET }))
    );
  });
});
