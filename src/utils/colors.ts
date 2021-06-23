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

function getNextColorValue(primaryObj: string[]) {
  const primaryValues = Object.values(primaryObj);
  const parsedPrimaryValues = primaryValues.map(Number);
  const maxValue = Math.max(...parsedPrimaryValues) || 0;

  return maxValue + 1;
}

export function getEntryColor(primaryId: string, secondaryId: string) {
  const availableColorsKeyValue = JSON.parse(
    window.localStorage.getItem(availableColorsKey) || '{}'
  );
  let value = 0;

  if (
    !availableColorsKeyValue[primaryId] ||
    !availableColorsKeyValue[primaryId][secondaryId]
  ) {
    value = availableColorsKeyValue[primaryId]
      ? getNextColorValue(availableColorsKeyValue[primaryId])
      : 0;

    window.localStorage.setItem(
      availableColorsKey,
      JSON.stringify({
        ...availableColorsKeyValue,
        [primaryId]: {
          ...availableColorsKeyValue[primaryId],
          [secondaryId]: value.toString(),
        },
      })
    );
  } else {
    value = availableColorsKeyValue[primaryId][secondaryId];
  }

  return getColor(value);
}
