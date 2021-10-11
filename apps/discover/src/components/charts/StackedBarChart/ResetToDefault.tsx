import React from 'react';

import { useTranslation } from '@cognite/react-i18n';

import { BaseButton } from 'components/buttons';
import EmptyState from 'components/emptyState';

import { EMPTY_STATE_TEXT, RESET_TO_DEFAULT_BUTTON_TEXT } from './constants';
import {
  ResetToDefaultContainer,
  ResetToDefaultButtonWrapper,
} from './elements';

export interface Props {
  handleResetToDefault?: () => void;
}

export const ResetToDefault: React.FC<Props> = React.memo(
  ({ handleResetToDefault }) => {
    const { t } = useTranslation();

    return (
      <ResetToDefaultContainer>
        <EmptyState emptySubtitle={t(EMPTY_STATE_TEXT)} />

        <ResetToDefaultButtonWrapper>
          <BaseButton
            type="primary"
            onClick={handleResetToDefault}
            text={t(RESET_TO_DEFAULT_BUTTON_TEXT)}
          />
        </ResetToDefaultButtonWrapper>
      </ResetToDefaultContainer>
    );
  }
);
