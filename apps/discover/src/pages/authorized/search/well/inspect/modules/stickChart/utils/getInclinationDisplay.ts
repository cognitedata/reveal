import { displayAsDegrees } from 'utils/displayAsDegrees';

const SPACE_CHARACTER = `\u0020`;

export const getInclinationDisplay = (inclination: number) => {
  return `${SPACE_CHARACTER}${displayAsDegrees(inclination)}${SPACE_CHARACTER}`;
};
