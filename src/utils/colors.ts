import { modulo } from './numbers';

const availableColorsKey = 'availableColorsKey';

export const availableColors = [
  '#6929c4',
  '#1192e8',
  '#005d5d',
  '#9f1853',
  '#fa4d56',
  '#570408',
  '#198038',
  '#002d9c',
  '#ee538b',
  '#b28600',
  '#009d9a',
  '#012749',
  '#8a3800',
  '#a56eff',
];

export function getColor(value: number) {
  return availableColors[modulo(value, availableColors.length)];
}

export function createColorGetter() {
  const availableColorsKeyValue = window.localStorage.getItem(
    availableColorsKey
  );
  let count = -1;
  if (availableColorsKeyValue) {
    count = +availableColorsKeyValue;
  }
  return () => {
    count += 1;
    window.localStorage.setItem(availableColorsKey, count.toString());
    return getColor(count);
  };
}

export const getEntryColor = createColorGetter();
