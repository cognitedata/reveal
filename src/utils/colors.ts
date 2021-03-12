import { modulo } from './numbers';

export const availableColors = [
  '#004c60',
  '#175a6f',
  '#28687e',
  '#38778e',
  '#46869e',
  '#5595ae',
  '#63a5be',
  '#72b5cf',
  '#81c5e0',
];

export function getColor(value: number) {
  return availableColors[modulo(value, availableColors.length)];
}

export function createColorGetter() {
  let count = -1;
  return () => {
    count += 1;
    return getColor(count);
  };
}

export const getEntryColor = createColorGetter();
