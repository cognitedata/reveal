import styled from 'styled-components/macro';

import type { IconType } from '@cognite/cogs.js';
import { Colors, Icon } from '@cognite/cogs.js';

const AlertContainer = styled.div`
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  column-gap: 6px;
  border-radius: var(--cogs-border-radius--default);
  .cogs-icon {
    color: ${Colors['surface--action--strong--default']};
    flex: 0 0 1.4em;
  }
  p {
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export interface AlertProps {
  readonly icon: IconType;
}

export function Alert({ children, icon }: React.PropsWithChildren<AlertProps>) {
  return (
    <AlertContainer className="z-1 cogs-detail">
      <Icon type={icon} />
      <div>{children}</div>
    </AlertContainer>
  );
}
