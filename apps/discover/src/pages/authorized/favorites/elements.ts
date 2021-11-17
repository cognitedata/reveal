import styled from 'styled-components/macro';

import { FlexColumn, sizes } from 'styles/layout';

export const PageContainer = styled(FlexColumn)`
  width: 100%;
  background-color: var(--cogs-white);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
`;

export const ButtonSeparator = styled.div`
  margin: 0 6px;
  width: 1px;
  height: 30px;
  background: var(--cogs-greyscale-grey3);
  margin-right: ${sizes.normal};
  margin-left: ${sizes.normal};
`;

export const TableBulkActionsWrapper = styled.div`
  position: fixed;
  margin: 0 auto;
  left: calc(50%);
  transform: translateX(-50%);
  width: 1200px;
  max-width: 80%;
  bottom: 0;
`;

export const VertSeperator = styled.div`
  display: flex;
  border-right: 1px solid var(--cogs-color-strokes-default);
  margin: 0 8px;
`;

export const HoverMenuItem = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 156px;
  &:hover {
    background-color: var(--cogs-red-8);
  }
`;

export const DangerDiv = styled(HoverMenuItem)`
  color: var(--cogs-red-2);
`;
