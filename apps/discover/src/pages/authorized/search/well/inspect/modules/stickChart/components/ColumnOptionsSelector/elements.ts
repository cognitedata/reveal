import styled from 'styled-components/macro';

import { FlexRow, sizes } from 'styles/layout';

export const ColumnOptionsSelectorContainer = styled(FlexRow)`
  cursor: pointer;
  align-items: center;
  height: 100%;
`;

export const ColumnOptionsSelectorIconWrapper = styled.span`
  padding-top: 3px;
  padding-left: 4px;
`;

export const Separator = styled.div`
  width: 100%;
  height: 1px;
  border-radius: ${sizes.extraSmall};
  background: var(--cogs-border-default);
  margin: 6px 0;
`;
