import { Room, Equipment } from 'graphql/generated';
import { useEffect } from 'react';
import { RecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

type PopupDataTypes = Partial<Room> | Partial<Equipment>;

export const useSetupPopup = (
  data: PopupDataTypes,
  formState: RecoilState<PopupDataTypes>
) => {
  const resetIsEditMode = useResetRecoilState(isEditModeAtom);
  const setRoomFormState = useSetRecoilState(formState);
  useEffect(() => {
    setRoomFormState(data);
    resetIsEditMode();
  }, []);
};
