import { units } from '@cognite/charts-lib';

export const getDisplayUnit = (
  preferredUnit: string | undefined,
  defaultLabel?: string
) => {
  const unitLabel = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  )?.label;

  return unitLabel || preferredUnit || defaultLabel;
};
