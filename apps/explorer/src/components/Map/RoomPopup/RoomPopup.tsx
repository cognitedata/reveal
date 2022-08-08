import {
  Equipment,
  Room,
  useListFilteredEquipmentQuery,
} from 'graphql/generated';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { roomFormState } from 'recoil/roomPopup/roomFormState';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { useSetupPopup } from 'hooks/useSetupPopup';
import {
  prevRoomEquipmentSelectAtom,
  roomEquipmentSelectAtom,
} from 'recoil/roomPopup/roomPopupAtoms';
import { useEffect } from 'react';

import { RoomPopupContent } from './RoomPopupContent';
import { RoomEditPopupContent } from './RoomEditPopupContent';

export interface Props {
  data: Room;
}

export const RoomPopup: React.FC<Props> = ({ data }) => {
  const isEditMode = useRecoilValue(isEditModeAtom);
  const setPrevRoomEquipmentSelect = useSetRecoilState(
    prevRoomEquipmentSelectAtom
  );
  const setRoomEquipmentSelect = useSetRecoilState(roomEquipmentSelectAtom);

  const roomExternalId = data.externalId;
  const equipmentFilter = {
    room: {
      externalId: {
        eq: roomExternalId,
      },
    },
  };
  const { data: equipmentData, isLoading } = useListFilteredEquipmentQuery(
    {
      equipmentFilter,
    },
    {
      staleTime: Infinity,
    }
  );

  const equipmentList = (equipmentData?.equipment?.items as Equipment[]) || [];
  const equipmentSelectList = equipmentList.map((item) => ({
    value: item?.externalId,
    label: item?.name || 'Unnamed Equipment',
    type: item?.type || 'unknown',
    isBroken: !!item?.isBroken,
  }));

  useSetupPopup(data, roomFormState);

  useEffect(() => {
    setPrevRoomEquipmentSelect(equipmentSelectList);
    setRoomEquipmentSelect(equipmentSelectList);
  }, [equipmentData]);

  if (isLoading) return <div>Loading...</div>;

  return isEditMode ? <RoomEditPopupContent /> : <RoomPopupContent />;
};
