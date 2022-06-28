import units from '../data/units';

export default function getDisplayUnit(
  preferredUnit: string | undefined,
  defaultLabel?: string
) {
  const foundUnit = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  );
  return foundUnit?.label || preferredUnit || defaultLabel;
}
