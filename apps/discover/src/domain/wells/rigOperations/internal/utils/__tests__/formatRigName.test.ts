import { formatRigName } from '../formatRigName';

/**
 * [TEST_STRING, EXPECTED_STRING]
 */
const cases = [
  ['SAMPLE RIG', 'Sample Rig'],
  ['sample rig', 'Sample Rig'],
  ['RIG t01', 'Rig T01'],
  ['RIG T01', 'Rig T01'],
  ['RIG T-01', 'Rig T-01'],
  ['RIG T 01', 'Rig T 01'],
  ['RIG 01', 'Rig 01'],
];

describe('formatRigName', () => {
  test.each(cases)(
    'given %p as argument, returns %p',
    (input, expectedResult) => {
      const result = formatRigName(input);
      expect(result).toEqual(expectedResult);
    }
  );
});
