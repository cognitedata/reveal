import { VALID_LINE_NUMBER_PREFIXES } from '../constants';

const prefixOptionsString = VALID_LINE_NUMBER_PREFIXES.join('|');
const lineNumberRegex = new RegExp(`(${prefixOptionsString})[0-9]{3}`);

const getLineNumberFromText = (text: string) => {
  const lineNumberMatch = text.match(lineNumberRegex);
  if (lineNumberMatch) {
    return lineNumberMatch[0];
  }
  return null;
};

export default getLineNumberFromText;
