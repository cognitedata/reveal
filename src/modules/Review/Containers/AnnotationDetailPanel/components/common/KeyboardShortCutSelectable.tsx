import styled from 'styled-components';
import React, { ReactText } from 'react';

export const KeyboardShortCutSelectable = ({
  children,
  id,
  selected,
  onClick,
}: {
  children: any;
  id: ReactText;
  selected: boolean;
  onClick?: () => void;
}) => {
  return (
    <SelectableRow
      onClick={onClick}
      className={`annotation-table-row ${selected ? 'active' : ''}`}
      id={`row-${id}`}
    >
      {children}
    </SelectableRow>
  );
};

export const KeyboardShortCutExpandChildSelectable = ({
  children,
  id,
  selected,
}: {
  children: any;
  id: ReactText;
  selected: boolean;
}) => {
  return (
    <SelectableRow
      className={`annotation-table-expand-row ${selected ? 'active' : ''}`}
      id={`row-${id}`}
    >
      {children}
    </SelectableRow>
  );
};

const SelectableRow = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
  &.active {
    background-color: var(--cogs-midblue-6);
  }
`;
