import { UNIT_REGEX, VALID_LINE_NUMBER_PREFIXES } from '../constants';

const prefixOptionsString = VALID_LINE_NUMBER_PREFIXES.join('|');
const lineNumberRegex = new RegExp(`(${prefixOptionsString})[0-9]{3}`);

const getLineNumberAndUnitFromText = (
  text: string
): { lineNumber?: string; unit?: string } => {
  const lineNumberMatch = text.match(lineNumberRegex);
  const lineNumber = lineNumberMatch ? lineNumberMatch[0] : undefined;

  const unitMatch = text.match(UNIT_REGEX);
  const unit = unitMatch ? unitMatch[0] : undefined;
  return { lineNumber, unit };
};

export default getLineNumberAndUnitFromText;
