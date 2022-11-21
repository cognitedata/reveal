import { Dropdown, Menu, Icon } from '@cognite/cogs.js';
import * as React from 'react';
import {
  ChartActionStyledButton,
  ChartActionMenu,
  ChartActionMenuItem,
  ChartActionContainer,
} from './elements';

type ChartActionProps = {
  handleOpenSearch: () => void;
  handleClickNewWorkflow: () => void;
  handleImportCalculationsClick: () => void;
};

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
            <ChartActionMenuItem
              key="add-timeseries"
              onClick={handleOpenSearch}
            >
              <Icon type="Timeseries" />
              Add time series
            </ChartActionMenuItem>
            <Menu.Divider />
            <ChartActionMenuItem
              key="add-calculation"
              onClick={handleClickNewWorkflow}
            >
              <Icon type="Function" />
              Add calculation
            </ChartActionMenuItem>
            <ChartActionMenuItem
              key="import-calculation"
              onClick={handleImportCalculationsClick}
            >
              <Icon type="Download" />
              Import calculation
            </ChartActionMenuItem>
          </ChartActionMenu>
        }
      >
        <ChartActionButtonRef type="button">
          <Icon type="AddLarge" style={{ color: 'white' }} size={18} />
        </ChartActionButtonRef>
      </Dropdown>
    </ChartActionContainer>
  );
};
