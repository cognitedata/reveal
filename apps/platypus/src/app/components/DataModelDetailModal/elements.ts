import styled from 'styled-components/macro';

import { EditableChip } from '../EditableChip';

export const NameWrapper = styled.div`
  margin-bottom: 16px;
`;

export const StyledEditableChip = styled(EditableChip)`
  display: inline-block;
  margin-bottom: 24px;
  max-width: 100%;
`;

export const InputDetail = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 0 0;

  .cogs-icon-Warning {
    margin-right: 6px;
  }
`;

export const Selector = styled.div<{ $isSelected?: boolean }>`
  flex: 1;
  width: auto;
  cursor: pointer;
  border: 1px solid
    ${(props) =>
      props.$isSelected
        ? 'var(--cogs-border--interactive--toggled-default)'
        : 'rgba(83, 88, 127, 0.16)'};
  background: ${(props) =>
    props.$isSelected
      ? 'var(--cogs-surface--interactive--toggled-default)'
      : 'white'};
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  .cogs-icon {
    padding: 22px;
    background-color: var(--cogs-surface--medium);
    display: block;
    width: auto !important;
    border-radius: 8px;

    svg {
      width: 21px;
      height: 21px;
    }
  }
`;
