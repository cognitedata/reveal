import { Equipment } from 'graphql/generated';
import { DefaultValue, selector } from 'recoil';
import { nameAtom } from 'recoil/popupShared/nameAtom';

import {
  prevEquipmentAtom,
  equipmentTypeAtom,
  equipmentIsBrokenAtom,
  equipmentNodeIdAtom,
  equipmentPersonAtom,
} from './equipmentPopupAtoms';

// Note: Don't add fields here that are not part of the Equipment GraphQL definition
export const equipmentFormState = selector({
  key: 'EquipmentFormState',
  get: ({ get }) => {
    const name = get(nameAtom);
    const type = get(equipmentTypeAtom);
    const isBroken = get(equipmentIsBrokenAtom);
    const nodeId = get(equipmentNodeIdAtom);
    const person = get(equipmentPersonAtom);
    return { name, type, isBroken, nodeId, person };
  },
  set: ({ set }, newValues: Partial<Equipment> | DefaultValue) => {
    const isDefaultValue = newValues instanceof DefaultValue;
    if (!isDefaultValue) {
      set(nameAtom, newValues.name || '');
      set(equipmentTypeAtom, newValues.type || '');
      set(equipmentIsBrokenAtom, !!newValues.isBroken);
      set(equipmentNodeIdAtom, newValues.nodeId);
      set(equipmentPersonAtom, {
        ...newValues.person,
        externalId: newValues.person?.externalId || '',
        name: newValues.person?.name || '',
      });
      set(prevEquipmentAtom, {
        ...newValues,
        externalId: newValues.externalId || '',
      });
    }
  },
});
