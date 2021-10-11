import React from 'react';
import { useTranslation } from 'react-i18next';

import { Snackbar, SnackbarContent, SnackbarOrigin } from '@material-ui/core';

import { Button } from '@cognite/cogs.js';

import layers from '_helpers/zindex';
import { APP_NAME } from 'constants/general';

export const CONFIRM_BUTTON_TEXT = 'Accept';

export interface Props {
  onAccept: () => void;
}
export const CookieConsent: React.FC<Props> = ({ onAccept }) => {
  const { t } = useTranslation('cookies');

  const anchorOrigin: SnackbarOrigin = {
    vertical: 'bottom',
    horizontal: 'center',
  };
  const ContentProps = { 'aria-describedby': 'message-id' };
  const style = { zIndex: layers.COOKIE_CONSENT };

  return (
    <Snackbar anchorOrigin={anchorOrigin} open ContentProps={ContentProps}>
      <SnackbarContent
        style={style}
        aria-describedby="cookie-snackbar"
        message={
          <span>
            {t(
              `${APP_NAME} uses cookies to provide a great user experience for you. By using ${APP_NAME} you accept the use of cookies.`
            )}
          </span>
        }
        action={[
          <Button
            key="cookie-snackbar_first_action"
            variant="default"
            type="primary"
            size="small"
            onClick={onAccept}
          >
            {t(CONFIRM_BUTTON_TEXT)}
          </Button>,
        ]}
      />
    </Snackbar>
  );
};
