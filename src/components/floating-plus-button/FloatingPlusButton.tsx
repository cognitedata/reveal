import { Colors, Icon } from '@cognite/cogs.js';
import { MouseEventHandler } from 'react';

import styled from 'styled-components';

type FloatingPlusButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const FloatingPlusButton = ({
  onClick,
}: FloatingPlusButtonProps): JSX.Element => {
  return (
    <FloatingButton onClick={onClick}>
      <PlusIcon size={24} type="AddLarge" />
    </FloatingButton>
  );
};

const FloatingButton = styled.button`
  align-items: center;
  background-color: ${Colors['surface--action--strong--default']};
  border: none;
  border-radius: 50%;
  box-shadow: none;
  cursor: pointer;
  display: flex;
  height: 48px;
  justify-content: center;
  padding: 0;
  left: 12px;
  position: absolute;
  top: 12px;
  width: 48px;
  z-index: 1;

  :hover {
    background-color: ${Colors['surface--action--strong--hover']};
  }

  :active {
    background-color: ${Colors['surface--action--strong--pressed']};
  }
`;

const PlusIcon = styled(Icon).attrs({ type: 'AddLarge' })`
  color: ${Colors['text-icon--strong--inverted']};
`;
