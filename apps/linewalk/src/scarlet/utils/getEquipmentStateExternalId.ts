import { Facility } from 'scarlet/types';
import config from 'utils/config';

export const getEquipmentStateExternalId = (
  facility: Facility,
  unitId: string,
  equipmentId: string
) => {
  const fileParts = [
    config.env,
    facility.sequenceNumber,
    unitId,
    equipmentId,
    'state',
  ];
  return fileParts.join('_');
};
