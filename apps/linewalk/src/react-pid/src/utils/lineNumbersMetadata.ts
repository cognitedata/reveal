import {
  getLineNumberAndUnitFromText,
  getLineNumberKey,
} from '@cognite/pid-tools';

const lineNumbersMetadata = (
  outputVersion: string,
  site: string,
  documentUnit: string,
  lineNumbers: string[]
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
    acc[
      getLineNumberKey(outputVersion, site, unit ?? documentUnit, lineNumber)
    ] = 'true';
    return acc;
  }, {});

export default lineNumbersMetadata;
