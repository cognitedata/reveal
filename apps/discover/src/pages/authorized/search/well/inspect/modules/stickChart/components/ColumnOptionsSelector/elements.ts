import styled from 'styled-components/macro';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const ColumnOptionsSelectorContainer = styled(FlexRow)`
  cursor: pointer;
  align-items: center;
  height: 100%;
`;

export const ColumnOptionsSelectorIconWrapper = styled.span`
  padding-top: 2px;
  padding-left: 6px;
`;

export const SelectedOptionIconWrapper = styled(Flex)`
  padding-left: ${sizes.normal};
  margin-left: auto;
  margin-right: -${sizes.small};
  color: var(--cogs-midblue-4);
`;
