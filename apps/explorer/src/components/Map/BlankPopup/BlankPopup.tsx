import { Scalars } from 'graphql/generated';
import { useEffect } from 'react';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { newNodeIdAtom } from 'recoil/blankPopup/blankPopupAtoms';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';
import { nameAtom } from 'recoil/popupShared/nameAtom';

import { BlankEditPopup } from './BlankEditPopup';
import { BlankPopupContent } from './BlankPopupContent';

interface Props {
  nodeId: Scalars['Int64'];
}

export const BlankPopup: React.FC<Props> = ({ nodeId }) => {
  const isEditMode = useRecoilValue(isEditModeAtom);
  const resetIsEditMode = useResetRecoilState(isEditModeAtom);
  const resetNameInput = useResetRecoilState(nameAtom);
  const setNewNodeId = useSetRecoilState(newNodeIdAtom);

  useEffect(() => {
    resetIsEditMode();
    resetNameInput();
    setNewNodeId(nodeId);
  }, []);

  return isEditMode ? <BlankEditPopup /> : <BlankPopupContent />;
};
