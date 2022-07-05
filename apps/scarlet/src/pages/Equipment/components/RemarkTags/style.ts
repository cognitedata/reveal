import { Collapse } from '@cognite/cogs.js';
import styled from 'styled-components';

export const TagCollapse = styled(Collapse)`
  background-color: transparent;
`;

export const TagPanel = styled(Collapse.Panel)`
  border: 1px solid var(--cogs-greyscale-grey4) !important;
  overflow: hidden;
  border-radius: 8px;
  margin: 12px 0;

  > .rc-collapse-header {
    flex-direction: row-reverse;
    background-color: var(--cogs-white);
  }

  > .rc-collapse-content {
    border-top: 1px solid var(--cogs-greyscale-grey4) !important;
    padding: 0 12px;
  }
`;

export const Header = styled.div`
  flex-grow: 1;
  display: flex;
`;

export const HeaderLabel = styled.div`
  color: var(--cogs-text-color-secondary);
  margin-right: 4px;
`;

export const HeaderAddTag = styled.div`
  opacity: 0.4;
`;

export const AllTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
