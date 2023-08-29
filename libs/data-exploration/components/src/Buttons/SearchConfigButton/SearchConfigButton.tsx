import styled from 'styled-components';

import {
  Button,
  ButtonProps,
  NotificationDot,
  Tooltip,
} from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { BaseIcon } from '../../Icons';

type Props = ButtonProps & {
  showNotificationDot?: boolean;
};

export const SearchConfigButton: React.FC<Props> = ({
  showNotificationDot = false,
  ...buttonProps
}: Props) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      content={t('SEARCH_PARAMETERS', 'Search parameters')}
      position="bottom"
    >
      <ButtonWrapper>
        <Button {...buttonProps}>
          <NotificationDot hidden={!showNotificationDot}>
            <BaseIcon type="Configure" style={{ verticalAlign: 'middle' }} />
          </NotificationDot>
          <StyledSpan>{t('CONFIG', 'Config')}</StyledSpan>
        </Button>
      </ButtonWrapper>
    </Tooltip>
  );
};

const StyledSpan = styled.span`
  margin-left: 8px;
  width: max-content;
`;

const ButtonWrapper = styled.div`
  .cogs.cogs-button {
    height: 40px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;
