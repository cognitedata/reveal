import { getLineNumberAndUnitFromText } from '../utils';

import { PidDocument } from './PidDocument';

export interface LineNumberWithUnit {
  lineNumber: string;
  unit?: string;
}

const parseLineNumbersWithUnit = (
  pidDocument: PidDocument
): LineNumberWithUnit[] => {
  const lineNumberWithUnitList: LineNumberWithUnit[] = [];

  pidDocument.pidLabels.forEach((pidLabel) => {
    const { lineNumber, unit } = getLineNumberAndUnitFromText(pidLabel.text);
    if (lineNumber === undefined) return;

    lineNumberWithUnitList.push({ lineNumber, unit });
  });

  return lineNumberWithUnitList;
};

export default parseLineNumbersWithUnit;
