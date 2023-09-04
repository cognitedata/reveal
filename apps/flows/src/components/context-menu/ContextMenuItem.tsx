import styled from 'styled-components';

import { Button, Colors, Detail } from '@cognite/cogs.js';

type ContextMenuItemProps = {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  shortcut?: string;
};

export const ContextMenuItem = ({
  label,
  onClick,
  shortcut,
}: ContextMenuItemProps) => {
  return (
    <ContextMenuItemContent onClick={onClick}>
      <Detail>{label}</Detail>
      {shortcut && (
        <Detail
          style={{
            color: Colors['text-icon--muted'],
          }}
        >
          {shortcut}
        </Detail>
      )}
    </ContextMenuItemContent>
  );
};

const ContextMenuItemContent = styled(Button).attrs({ type: 'ghost' })`
  gap: 32px;

  && {
    justify-content: space-between;
    padding-left: 8px;
    padding-right: 8px;
  }
`;
