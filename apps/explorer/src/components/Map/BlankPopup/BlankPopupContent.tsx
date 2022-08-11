import { Button } from '@cognite/cogs.js';
import { useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

import {
  BlankPopupContentWrapper,
  BlankPopupDisplayContainer,
} from './elements';

export const BlankPopupContent = () => {
  const setIsEditMode = useSetRecoilState(isEditModeAtom);
  const handleClick = () => setIsEditMode(true);
  return (
    <BlankPopupDisplayContainer>
      <BlankPopupContentWrapper>
        <Button icon="Plus" onClick={handleClick}>
          Add Information
        </Button>
      </BlankPopupContentWrapper>
    </BlankPopupDisplayContainer>
  );
};
