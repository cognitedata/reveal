import { Icon, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components/macro';

type ToolbarProps = {
  onSearchClick: () => void;
  onNewWorkflowClick: () => void;
};

export const Toolbar = ({
  onSearchClick,
  onNewWorkflowClick,
}: ToolbarProps) => {
  return (
    <ToolbarWrapper>
      <Tooltip content="Add data to chart" placement="right">
        <ToolbarItem onClick={onSearchClick}>
          <ToolbarIcon title="Search for and add time series" type="Search" />
        </ToolbarItem>
      </Tooltip>
      <Tooltip content="Add calculation to chart" placement="right">
        <ToolbarItem onClick={onNewWorkflowClick}>
          <ToolbarIcon title="Create new calculation" type="YAxis" />
        </ToolbarItem>
      </Tooltip>
    </ToolbarWrapper>
  );
};

const ToolbarWrapper = styled.div`
  min-width: 56px;
  width: 56px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  background-color: var(--cogs-greyscale-grey1);
`;

const ToolbarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  cursor: pointer;

  &:hover {
    background-color: var(--cogs-greyscale-grey3);
  }
`;

const ToolbarIcon = styled(Icon)`
  width: 20px;
`;
