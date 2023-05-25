import {
  Button,
  ButtonProps,
  NotificationDot,
  Tooltip,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { BaseIcon } from '../../Icons';

type Props = ButtonProps & {
  showNotificationDot?: boolean;
};

export const SearchConfigButton: React.FC<Props> = ({
  showNotificationDot = false,
  ...buttonProps
}: Props) => {
  return (
    <Tooltip content="Search parameters" position="bottom">
      <ButtonWrapper>
        <Button {...buttonProps}>
          <NotificationDot hidden={!showNotificationDot}>
            {
              // @ts-expect-error remove this when cogs is enabled for styles.
              <BaseIcon type="Configure" style={{ verticalAlign: 'middle' }} />
            }
          </NotificationDot>
          <StyledSpan>Config</StyledSpan>
        </Button>
      </ButtonWrapper>
    </Tooltip>
  );
};

const StyledSpan = styled.span`
  margin-left: 8px;
`;

const ButtonWrapper = styled.div`
  .cogs.cogs-button {
    height: 40px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;
