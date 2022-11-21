import { Flex, Title } from '@cognite/cogs.js';
import DateTimePicker from 'components/DateTime/DateTimePicker';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import SecondaryTopBarLeft from 'components/SecondaryTopBar/SecondaryAppBarLeft';
import chartAtom from 'models/chart/atom';
import React, { ComponentProps } from 'react';
import { useRecoilState } from 'recoil';
import { currentDateRangeLocale } from 'config/locale';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { ChartActions } from 'components/TopBar/ChartActions';
import { Divider, RangeColumn, RangeWrapper } from './elements';
import ChartViewOptions from './ChartViewOptions';

type Props = {
  handleDateChange: ComponentProps<typeof DateTimePicker>['onChange'];
  stackedMode: boolean;
  setStackedMode: (diff: boolean) => void;
  showYAxis: boolean;
  showMinMax: boolean;
  showGridlines: boolean;
  mergeUnits: boolean;
  handleSettingsToggle: (str: string, val: boolean) => void;
};

const ChartViewPageSecondaryAppBar = ({
  handleDateChange,
  stackedMode,
  showYAxis,
  showMinMax,
  showGridlines,
  mergeUnits,
  handleSettingsToggle,
  setStackedMode,
}: Props) => {
  const [chart, setChart] = useRecoilState(chartAtom);
  const username =
    chart?.userInfo?.displayName || chart?.userInfo?.email || chart?.user;

  return (
    <>
      <SecondaryTopBarLeft>
        <Flex alignItems="center" gap={16}>
          <StyledContainer direction="column" gap={2}>
            <Title level={4}>
              <TranslatedEditableText
                value={chart?.name || ''}
                onChange={(value) => {
                  setChart((oldChart) => ({
                    ...oldChart!,
                    name: value,
                  }));
                }}
              />
            </Title>
          </StyledContainer>
        </Flex>
        <Flex style={{ flexGrow: 1 }} />
        <RightSideActions>
          <div
            className="cogs-topbar--item"
            style={{
              borderLeft: 'none',
              color: 'var(--cogs-greyscale-grey6)',
              whiteSpace: 'nowrap',
              marginRight: 17,
            }}
          >
            {dayjs(chart?.updatedAt).format('LL')} · {username}
          </div>
          <Divider />

          <ChartViewOptions
            handleSettingsToggle={handleSettingsToggle}
            setStackedMode={setStackedMode}
            stackedMode={stackedMode}
            showYAxis={showYAxis}
            showMinMax={showMinMax}
            showGridlines={showGridlines}
            mergeUnits={mergeUnits}
          />
          <RangeWrapper>
            <RangeColumn>
              {chart && (
                <DateTimePicker
                  hideTimePeriodSelector
                  range={{
                    startDate: new Date(chart?.dateFrom),
                    endDate: new Date(chart?.dateTo),
                  }}
                  onChange={handleDateChange}
                  locale={currentDateRangeLocale()}
                />
              )}
            </RangeColumn>
          </RangeWrapper>
          <Divider style={{ marginRight: '12px' }} />
          <ChartActions />
        </RightSideActions>
      </SecondaryTopBarLeft>
    </>
  );
};

const StyledContainer = styled(Flex)`
  padding: 0 12px;
`;

const RightSideActions = styled(Flex)`
  padding: 0 12px;
  align-items: center;
`;

export default ChartViewPageSecondaryAppBar;
