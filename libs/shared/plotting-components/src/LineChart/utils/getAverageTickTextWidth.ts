import { getTickTextWidth } from './getTickTextWidth';

export const getAverageTickTextWidth = (xticks: HTMLCollectionOf<Element>) => {
  const totalWidth = Array.from(xticks).reduce((total, { textContent }) => {
    return total + getTickTextWidth(textContent);
  }, 0);

  return Math.round(totalWidth / xticks.length);
};
