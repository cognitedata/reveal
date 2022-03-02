import styled from 'styled-components/macro';

import type { IconType } from '@cognite/cogs.js';
import { Colors, Icon } from '@cognite/cogs.js';

interface AlertContainerProps {
  readonly color: string;
}

const AlertContainer = styled.div<AlertContainerProps>`
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  column-gap: 6px;
  border-radius: var(--cogs-border-radius--default);
  .cogs-icon {
    color: ${(props) => Colors[props.color].toString()};
    flex: 0 0 1.4em;
  }
  p {
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export interface AlertProps {
  readonly color: string;
  readonly icon: IconType;
}

export function Alert({
  color,
  children,
  icon,
}: React.PropsWithChildren<AlertProps>) {
  return (
    <AlertContainer className="z-1 cogs-detail" color={color}>
      <Icon type={icon} />
      <div>{children}</div>
    </AlertContainer>
  );
}
