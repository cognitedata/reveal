import {
  Button,
  ButtonProps,
  NotificationDot,
  Tooltip,
} from '@cognite/cogs.js';
import { BaseIcon } from '../../Icons';
import styled from 'styled-components';

type Props = ButtonProps & {
  showNotificationDot?: boolean;
};

export const SearchConfigButton: React.FC<Props> = ({
  showNotificationDot = false,
  ...buttonProps
}: Props) => {
  return (
    <Tooltip content="Search parameters" position="bottom">
      <Button {...buttonProps}>
        <NotificationDot hidden={!showNotificationDot}>
          {
            // @ts-expect-error remove this when cogs is enabled for styles.
            <BaseIcon type="Configure" style={{ verticalAlign: 'middle' }} />
          }
        </NotificationDot>
        <StyledSpan>Config</StyledSpan>
      </Button>
    </Tooltip>
  );
};

const StyledSpan = styled.span`
  margin-left: 8px;
`;
