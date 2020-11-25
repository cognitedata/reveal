import { modulo } from './numbers';

export const availableColors = [
  '#0097e6',
  '#e1b12c',
  '#8E44AD',
  '#c23616',
  '#40739e',
  '#273c75',
  '#8c7ae6',
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#3B3EAC',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#329262',
  '#5574A6',
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
