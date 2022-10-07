import { getEquipmentType } from './getEquipmentType';

const STARTS_WITH_DIGITS_AND_DASH_REGEX = /^\d+-/;

const isValidEquipment = (id: string) => {
  const validName = STARTS_WITH_DIGITS_AND_DASH_REGEX.test(id);
  const validType = getEquipmentType(id);
  return validName && validType;
};

export { isValidEquipment };
