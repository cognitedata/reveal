import { useListEquipmentForRoomQuery } from 'graphql/generated';
import difference from 'lodash/difference';
import { useQueryClient } from 'react-query';
import { useRecoilValue } from 'recoil';
import {
  EquipmentSelectOptionType,
  prevRoomAtom,
} from 'recoil/roomPopup/roomPopupAtoms';

import { useEquipmentMutate } from '../equipment/useEquipmentMutate';

export const useUpdateRoomEquipment = () => {
  const queryClient = useQueryClient();
  const onEquipmentMutateSuccess = () => {
    queryClient.invalidateQueries(useListEquipmentForRoomQuery.getKey());
  };
  const updateEquipment = useEquipmentMutate(onEquipmentMutateSuccess);
  const prevRoom = useRecoilValue(prevRoomAtom);

  return (
    oldEquipmentList: EquipmentSelectOptionType[],
    newEquipmentList: EquipmentSelectOptionType[]
  ) => {
    const unassignedEquipment = difference(oldEquipmentList, newEquipmentList);
    const newlyAssignedEquipment = difference(
      newEquipmentList,
      oldEquipmentList
    );

    newlyAssignedEquipment.forEach((equipment) => {
      updateEquipment({
        externalId: equipment.value,
        name: equipment.label,
        room: prevRoom.externalId,
        type: equipment.type,
        isBroken: equipment.isBroken,
      });
    });

    unassignedEquipment.forEach((equipment) => {
      updateEquipment({
        externalId: equipment.value,
        name: equipment.label,
        room: null,
        type: equipment.type,
        isBroken: equipment.isBroken,
      });
    });
  };
};
