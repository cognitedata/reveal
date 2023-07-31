import { getHumanReadableFileSize } from '../getHumanReadableFileSize';

describe('getHumanReadableFileSize', () => {
  test.each`
    input           | expectedResult
    ${0}            | ${'Unknown'}
    ${1024}         | ${'1.00 KB'}
    ${34}           | ${'34 Bytes'}
    ${342543123}    | ${'326.67 MB'}
    ${2147483648}   | ${'2.00 GB'}
    ${'1024'}       | ${'1.00 KB'}
    ${'342543123'}  | ${'326.67 MB'}
    ${'2147483648'} | ${'2.00 GB'}
    ${'malformed'}  | ${'Unknown'}
    ${''}           | ${'Unknown'}
    ${null}         | ${'Unknown'}
    ${undefined}    | ${'Unknown'}
  `(
    'get HumanReadable FileSize for $input toBe $expectedResult',
    ({ input, expectedResult }) => {
      const size = getHumanReadableFileSize(input);
      expect(size).toEqual(expectedResult);
    }
  );
});
