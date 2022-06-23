import React from 'react';

import { BackButton } from 'components/Buttons';
import { useTranslation } from 'hooks/useTranslation';

import {
  BackButtonWrapper,
  HeaderWrapper,
  HeaderContentWrapper,
} from '../../common/inspect/elements';

import { HEADER_TEXT } from './constants';

type HeaderProps = {
  handleBackToSearch: () => void;
  headerText?: string;
};

export const Header: React.FC<HeaderProps> = ({
  handleBackToSearch,
  headerText,
}) => {
  const { t } = useTranslation();
  return (
    <HeaderWrapper>
      <BackButtonWrapper>
        <BackButton
          type="link"
          text={!headerText ? t(HEADER_TEXT) : ''}
          onClick={handleBackToSearch}
          id="back-to-search-button"
          data-testid="back-to-search-button"
          aria-label="Back to search"
        />
      </BackButtonWrapper>
      <HeaderContentWrapper title={headerText}>
        {headerText}
      </HeaderContentWrapper>
    </HeaderWrapper>
  );
};

export default Header;
