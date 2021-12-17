import { FEET } from 'constants/units';

import {
  getNdsUnitChangeAccessors,
  useGetConvertFunctionForEvents,
} from '../helper';

describe('getNdsUnitChangeAccessors', () => {
  it('Accessors should have passed unit', async () => {
    const accessors = getNdsUnitChangeAccessors(FEET);
    accessors.forEach((accessor) =>
      expect(accessor).toEqual(expect.objectContaining({ to: FEET }))
    );
  });
});

describe('useGetConvertFunctionForEvents', () => {
  it('Accessors should have passed unit', async () => {
    const functions = useGetConvertFunctionForEvents(FEET);
    expect(functions).toBeTruthy();
  });
});
