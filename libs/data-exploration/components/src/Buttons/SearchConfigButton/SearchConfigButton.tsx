import { Button, ButtonProps, NotificationDot } from '@cognite/cogs.js';
import { BaseIcon } from '../../Icons';

type Props = ButtonProps & {
  showNotificationDot?: boolean;
};

export const SearchConfigButton: React.FC<Props> = ({
  showNotificationDot = false,
  ...buttonProps
}: Props) => {
  return (
    <Button {...buttonProps}>
      <NotificationDot hidden={!showNotificationDot}>
        {
          // @ts-expect-error remove this when cogs is enabled for styles.
          <BaseIcon type="Configure" style={{ verticalAlign: 'middle' }} />
        }
      </NotificationDot>
    </Button>
  );
};
