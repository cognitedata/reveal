import { VALID_LINE_NUMBER_PREFIXES } from '../constants';

const prefixOptionsString = VALID_LINE_NUMBER_PREFIXES.join('|');
const lineNumberAndPageRegex = new RegExp(
  `(${prefixOptionsString})[0-9]{1,}-[0-9]{1,}`
);

const getLineNumberAndPageFromText = (
  text: string
): { lineNumber: string; pageNumber: number } | undefined => {
  const textMatch = text.match(lineNumberAndPageRegex);
  if (!textMatch) return undefined;

  const lineParts = textMatch[0].split('-');
  const lineNumber = lineParts ? lineParts[0] : '#';
  const pageNumber = lineParts ? parseInt(lineParts[1], 10) : -1;
  return { lineNumber, pageNumber };
};

export default getLineNumberAndPageFromText;
