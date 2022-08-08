import { Select } from '@cognite/cogs.js';
import { Equipment, useListFilteredEquipmentQuery } from 'graphql/generated';
import { useRecoilState } from 'recoil';
import { roomEquipmentSelectAtom } from 'recoil/roomPopup/roomPopupAtoms';

const equipmentFilter = {
  not: {
    type: {
      eq: 'desk',
    },
  },
};

export const EquipmentListSelect: React.FC = () => {
  const [roomEquipmentSelect, setRoomEquipmentSelect] = useRecoilState(
    roomEquipmentSelectAtom
  );

  const { data } = useListFilteredEquipmentQuery(
    { equipmentFilter },
    { staleTime: Infinity }
  );
  const allEquipmentItems = (data?.equipment?.items as Equipment[]) || [];
  const allEquipmentOptions = allEquipmentItems.map((equipment: Equipment) => ({
    value: equipment.externalId,
    label: equipment.name || 'No Name Equipment',
    type: equipment.type,
    isBroken: equipment.isBroken,
  }));

  return (
    <Select
      value={roomEquipmentSelect}
      options={allEquipmentOptions}
      showCheckbox
      isMulti
      onChange={setRoomEquipmentSelect}
    />
  );
};
