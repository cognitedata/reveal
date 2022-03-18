import {
  FC,
  useEffect,
  useState,
  ChangeEventHandler,
  useCallback,
  useMemo,
} from 'react';
import * as React from 'react';
import { compact } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Chart, ChartTimeSeries } from 'models/chart/types';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { useSDK } from '@cognite/sdk-provider';
import { Modal, Select, Icon, Checkbox, Input } from '@cognite/cogs.js';
import DelayedComponent from 'components/DelayedComponent';
import { TimeseriesChart } from '@cognite/data-exploration';
import {
  useSearchParam,
  useNavigate,
  useClearSearchParams,
} from 'hooks/navigation';
import { useMyCharts, useUpdateChart, useChart } from 'hooks/firebase';
import { Timeseries } from '@cognite/sdk';
import { calculateDefaultYAxis } from 'utils/axis';
import { addTimeseries, convertTSToChartTS } from 'models/chart/updates';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';

const TIMESERIE_IDS_KEY = 'timeserieIds';
const TIMESERIE_EXTERNAL_IDS_KEY = 'timeserieExternalIds';
const START_TIME_KEY = 'startTime';
const END_TIME_KEY = 'endTime';
const CHART_NAME_KEY = 'chartName';
const options = ['New chart', 'Add to chart'];

const defaultTranslations = makeDefaultTranslations(
  'Add Time series to chart',
  'Confirm',
  'Cancel',
  'Select all/none',
  'Chart',
  'New chart',
  'Add to chart'
);

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const OpenInCharts: FC = () => {
  const sdk = useSDK();
  const move = useNavigate();
  const { data: login } = useUserInfo();
  const { mutate: updateChart } = useUpdateChart();
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'OpenInCharts').t,
  };

  const [initiated, setInitiated] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState(options[0]);
  const [selectedChart, setSelectedChart] = useState<{
    label: string;
    value: string;
  }>({
    label: '',
    value: '',
  });

  const { data: existingChart } = useChart(selectedChart?.value);

  const [ts, setTs] = useState<Timeseries[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const myCharts = useMyCharts();
  const allCharts = useMemo(() => {
    const mine = myCharts.data || [];
    return mine.slice().sort((a, b) => {
      if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) return -1;
      if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) return 1;
      return 0;
    });
  }, [myCharts.data]);

  const [chartNameProp = ''] = useSearchParam(CHART_NAME_KEY);
  const [chartName, setChartName] = useState<string>(
    chartNameProp || 'New chart'
  );

  const [timeserieIds = ''] = useSearchParam(TIMESERIE_IDS_KEY);
  const [timeserieExternalIds = ''] = useSearchParam(
    TIMESERIE_EXTERNAL_IDS_KEY
  );
  const [startTime = ''] = useSearchParam(START_TIME_KEY);
  const [endTime = ''] = useSearchParam(END_TIME_KEY);

  const sparklineStartDate = dayjs()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();
  const sparklineEndDate = dayjs().endOf('day').toDate();

  const clearSearchParams = useClearSearchParams([
    CHART_NAME_KEY,
    TIMESERIE_IDS_KEY,
    TIMESERIE_EXTERNAL_IDS_KEY,
    START_TIME_KEY,
    END_TIME_KEY,
  ]);

  const loadTimeseries = useCallback(async () => {
    const timeseriesIds = compact(timeserieIds.split(',').map((id) => +id));
    const timeseriesExternalIds = compact(timeserieExternalIds.split(','));
    const timeseries = await sdk.timeseries.retrieve([
      ...timeseriesIds.map((id) => ({ id })),
      ...timeseriesExternalIds.map((id) => ({ externalId: id })),
    ]);
    setTs(timeseries);
    setSelectedIds(timeseries.map(({ id }) => id));
  }, [sdk.timeseries, timeserieIds, timeserieExternalIds]);

  useEffect(() => {
    if (allCharts.length > 0) {
      setSelectedChart({ label: allCharts[0].name, value: allCharts[0].id });
    }
  }, [allCharts]);

  useEffect(() => {
    if (
      !initiated &&
      (timeserieIds || timeserieExternalIds) &&
      startTime &&
      endTime
    ) {
      setVisible(true);
      setInitiated(true);
      loadTimeseries();
    }
  }, [
    timeserieIds,
    timeserieExternalIds,
    startTime,
    endTime,
    initiated,
    loadTimeseries,
  ]);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (nextState) =>
    setCurrentValue(nextState.target.value);

  const handleTimeSeriesClick = async (timeSeries: Timeseries) => {
    const tsToRemove = selectedIds.find((id) => id === timeSeries.id);
    if (tsToRemove) {
      setSelectedIds(selectedIds.filter((id) => id !== timeSeries.id));
    } else {
      setSelectedIds([...selectedIds, timeSeries.id]);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!login?.id) {
      return;
    }

    const shouldBeAddedToExistingChart = currentValue === options[1];
    if (shouldBeAddedToExistingChart && !existingChart) {
      return;
    }

    /**
     * Either use an existing chart or create a new one
     */
    const chartToUpdate: Chart =
      shouldBeAddedToExistingChart && existingChart
        ? existingChart
        : {
            id: uuidv4(),
            user: login?.id,
            userInfo: login,
            name: chartName,
            updatedAt: Date.now(),
            createdAt: Date.now(),
            dateFrom: new Date(+startTime).toJSON(),
            dateTo: new Date(+endTime).toJSON(),
            timeSeriesCollection: [],
            workflowCollection: [],
            public: false,
            version: 1,
          };

    /**
     * Filter out and keep only the timeseries we want to add
     * and make sure we don't add any duplicates
     */
    const timeseriesToAdd: Timeseries[] = selectedIds
      .map((id) => {
        const timeSeries = ts.find((timeSerie) => timeSerie.id === id);
        if (!timeSeries) {
          return undefined;
        }
        const existingTimeSeries = chartToUpdate.timeSeriesCollection?.find(
          (timeSerie) => timeSerie.tsId === id
        );
        if (existingTimeSeries) {
          return undefined;
        }
        return timeSeries;
      })
      .filter(Boolean) as Timeseries[];

    /**
     * Convert the list of specified timeseries from CDF
     * to timeseries specifications that we can add to the chart
     * (calculate range etc..)
     */
    const chartTimeseriesToAdd: ChartTimeSeries[] = await Promise.all(
      timeseriesToAdd.map(async (validTs) => {
        const range = await calculateDefaultYAxis({
          chart: chartToUpdate,
          sdk,
          timeSeriesExternalId: validTs.externalId || '',
        });
        return convertTSToChartTS(validTs, chartToUpdate.id, range);
      })
    );

    /**
     * Add all the timeseries to the chart
     */
    const chartWithAddedTimeseries: Chart = chartTimeseriesToAdd.reduce(
      (chart, chartTsToAdd) => addTimeseries(chart, chartTsToAdd!),
      chartToUpdate
    );

    /**
     * Write back the changes of the chart
     */
    await updateChart(chartWithAddedTimeseries);

    /**
     * Move to the new or updated chart
     */
    clearSearchParams();
    move(`/${chartToUpdate.id}`, false);
  }, [
    selectedIds,
    currentValue,
    existingChart,
    move,
    login,
    sdk,
    ts,
    updateChart,
    startTime,
    endTime,
    chartName,
    clearSearchParams,
  ]);
  const isAllSelected =
    selectedIds.length ===
    compact(timeserieIds.split(',')).length +
      compact(timeserieExternalIds.split(',')).length;
  return (
    <Modal
      title={t['Add Time series to chart']}
      okText={t.Confirm}
      cancelText={t.Cancel}
      visible={visible}
      onOk={handleSubmit}
      onCancel={() => {
        clearSearchParams();
        setVisible(false);
      }}
      width={900}
    >
      {(timeserieIds || timeserieExternalIds) && (
        <>
          <div>
            <Checkbox
              onClick={(e: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
                e.preventDefault();
                e.stopPropagation();
                if (isAllSelected) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds([
                    ...compact(timeserieIds.split(',')).map((id) => +id),
                    ...compact(timeserieExternalIds.split(',')).map(
                      (id) => +id
                    ),
                  ]);
                }
              }}
              name="selectAllNone"
              value={isAllSelected}
            >
              {t['Select all/none']}
            </Checkbox>

            <TSList>
              {ts?.map((tItem, i) => (
                <TSItem key={tItem.id}>
                  <Row>
                    <Left>
                      <Checkbox
                        onClick={(e) => {
                          e.preventDefault();
                          handleTimeSeriesClick(tItem);
                        }}
                        name={`${tItem.id}`}
                        value={selectedIds.includes(tItem.id)}
                      />
                      <InfoContainer>
                        <ResourceNameWrapper>
                          <Icon type="Timeseries" style={{ minWidth: 14 }} />
                          <span style={{ marginLeft: 5 }}>{tItem.name}</span>
                        </ResourceNameWrapper>
                        <Description>{tItem.description}</Description>
                      </InfoContainer>
                    </Left>
                    <Right>
                      <DelayedComponent delay={250 + i}>
                        <div style={{ width: 190 }}>
                          <TimeseriesChart
                            height={55}
                            showSmallerTicks
                            timeseriesId={tItem.id}
                            numberOfPoints={25}
                            showAxis="horizontal"
                            timeOptions={[]}
                            showContextGraph={false}
                            showPoints={false}
                            enableTooltip={false}
                            showGridLine="none"
                            minRowTicks={2}
                            dateRange={[sparklineStartDate, sparklineEndDate]}
                          />
                        </div>
                      </DelayedComponent>
                    </Right>
                  </Row>
                </TSItem>
              ))}
            </TSList>
          </div>
          <div style={{ marginTop: 16 }}>
            <strong>{t.Chart}</strong>
            <div style={{ marginTop: 8, marginBottom: 4 }}>
              <label className="cogs-radio" htmlFor={options[0]}>
                <input
                  type="radio"
                  name="chartsType"
                  id={options[0]}
                  value={options[0]}
                  defaultChecked
                  checked={currentValue === options[0]}
                  onChange={handleOnChange}
                />
                <div className="radio-ui" />
                {t['New chart']}
              </label>
            </div>
            <Input
              value={chartName}
              onChange={(val) => setChartName(val.target.value)}
              fullWidth
            />
            <div style={{ marginTop: 16, marginBottom: 4 }}>
              <label className="cogs-radio" htmlFor={options[1]}>
                <input
                  type="radio"
                  name="chartsType"
                  id={options[1]}
                  value={options[1]}
                  checked={currentValue === options[1]}
                  onChange={handleOnChange}
                />
                <div className="radio-ui" />
                {t['Add to chart']}
              </label>
            </div>
            <Select
              value={selectedChart}
              options={allCharts.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
              onChange={(val: { label: string; value: string }) => {
                setSelectedChart(val);
                setCurrentValue(options[1]);
              }}
              closeMenuOnSelect
              disabled
            />
          </div>
        </>
      )}
    </Modal>
  );
};

const TSList = styled.ul`
  width: calc(100% + 1rem);
  padding: 0;
  margin: 10px -0.5rem;
  list-style: none;
  max-height: calc(100vh - 500px);
  overflow-y: auto;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 0.5rem;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  word-break: break-word;
`;

const ResourceNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: top;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const Description = styled.span`
  margin-left: 20px;
  font-size: 10px;
`;

const Left = styled.div`
  display: flex;
  flex-direction: row;
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
`;
