import { useRef, SetStateAction, Dispatch } from 'react';

import styled from 'styled-components';

import { RangePicker, VerticalDivider } from '@data-exploration/components';

import { Flex, Button, Tooltip, Dropdown, Menu } from '@cognite/cogs.js';

import {
  DateRangeProps,
  useDimensions,
  useTranslation,
} from '@data-exploration-lib/core';

import { SearchResultCountLabel } from '../SearchResultCountLabel';
import { SearchResultToolbar } from '../SearchResultToolbar';

const HEADER_BUTTONS_WIDTH_LIMIT = 380;
const DISABLED_HIDE_EMPTY_BUTTON_TOOLTIP_CONTENT =
  'All loaded timeseries are empty. Button will be enabled when at least 1 timeseries has datapoints';
const TIMESERIES_RANGE_SELECTOR_TEXT = 'Chart preview';
const HIDE_TIMESERIES_TEXT = 'Hide empty time series';

export const TimeseriesTableHeader = ({
  showDatePicker = false,
  showCount = false,
  hideEmptyData = false,
  setHideEmptyData,
  filteredTimeseriesLength,
  loadedCount,
  totalCount,
  dateRange,
  onDateRangeChange,
}: {
  showCount?: boolean;
  showDatePicker?: boolean;
  hideEmptyData: boolean;
  setHideEmptyData: Dispatch<SetStateAction<boolean>>;
  filteredTimeseriesLength?: number;
  loadedCount: number;
  totalCount: number | string;
} & DateRangeProps) => {
  const headerButtonsContainerRef = useRef(null);
  const { t } = useTranslation();
  const { width: headerButtonsWidth } = useDimensions(
    headerButtonsContainerRef
  );

  const tooltipDisabled = filteredTimeseriesLength !== 0;
  const hideButtonDisabled = !tooltipDisabled;

  const renderButtons = () => {
    return (
      <>
        {showDatePicker && (
          <RangePicker
            initialRange={dateRange}
            onRangeChanged={onDateRangeChange}
          >
            <Button icon="XAxis" aria-label="Chart Preview logo">
              <StyledSpan>
                {t(
                  'TIMESERIES_RANGE_SELECTOR_TEXT',
                  TIMESERIES_RANGE_SELECTOR_TEXT
                )}
              </StyledSpan>
            </Button>
          </RangePicker>
        )}
        <Tooltip
          content={t(
            'DISABLED_HIDE_EMPTY_BUTTON_TOOLTIP_CONTENT',
            DISABLED_HIDE_EMPTY_BUTTON_TOOLTIP_CONTENT
          )}
          disabled={tooltipDisabled}
        >
          <Button
            toggled={hideEmptyData}
            disabled={hideButtonDisabled}
            onClick={() => setHideEmptyData((prev) => !prev)}
          >
            <StyledSpan>
              {t('HIDE_TIMESERIES_TEXT', HIDE_TIMESERIES_TEXT)}
            </StyledSpan>
          </Button>
        </Tooltip>
      </>
    );
  };

  const renderDropdownMenu = () => {
    return (
      <Dropdown
        content={
          <Menu>
            {showDatePicker && (
              <RangePicker
                initialRange={dateRange}
                onRangeChanged={onDateRangeChange}
              >
                <Menu.Item icon="XAxis">
                  <>
                    {t(
                      'TIMESERIES_RANGE_SELECTOR_TEXT',
                      TIMESERIES_RANGE_SELECTOR_TEXT
                    )}
                  </>
                </Menu.Item>
              </RangePicker>
            )}
            <Tooltip
              content={t(
                'DISABLED_HIDE_EMPTY_BUTTON_TOOLTIP_CONTENT',
                DISABLED_HIDE_EMPTY_BUTTON_TOOLTIP_CONTENT
              )}
              disabled={tooltipDisabled}
            >
              <Menu.Item
                toggled={hideEmptyData}
                disabled={hideButtonDisabled}
                onClick={() => setHideEmptyData((prev) => !prev)}
              >
                <>{t('HIDE_TIMESERIES_TEXT', HIDE_TIMESERIES_TEXT)}</>
              </Menu.Item>
            </Tooltip>
          </Menu>
        }
      >
        <Button icon="EllipsisHorizontal" />
      </Dropdown>
    );
  };

  return (
    <TimeseriesHeaderContainer
      alignItems="center"
      justifyContent="space-between"
    >
      <SearchResultToolbar
        showCount={showCount}
        resultCount={
          <SearchResultCountLabel
            loadedCount={loadedCount}
            totalCount={totalCount}
            resourceType="timeSeries"
          />
        }
      />

      <HeaderButtonsContainer ref={headerButtonsContainerRef}>
        <Flex alignItems="center" justifyContent="end" gap={10}>
          {headerButtonsWidth > HEADER_BUTTONS_WIDTH_LIMIT
            ? renderButtons()
            : renderDropdownMenu()}
          <VerticalDivider />
        </Flex>
      </HeaderButtonsContainer>
    </TimeseriesHeaderContainer>
  );
};

const TimeseriesHeaderContainer = styled(Flex)`
  flex: 1;
`;

const StyledSpan = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
`;

const HeaderButtonsContainer = styled.div`
  width: 100%;
`;
