import { getLineNumberKey } from '@cognite/pid-tools';

const lineNumbersMetadata = (
  outputVersion: string,
  lineNumbers: string[],
  unit: string
): Record<string, string> =>
  lineNumbers.reduce<Record<string, string>>((acc, lineNumber) => {
    acc[getLineNumberKey(outputVersion, lineNumber, unit)] = 'true';
    return acc;
  }, {});

export default lineNumbersMetadata;
