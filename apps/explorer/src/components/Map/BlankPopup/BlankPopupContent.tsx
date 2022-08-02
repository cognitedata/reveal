import { LinkButton } from 'components/LinkButton/LinkButton';
import { PAGES } from 'pages/constants';
import { useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

import { BlankPopupContentWrapper, FullWidthButton } from './elements';

export const BlankPopupContent = () => {
  const setIsEditMode = useSetRecoilState(isEditModeAtom);
  const handleClick = () => setIsEditMode(true);
  return (
    <BlankPopupContentWrapper>
      <div>
        <LinkButton
          to={PAGES.HOME}
          type="ghost"
          icon="Close"
          aria-label="close-popup"
        />
      </div>
      <FullWidthButton icon="Plus" onClick={handleClick}>
        Add Information
      </FullWidthButton>
    </BlankPopupContentWrapper>
  );
};
