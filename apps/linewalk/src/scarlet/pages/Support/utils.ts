import { CogniteClient } from '@cognite/sdk';
import {
  getEquipmentConfig,
  getEquipmentDocuments,
  getEquipmentMAL,
  getEquipmentMS,
  getEquipmentPCMS,
  getEquipmentState,
  saveEquipment,
} from 'scarlet/api';
import { transformEquipmentData } from 'scarlet/transformations';
import { EquipmentConfig, Facility, UnitListItem } from 'scarlet/types';
import {
  findU1Document,
  getEquipmentToSave,
  getEquipmentType,
  preApproveDataElements,
} from 'scarlet/utils';

export const preapproveEquipmentList = async (
  client: CogniteClient,
  facility: Facility,
  unitList: UnitListItem[],
  equipmentsPerUnit: Record<number, string[]>
) => {
  const savedEquipments = [];
  const skippedEquipments = [];
  const failedEquipments = [];
  console.log('Preapprove start...', { facility, unitList, equipmentsPerUnit });

  const equipmentConfig = await getEquipmentConfig(client);
  console.log('Equipment config is fetched');

  // eslint-disable-next-line no-restricted-syntax
  for (const unit of unitList) {
    const equipmentIds = equipmentsPerUnit[unit.cdfId] || [];
    // eslint-disable-next-line no-restricted-syntax
    for (const equipmentId of equipmentIds) {
      const equipmentName = `${unit.id}_${equipmentId}`;
      try {
        console.log(
          `%cPreapprove equipment "${equipmentName}"`,
          'color: orange; '
        );
        // eslint-disable-next-line no-await-in-loop
        const isSaved = await preapproveEquipment(
          client,
          facility,
          unit.id,
          equipmentId,
          equipmentConfig
        );
        if (isSaved) {
          savedEquipments.push(equipmentName);
        } else {
          skippedEquipments.push(equipmentName);
        }
      } catch {
        console.debug(`%cFailed to preapprove ${equipmentName}`, 'color: red;');
        failedEquipments.push(equipmentName);
      }
    }

    console.debug('%c###########################', 'color: orange;');
    console.debug(`%c#Summary:`, 'color: orange;');
    console.debug('%c#Saved equipments:', 'color: orange;', savedEquipments);
    console.debug(
      '%c#Skipped equipments:',
      'color: orange;',
      skippedEquipments
    );

    console.debug('%c#Failed equipments:', 'color: orange;', failedEquipments);
    console.debug('%c###########################', 'color: orange;');
  }
};

const preapproveEquipment = async (
  client: CogniteClient,
  facility: Facility,
  unitId: string,
  equipmentId: string,
  equipmentConfig: EquipmentConfig
): Promise<boolean> => {
  const pcms = await getEquipmentPCMS(client, {
    facility,
    unitId,
    equipmentId,
  });
  console.debug('    PCMS is fetched');

  const mal = await getEquipmentMAL(client, {
    facility,
    unitId,
    equipmentId,
  }).catch(() => undefined);
  console.debug(`    MAL is ${mal ? 'fetched' : 'absent'}`);

  const ms = await getEquipmentMS(client, {
    facility,
    unitId,
    equipmentId,
  }).catch(() => undefined);
  console.debug(`    MS is ${ms ? 'fetched' : 'absent'}`);

  const documents = await getEquipmentDocuments(client, {
    unitId,
    equipmentId,
  });
  console.debug('    Documents are fetched');

  const equipmentState = await getEquipmentState(client, {
    facility,
    unitId,
    equipmentId,
  });
  console.debug(
    `    Equipment state is ${equipmentState ? 'fetched' : 'absent'}`
  );

  const equipment = transformEquipmentData({
    config: equipmentConfig,
    scannerDetections: [],
    equipmentState,
    pcms,
    mal,
    ms,
    type: getEquipmentType(equipmentId),
  });

  if (!equipment) {
    const errorMessage = "Equipment can't be transformed";
    console.error(`    ${errorMessage}`);
    throw Error(errorMessage);
  }

  const hasU1Document = Boolean(findU1Document(documents));
  const hasToBeSaved =
    preApproveDataElements(equipment, hasU1Document, unitId) || !equipmentState;
  const equipmentToSave = getEquipmentToSave(equipment);

  if (hasToBeSaved) {
    await saveEquipment(client, {
      facility,
      unitId,
      equipmentId,
      equipment: equipmentToSave,
      modifiedBy: equipmentState?.modifiedBy,
    });
    console.log('%c    Equipment is saved', 'color: green;');
  } else {
    console.log(
      '%c    Equipment has no changes, no need to save',
      'color: yellow;'
    );
  }

  return hasToBeSaved;
};
