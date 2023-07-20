import * as React from 'react';

import { Dropdown, Divider, Menu } from '@cognite/cogs.js';

import {
  ChartActionStyledButton,
  ChartActionMenu,
  ChartActionContainer,
  ChartActionIcon,
} from './elements';

type ChartActionProps = {
  handleOpenSearch: () => void;
  handleClickNewWorkflow: () => void;
  handleImportCalculationsClick: () => void;
};

// need it for Dropdown
const ChartActionButtonRef = React.forwardRef<HTMLButtonElement, any>(
  (props, ref) => <ChartActionStyledButton ref={ref} {...props} />
);

export const ChartActionButton = ({
  handleOpenSearch,
  handleClickNewWorkflow,
  handleImportCalculationsClick,
}: ChartActionProps) => {
  return (
    <ChartActionContainer>
      <Dropdown
        content={
          <ChartActionMenu>
            <Menu.Item
              key="add-timeseries"
              onClick={handleOpenSearch}
              icon="Timeseries"
              iconPlacement="left"
            >
              Add time series
            </Menu.Item>
            <Divider />
            <Menu.Item
              key="add-calculation"
              onClick={handleClickNewWorkflow}
              icon="Function"
              iconPlacement="left"
            >
              Add calculation
            </Menu.Item>
            <Menu.Item
              icon="Download"
              iconPlacement="left"
              key="import-calculation"
              onClick={handleImportCalculationsClick}
            >
              Import calculation
            </Menu.Item>
          </ChartActionMenu>
        }
      >
        <ChartActionButtonRef type="button">
          <ChartActionIcon type="AddLarge" size={18} />
        </ChartActionButtonRef>
      </Dropdown>
    </ChartActionContainer>
  );
};
