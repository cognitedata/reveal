import * as React from 'react';

import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

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

const defaultTranslations = makeDefaultTranslations(
  'Add time series',
  'Add calculation',
  'Import calculation'
);

// need it for Dropdown
const ChartActionButtonRef = React.forwardRef<HTMLButtonElement, any>(
  (props, ref) => <ChartActionStyledButton ref={ref} {...props} />
);

export const ChartActionButton = ({
  handleOpenSearch,
  handleClickNewWorkflow,
  handleImportCalculationsClick,
}: ChartActionProps) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ChartActions').t,
  };

  return (
    <ChartActionContainer className="downloadChartHide">
      <Dropdown
        content={
          <ChartActionMenu>
            <Menu.Item
              key="add-timeseries"
              onClick={handleOpenSearch}
              icon="Timeseries"
              iconPlacement="left"
            >
              {t['Add time series']}
            </Menu.Item>
            <Divider />
            <Menu.Item
              key="add-calculation"
              onClick={handleClickNewWorkflow}
              icon="Function"
              iconPlacement="left"
            >
              {t['Add calculation']}
            </Menu.Item>
            <Menu.Item
              icon="Download"
              iconPlacement="left"
              key="import-calculation"
              onClick={handleImportCalculationsClick}
            >
              {t['Import calculation']}
            </Menu.Item>
          </ChartActionMenu>
        }
      >
        <ChartActionButtonRef type="button">
          <ChartActionIcon
            type="AddLarge"
            size={18}
            data-testid="chart-action-btn"
          />
        </ChartActionButtonRef>
      </Dropdown>
    </ChartActionContainer>
  );
};
