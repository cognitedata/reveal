import { getEquipmentType } from './getEquipmentType';

const STARTS_WITH_DIGITS_AND_DASH_REGEX = /^\d+-/;

const isValidEquipment = ({ id, type }: { id: string; type: string }) => {
  const validName = STARTS_WITH_DIGITS_AND_DASH_REGEX.test(id);
  const validType = getEquipmentType(type);
  return validName && validType;
};

export { isValidEquipment };
