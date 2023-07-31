import * as React from 'react';

import { BaseButton } from 'components/Buttons';
import EmptyState from 'components/EmptyState';
import { useTranslation } from 'hooks/useTranslation';

import { EMPTY_STATE_TEXT, RESET_TO_DEFAULT_BUTTON_TEXT } from './constants';
import { EmptyStateContainer, ResetToDefaultContainer } from './elements';

export interface Props {
  handleResetToDefault?: () => void;
}

export const ResetToDefault: React.FC<Props> = React.memo(
  ({ handleResetToDefault }) => {
    const { t } = useTranslation();

    return (
      <ResetToDefaultContainer>
        <EmptyStateContainer>
          <EmptyState emptySubtitle={t(EMPTY_STATE_TEXT)} />
        </EmptyStateContainer>

        <BaseButton
          type="primary"
          onClick={handleResetToDefault}
          text={t(RESET_TO_DEFAULT_BUTTON_TEXT)}
        />
      </ResetToDefaultContainer>
    );
  }
);
