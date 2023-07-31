import { convertPath } from '../path';

const TEST_STR_1 =
  'q-drive/EXP/BP_LEGACY/stv_exploration/New Access/02 Norway/02 Mid Norway/GDEs_2011';
const EXPECTED_STR_1 =
  'q:\\EXP\\BP_LEGACY\\stv_exploration\\New Access\\02 Norway\\02 Mid Norway\\GDEs_2011';

const TEST_STR_2 = 's-drive/open-drive/test_folder';
const EXPECTED_STR_2 = 's:\\open-drive\\test_folder';

const TEST_STR_3 = 'other_path/is/in-a-folder-called-drive/ok';
const EXPECTED_STR_3 = '\\\\other_path\\is\\in-a-folder-called-drive\\ok';

const TEST_STR_4 = 'other_path/q-drive/should/fail';
const EXPECTED_STR_4 = '\\\\other_path\\q-drive\\should\\fail';

const TEST_STR_5 = '/other_path/with-one-slash/already-exists';
const EXPECTED_STR_5 = '\\\\other_path\\with-one-slash\\already-exists';

const TEST_STR_6 = '//other_path/with-two-slashes/already-exists';
const EXPECTED_STR_6 = '\\\\other_path\\with-two-slashes\\already-exists';

const cases = [
  [TEST_STR_1, EXPECTED_STR_1],
  [TEST_STR_2, EXPECTED_STR_2],
  [TEST_STR_3, EXPECTED_STR_3],
  [TEST_STR_4, EXPECTED_STR_4],
  [TEST_STR_5, EXPECTED_STR_5],
  [TEST_STR_6, EXPECTED_STR_6],
];

describe('Should convert path correctly', () => {
  test.each(cases)(
    'given %p as argument, returns %p',
    (input, expectedResult) => {
      const result = convertPath(input);
      expect(result).toEqual(expectedResult);
    }
  );

  test('empth path', () => {
    const result = convertPath('');
    expect(result).toEqual('');
  });
});
