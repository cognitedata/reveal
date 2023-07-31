import getLineNumberAndUnitFromText from './getLineNumberAndUnitFromText';

const getUnitAndLineNumberString = (inputString: string): string | null => {
  const { lineNumber, unit } = getLineNumberAndUnitFromText(inputString);

  if (!lineNumber) return null;

  return unit ? `${unit}-${lineNumber}` : lineNumber;
};

export default getUnitAndLineNumberString;
