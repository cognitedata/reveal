import * as React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';

import { EXIT_DELETE } from './constants';

const DialogHeader = styled.div`
  display: flex;
  flex-direction: row;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 4px;
`;

const DialogHeaderLabel = styled.div`
  display: flex;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--cogs-greyscale-grey9);
  font-size: var(--cogs-t5-font-size);
  line-height: var(--cogs-t5-line-height);
  letter-spacing: var(--cogs-t5-letter-spacing);
`;

const MiddlePadding = styled.div`
  flex-grow: 1;
`;

const CloseButton = styled(Button)`
  width: 40px;
`;

interface Props {
  onCancel: () => void;
}
export const UnmountConfirmationDefaultContent: React.FC<Props> = ({
  onCancel,
}) => {
  return (
    <DialogHeader data-testid="drawing-mode-leave-confirmation">
      <DialogHeaderLabel>{EXIT_DELETE}</DialogHeaderLabel>
      <MiddlePadding />
      <CloseButton icon="Close" block onClick={onCancel} aria-label="Close" />
    </DialogHeader>
  );
};
