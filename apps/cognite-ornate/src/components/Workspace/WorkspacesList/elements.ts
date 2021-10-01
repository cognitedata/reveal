import styled from 'styled-components';
import { Icon as CogsIcon } from '@cognite/cogs.js';

type RecentListItemProps = {
  active: boolean;
};

export const RecentWorkspacesContainer = styled.div`
  display: block;
  top: 0;
  position: absolute;
  background: #fff;
  width: 100%;
  bottom: 0;
`;

export const RecentListItem = styled.div<RecentListItemProps>`
  height: 86px;
  border-radius: 2px;
  background-color: var(--cogs-greyscale-grey1);
  border-left: ${(props) =>
    props.active ? '4px solid var(--cogs-primary)' : 'none'};
  margin: 4px;
  display: block;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  padding: 16px;
  cursor: pointer;
  .cogs-icon {
    opacity: 0;
    transition: all 0.3s ease;
    margin: 4px;
  }

  &:hover {
    background-color: ${(props) =>
      props.active ? 'var(--cogs-greyscale-grey1)' : '#f6f7ff'};
    .cogs-icon {
      opacity: 1;
    }
  }
  .cogs-icon {
    margin: 0 8px;
    cursor: pointer;
  }
  .description {
    font-size: 10px;
    font-weight: 500;
    color: var(--cogs-greyscale-grey6);
    line-height: 18px;
    float: left;
  }

  .recent-workspace-actions {
    display: block;
    float: right;
  }
`;

export const ItemWrapper = styled.div``;

export const Icon = styled(CogsIcon)`
  margin-right: 16px;
  display: inline-block;
  cursor: pointer;
`;

export const Header = styled.h2`
  margin: 16px 0 24px 16px;
  color: var(--cogs-greyscale-grey6);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`;

export const AutoStash = styled.div`
  border-radius: 2px;
  background-color: var(--cogs-greyscale-grey1);
  margin: 4px;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  padding: 12px 16px;
  width: 100%;
  cursor: pointer;
  &:hover {
    background: var(--cogs-greyscale-grey2);
  }
`;
