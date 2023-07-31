import { Facility } from 'types';
import config from 'utils/config';

export const getEquipmentStateExternalId = (
  facility: Facility,
  unitId: string,
  equipmentId: string
) => {
  const fileParts = [config.env, facility.id, unitId, equipmentId, 'state'];
  return fileParts.join('_');
};
