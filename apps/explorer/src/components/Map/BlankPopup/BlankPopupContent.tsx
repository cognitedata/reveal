import { Button } from '@cognite/cogs.js';
import { PAGES } from 'pages/constants';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

import { BlankPopupContentWrapper, FullWidthButton } from './elements';

export const BlankPopupContent = () => {
  const setIsEditMode = useSetRecoilState(isEditModeAtom);
  const handleClick = () => setIsEditMode(true);
  return (
    <BlankPopupContentWrapper>
      <div>
        <Link to={PAGES.HOME}>
          <Button type="ghost" icon="Close" aria-label="close-popup" />
        </Link>
      </div>
      <FullWidthButton icon="Plus" onClick={handleClick}>
        Add Information
      </FullWidthButton>
    </BlankPopupContentWrapper>
  );
};
