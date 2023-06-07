import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';

export const SpacedRow = styled.div`
  display: flex;
  align-items: stretch;
  padding-bottom: 8px;

  & > * {
    margin-right: 6px;
    display: inline-flex;
  }
  .spacer {
    flex: 1;
  }
  & > *:nth-last-child(1) {
    margin-right: 0px;
  }
`;
const HorizontalDivider = styled.div`
  width: 100%;
  height: 2px;
  margin-top: 8px;
  margin-bottom: 8px;
  background: var(--cogs-border--muted);
  display: inline-table;
`;

const VerticalDivider = styled.div`
  height: 100%;
  height: 2px;
  margin-left: 8px;
  margin-right: 8px;
  background: var(--cogs-border--muted);
  display: inline-table;
`;

export const Divider = {
  Vertical: VerticalDivider,
  Horizontal: HorizontalDivider,
};

export const TitleName = styled(Title)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
