import styled, { css } from 'styled-components';
import { Button } from '@cognite/cogs.js';

export const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  flex-wrap: wrap;
`;

export const DropdownButton = styled(Button)`
  min-width: 150px;
  height: 40px;
  display: flex;
  justify-content: space-between;
`;

export const StartContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 1rem;
`;

export const FieldWrapper = styled.div`
  margin-right: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .cogs-input {
    text-align: left;
  }

  .rc-tabs.rc-tabs-top.cogs-tabs {
    height: 38px;
  }
`;

export const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  ${({ disabled }: { disabled?: boolean }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

export const DropdownSeparator = styled.div`
  line-height: 36px;
  margin-right: 1rem;
`;
