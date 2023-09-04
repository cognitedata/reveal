import { MouseEventHandler } from 'react';

import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN, Z_INDEXES } from '@flows/common';

import { Colors, Icon } from '@cognite/cogs.js';

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
  left: ${FLOATING_ELEMENT_MARGIN}px;
  position: absolute;
  top: ${FLOATING_ELEMENT_MARGIN}px;
  width: 48px;
  z-index: ${Z_INDEXES.FLOATING_ELEMENT};

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
