import { FEET } from 'constants/units';

import {
  getNdsUnitChangeAccessors,
  useGetConverFunctionForEvents,
} from '../helper';

describe('getNdsUnitChangeAccessors', () => {
  it('Accessors should have passed unit', async () => {
    const accessors = getNdsUnitChangeAccessors(FEET);
    accessors.forEach((accessor) =>
      expect(accessor).toEqual(expect.objectContaining({ to: FEET }))
    );
  });
});

describe('useGetConverFunctionForEvents', () => {
  it('Accessors should have passed unit', async () => {
    const functions = useGetConverFunctionForEvents(FEET);
    expect(functions).toBeTruthy();
  });
});
