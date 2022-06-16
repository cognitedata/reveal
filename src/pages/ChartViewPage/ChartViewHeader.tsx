/**
 * ChartView Header
 */

import {
  Button,
  Icon,
  Tooltip,
  Dropdown,
  Menu,
  Switch,
} from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import DateTimePicker from 'components/DateTime/DateTimePicker';
import { makeDefaultTranslations } from 'utils/translations';
import {
  Header,
  WarningAlert,
  Divider,
  DropdownTitle,
  DropdownWrapper,
  RangeWrapper,
  RangeColumn,
  MenuItemText,
} from './elements';

const CHART_SETTINGS_KEYS = {
  SHOW_Y_AXIS: 'showYAxis',
  SHOW_MIN_MAX: 'showMinMax',
  SHOW_GRIDLINES: 'showGridlines',
  MERGE_UNITS: 'mergeUnits',
};

const defaultTranslations = makeDefaultTranslations(
  'Add time series',
  'Add calculation',
  'Imports',
  'Import calculations',
  'View only. Duplicate to edit.',
  'Hide gridlines',
  'Show gridlines',
  'Hide min/max',
  'Show min/max',
  'Y axes',
  'Y axis',
  'Show Y axes',
  'Merge units',
  'Disable stacking',
  'Enable stacking'
);

type Props = {
  userId: string | undefined;
  isOwner: boolean;
  stackedMode: boolean;
  setStackedMode: (diff: boolean) => void;
  showSearch: boolean;
  showYAxis: boolean;
  showMinMax: boolean;
  showGridlines: boolean;
  mergeUnits: boolean;
  dateFrom: Date;
  dateTo: Date;
  handleOpenSearch: (diff: any) => void;
  handleClickNewWorkflow: (diff: any) => void;
  handleImportCalculationsClick: ((diff: any) => void) | undefined;
  handleSettingsToggle: (str: string, val: boolean) => void;
  handleDateChange: ComponentProps<typeof DateTimePicker>['onChange'];
  translations?: typeof defaultTranslations;
};

const ChartViewHeader = ({
  userId,
  isOwner,
  showSearch,
  stackedMode,
  showYAxis,
  showMinMax,
  showGridlines,
  mergeUnits,
  dateFrom,
  dateTo,
  setStackedMode,
  handleOpenSearch,
  handleClickNewWorkflow,
  handleImportCalculationsClick,
  handleSettingsToggle,
  handleDateChange,
  translations,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  return (
    <Header className="downloadChartHide">
      <section className="actions">
        {!showSearch && (
          <Button icon="Add" type="primary" onClick={handleOpenSearch}>
            {t['Add time series']}
          </Button>
        )}
        <Button icon="Function" type="ghost" onClick={handleClickNewWorkflow}>
          {t['Add calculation']}
        </Button>
        {handleImportCalculationsClick && (
          <Dropdown
            content={
              <Menu>
                <Menu.Header>{t.Imports}</Menu.Header>
                <Menu.Item
                  appendIcon="Function"
                  onClick={handleImportCalculationsClick}
                >
                  <MenuItemText>{t['Import calculations']}</MenuItemText>
                </Menu.Item>
              </Menu>
            }
          >
            <Button
              icon="EllipsisHorizontal"
              type="ghost"
              aria-label="view"
              style={{ paddingRight: 8, marginLeft: 4 }}
            />
          </Dropdown>
        )}
      </section>
      {userId && !isOwner && (
        <section>
          <WarningAlert
            type="warning"
            message={t['View only. Duplicate to edit.']}
            icon={<Icon type="Info" />}
            showIcon
          />
        </section>
      )}
      <section className="daterange">
        <Tooltip
          content={`${
            showGridlines ? t['Hide gridlines'] : t['Show gridlines']
          }`}
        >
          <Button
            icon="GridLines"
            type={showGridlines ? 'link' : 'ghost'}
            aria-label="view"
            onClick={() =>
              handleSettingsToggle(
                CHART_SETTINGS_KEYS.SHOW_GRIDLINES,
                !showGridlines
              )
            }
            style={{ marginLeft: 4 }}
          />
        </Tooltip>
        <Tooltip
          content={`${showMinMax ? t['Hide min/max'] : t['Show min/max']}`}
        >
          <Button
            icon="Timeseries"
            type={showMinMax ? 'link' : 'ghost'}
            aria-label="view"
            onClick={() =>
              handleSettingsToggle(
                CHART_SETTINGS_KEYS.SHOW_MIN_MAX,
                !showMinMax
              )
            }
            style={{ marginLeft: 4 }}
          />
        </Tooltip>
        <Tooltip content={t['Y axes']}>
          <Dropdown
            content={
              <Menu>
                <DropdownWrapper>
                  <DropdownTitle>{t['Y axis']}</DropdownTitle>
                  <Switch
                    name="toggleYAxis"
                    value={showYAxis}
                    onChange={() =>
                      handleSettingsToggle(
                        CHART_SETTINGS_KEYS.SHOW_Y_AXIS,
                        !showYAxis
                      )
                    }
                    style={{ marginBottom: 15 }}
                  >
                    {t['Show Y axes']}
                  </Switch>
                  <Switch
                    name="toggleUnitMerging"
                    value={mergeUnits}
                    onChange={() =>
                      handleSettingsToggle(
                        CHART_SETTINGS_KEYS.MERGE_UNITS,
                        !mergeUnits
                      )
                    }
                  >
                    {t['Merge units']}
                  </Switch>
                </DropdownWrapper>
              </Menu>
            }
          >
            <>
              <Button
                icon="YAxis"
                type="ghost"
                aria-label="view"
                style={{ paddingRight: 8, marginLeft: 4 }}
              >
                <Icon type="CaretDown" />
              </Button>
            </>
          </Dropdown>
        </Tooltip>
        <Tooltip
          content={`${
            stackedMode ? t['Disable stacking'] : t['Enable stacking']
          }`}
        >
          <Button
            icon="StackedChart"
            type={stackedMode ? 'link' : 'ghost'}
            onClick={() => setStackedMode(!stackedMode)}
            aria-label="view"
            style={{ marginLeft: 4 }}
          />
        </Tooltip>
        <Divider />
        <RangeWrapper>
          <RangeColumn>
            <DateTimePicker
              range={{
                startDate: dateFrom,
                endDate: dateTo,
              }}
              onChange={handleDateChange}
            />
          </RangeColumn>
        </RangeWrapper>
      </section>
    </Header>
  );
};

ChartViewHeader.translationKeys = Object.keys(defaultTranslations);
export default ChartViewHeader;
