import { useEffect } from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { nameAtom } from 'recoil/popupShared/nameAtom';

import { BlankEditPopup } from './BlankEditPopup';
import { BlankPopupContent } from './BlankPopupContent';

export const BlankPopup: React.FC = () => {
  const isEditMode = useRecoilValue(isEditModeAtom);
  const resetIsEditMode = useResetRecoilState(isEditModeAtom);
  const resetNameInput = useResetRecoilState(nameAtom);

  useEffect(() => {
    resetIsEditMode();
    resetNameInput();
  }, []);

  return isEditMode ? <BlankEditPopup /> : <BlankPopupContent />;
};
