import styled from 'styled-components/macro';
import { EditableChip } from '@platypus-app/components/EditableChip';
import { Body } from '@cognite/cogs.js';

export const FormLabel = styled(Body)`
  margin-bottom: 6px;

  &:after {
    content: ' *';
    color: var(--cogs-red);
  }
`;

export const NameWrapper = styled.div`
  margin-bottom: 16px;
`;

export const StyledEditableChip = styled(EditableChip)`
  display: inline-block;
  margin-bottom: 24px;
`;

export const InputDetail = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 0 0;

  .cogs-icon-Warning {
    margin-right: 6px;
  }
`;
