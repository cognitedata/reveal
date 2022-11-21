/**
 * ChartView Header
 */

import { Button, Icon, Dropdown, Menu } from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import DateTimePicker from 'components/DateTime/DateTimePicker';
import { makeDefaultTranslations } from 'utils/translations';
import {
  Header,
  WarningAlert,
  Divider,
  RangeColumn,
  MenuItemText,
  RangeWrapper,
} from './elements';
import ChartViewOptions from './ChartViewOptions';

const defaultTranslations = makeDefaultTranslations(
  'Add time series',
  'Add calculation',
  'Imports',
  'Import calculations',
  'View only. Duplicate to edit.'
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
  locale: ComponentProps<typeof DateTimePicker>['locale'];
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
  locale,
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
        <ChartViewOptions
          handleSettingsToggle={handleSettingsToggle}
          setStackedMode={setStackedMode}
          stackedMode={stackedMode}
          showYAxis={showYAxis}
          showMinMax={showMinMax}
          showGridlines={showGridlines}
          mergeUnits={mergeUnits}
        />
        <Divider />
        <RangeWrapper>
          <RangeColumn>
            <DateTimePicker
              range={{
                startDate: dateFrom,
                endDate: dateTo,
              }}
              onChange={handleDateChange}
              locale={locale}
            />
          </RangeColumn>
        </RangeWrapper>
      </section>
    </Header>
  );
};

ChartViewHeader.translationKeys = Object.keys(defaultTranslations);
export default ChartViewHeader;
