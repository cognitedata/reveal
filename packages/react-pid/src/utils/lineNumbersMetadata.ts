import {
  getLineNumberAndUnitFromText,
  getLineNumberKey,
} from '@cognite/pid-tools';

const lineNumbersMetadata = (
  outputVersion: string,
  lineNumbers: string[],
  documentUnit: string
): Record<string, string> =>
  lineNumbers.reduce<Record<string, string>>((acc, lineNumberText) => {
    const { lineNumber, unit } = getLineNumberAndUnitFromText(lineNumberText);

    if (lineNumber === undefined) {
      // eslint-disable-next-line no-console
      console.log(
        'lineNumbersMetadata: lineNumber was undefined. lineNumberText: ',
        lineNumberText
      );
      return acc;
    }
    acc[getLineNumberKey(outputVersion, lineNumber, unit ?? documentUnit)] =
      'true';
    return acc;
  }, {});

export default lineNumbersMetadata;
