import styled from 'styled-components/macro';

import { Title } from '@cognite/cogs.js';

import { FlexRow, sizes } from 'styles/layout';

export const ConfirmBody = styled.div`
  padding: 0 ${sizes.extraSmall};
`;
export const ConfirmHeader = styled(FlexRow)`
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${sizes.extraSmall};
`;

export const ConfirmHeaderLabel = styled(Title).attrs({ level: 5 })``;

export const ConfirmFooter = styled(FlexRow)`
  justify-content: flex-end;
  .cogs-btn {
    margin-left: 10px;
    border-radius: 6px;
  }
  .cogs-btn-ghost {
    color: var(--cogs-red-2);
  }

  .cogs-modal-footer {
    border-top: none;
  }
`;
