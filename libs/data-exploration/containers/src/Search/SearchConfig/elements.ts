import styled from 'styled-components';

import { BaseCheckbox } from '@data-exploration/components';

import { Flex } from '@cognite/cogs.js';

export const ModalCheckbox = styled(BaseCheckbox)`
  padding: 8px;
  height: 36px;
  white-space: nowrap;
`;

export const ModalSwitchContainer = styled.div`
  padding: 8px;
  height: 36px;
  margin-left: auto;
  transform: translateY(2px);
`;

export const ColumnHeader = styled.div`
  padding: 8px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
`;

export const CommonColumnWrapper = styled.div`
  margin-right: 8px;
  background: var(--cogs-decorative--grayscale--200);
  border-radius: 8px;
`;

export const CommonWrapper = styled(Flex)``;

export const SearchConfigContainerWrapper = styled(Flex)`
  width: fit-content;
  overflow: hidden;
`;
