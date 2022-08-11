import { Equipment, Room } from 'graphql/generated';
import { useEffect } from 'react';
import { RecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

type PopupDataTypes = Partial<Room> | Partial<Equipment>;

export const useSetupPopup = (
  data: PopupDataTypes,
  formState: RecoilState<PopupDataTypes>
) => {
  const resetIsEditMode = useResetRecoilState(isEditModeAtom);
  const setFormState = useSetRecoilState(formState);
  useEffect(() => {
    resetIsEditMode();
    setFormState(data);
  }, [data]);
};
