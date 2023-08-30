import React from 'react';

import styled from 'styled-components';

import { Background as BG } from '@cognite/cdf-utilities';

import {
  BREAKPOINT_WIDTH,
  BG_ROTATE_PERIOD,
  LANGUAGES,
} from '../../common/constants';
import { useTranslation } from '../../common/i18n';
import { LanguageSwitch } from '../../Components/LanguageSwitch';

interface Props {
  children: React.ReactNode | null;
  language?: string;
  toggleLanguage?: (lang: string) => void;
}
export const Background = ({ children, language, toggleLanguage }: Props) => {
  const { t } = useTranslation();

  return (
    <BG
      rotatePeriod={BG_ROTATE_PERIOD}
      breakpointWidth={BREAKPOINT_WIDTH}
      action={
        <LanguageSwitch
          id="globalSwitchId"
          title={t('change-language').toLocaleUpperCase()}
          language={language}
          languages={LANGUAGES.map((lang) => lang.code)}
          toggleLanguage={toggleLanguage}
        />
      }
    >
      <CenteredOnDesktop>{children}</CenteredOnDesktop>
    </BG>
  );
};

const CenteredOnDesktop = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    justify-content: flex-start;
    padding-top: 78px;
  }
`;
