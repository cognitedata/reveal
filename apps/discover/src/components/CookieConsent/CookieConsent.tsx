import React from 'react';

import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Button } from '@cognite/cogs.js';

import { APP_NAME } from 'constants/general';
import { useTranslation } from 'hooks/useTranslation';
import { sizes } from 'styles/layout';

export const CONFIRM_BUTTON_TEXT = 'Accept';

const Container = styled.div`
  position: absolute;
  bottom: ${sizes.small};
  display: flex;
  justify-content: center;
  z-index: ${layers.COOKIE_CONSENT};
  width: 100%;
`;

const SnackbarContent = styled.div`
  background-color: var(--cogs-greyscale-grey9);
  padding: 12px;
  color: var(--cogs-text-inverted);
  border-radius: 4px;

  display: flex;
  align-items: center;
  gap: ${sizes.small};
`;

export interface Props {
  onAccept: () => void;
}
export const CookieConsent: React.FC<Props> = ({ onAccept }) => {
  const { t } = useTranslation('cookies');

  return (
    <Container>
      <SnackbarContent aria-describedby="cookie-snackbar">
        <span>
          {t(
            `${APP_NAME} uses cookies to provide a great user experience for you. By using ${APP_NAME} you accept the use of cookies.`
          )}
        </span>
        <Button
          key="cookie-snackbar_first_action"
          variant="default"
          type="primary"
          size="small"
          onClick={onAccept}
        >
          {t(CONFIRM_BUTTON_TEXT)}
        </Button>
      </SnackbarContent>
    </Container>
  );
};
