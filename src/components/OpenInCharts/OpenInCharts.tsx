import React, {
  FC,
  useEffect,
  useState,
  ChangeEventHandler,
  useCallback,
  useMemo,
} from 'react';
import { compact } from 'lodash';
import { useHistory } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Chart } from 'reducers/charts/types';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { useSDK } from '@cognite/sdk-provider';
import { Modal, Select, Icon, Checkbox, Input } from '@cognite/cogs.js';
import { CHART_VERSION } from 'config/';
import DelayedComponent from 'components/DelayedComponent';
import { TimeseriesChart } from '@cognite/data-exploration';
import { useQueryString, useLoginStatus } from 'hooks';
import { useMyCharts, useUpdateChart, useChart } from 'hooks/firebase';
import { Timeseries } from '@cognite/sdk';
import { calculateDefaultYAxis } from 'utils/axis';
import { addTimeseries, covertTSToChartTS } from 'utils/charts';
import {
  TIMESERIE_IDS_KEY,
  TIMESERIE_EXTERNAL_IDS_KEY,
  START_TIME_KEY,
  END_TIME_KEY,
  CHART_NAME_KEY,
} from 'utils/constants';

const options = ['New chart', 'Add to chart'];

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const OpenInCharts: FC = () => {
  const sdk = useSDK();
  const history = useHistory();
  const { data: login } = useLoginStatus();
  const { mutate: updateChart } = useUpdateChart();
  const { item: chartNameProp } = useQueryString(CHART_NAME_KEY);
  const [initiated, setInitiated] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState(options[0]);
  const [chart, setChart] = useState<{ label: string; value: string }>({
    label: '',
    value: '',
  });
  const [chartName, setChartName] = useState<string>(
    chartNameProp || 'New chart'
  );
  const { data: existingChart } = useChart(chart?.value);
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
  const { item: timeserieIds } = useQueryString(TIMESERIE_IDS_KEY);
  const { item: timeserieExternalId } = useQueryString(
    TIMESERIE_EXTERNAL_IDS_KEY
  );
  const { item: startTime } = useQueryString(START_TIME_KEY);
  const { item: endTime } = useQueryString(END_TIME_KEY);
  const sparklineStartDate = dayjs()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();
  const sparklineEndDate = dayjs().endOf('day').toDate();
  const loadTimeseries = useCallback(async () => {
    const timeseriesIds = compact(timeserieIds.split(',').map((id) => +id));
    const timeseriesExternalIds = compact(timeserieExternalId.split(','));
    const timeseries = await sdk.timeseries.retrieve([
      ...timeseriesIds.map((id) => ({ id })),
      ...timeseriesExternalIds.map((id) => ({ externalId: id })),
    ]);
    setTs(timeseries);
    setSelectedIds(timeseries.map(({ id }) => id));
  }, [sdk.timeseries, timeserieIds, timeserieExternalId]);
  useEffect(() => {
    if (allCharts.length > 0) {
      setChart({ label: allCharts[0].name, value: allCharts[0].id });
    }
  }, [allCharts]);
  useEffect(() => {
    if (
      !initiated &&
      (timeserieIds || timeserieExternalId) &&
      startTime &&
      endTime
    ) {
      setVisible(true);
      setInitiated(true);
      loadTimeseries();
    }
  }, [
    timeserieIds,
    timeserieExternalId,
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
    if (!login?.user) {
      return;
    }
    if (currentValue === options[0]) {
      const chartId = nanoid();
      const newChart: Chart = {
        id: chartId,
        user: login?.user,
        name: chartName,
        updatedAt: Date.now(),
        createdAt: Date.now(),
        timeSeriesCollection: [],
        workflowCollection: [],
        dateFrom: new Date(+startTime).toJSON(),
        dateTo: new Date(+endTime).toJSON(),
        public: false,
        version: CHART_VERSION,
      };
      await updateChart(newChart);
      await Promise.all(
        selectedIds.map(async (id) => {
          const timeSeries = ts.find((timeSerie) => timeSerie.id === id);
          if (!timeSeries) {
            return;
          }
          const range = await calculateDefaultYAxis({
            chart: newChart,
            sdk,
            timeSerieId: timeSeries.id,
          });
          const newTs = covertTSToChartTS(timeSeries, range);
          updateChart(addTimeseries(newChart, newTs));
          newChart.timeSeriesCollection?.push(newTs);
        })
      );
      history.replace(newChart.id);
    } else {
      if (!existingChart) {
        return;
      }
      existingChart.dateFrom = new Date(+startTime).toJSON();
      existingChart.dateTo = new Date(+endTime).toJSON();
      await Promise.all(
        selectedIds.map(async (id) => {
          const timeSeries = ts.find((timeSerie) => timeSerie.id === id);
          if (!timeSeries) {
            return;
          }
          const existingTimeSeries = existingChart.timeSeriesCollection?.find(
            (timeSerie) => timeSerie.tsId === id
          );
          if (existingTimeSeries) {
            return;
          }
          const range = await calculateDefaultYAxis({
            chart: existingChart,
            sdk,
            timeSerieId: timeSeries.id,
          });
          const newTs = covertTSToChartTS(timeSeries, range);
          updateChart(addTimeseries(existingChart, newTs));
          existingChart.timeSeriesCollection?.push(newTs);
        })
      );
      history.replace(existingChart.id);
    }
  }, [
    selectedIds,
    currentValue,
    existingChart,
    history,
    login?.user,
    sdk,
    ts,
    updateChart,
    startTime,
    endTime,
    chartName,
  ]);
  return (
    <Modal
      title="Add Timeseries to Chart"
      okText="Confirm"
      visible={visible}
      onOk={handleSubmit}
      onCancel={() => setVisible(false)}
      width={500}
    >
      {(timeserieIds || timeserieExternalId) && (
        <>
          <div>
            <strong>Timeseries ({ts.length})</strong>
            <TSList>
              {ts?.map((t, i) => (
                <TSItem key={t.id}>
                  <Row>
                    <InfoContainer>
                      <ResourceNameWrapper>
                        <Icon
                          type="ResourceTimeseries"
                          style={{ minWidth: 14 }}
                        />
                        <span style={{ marginLeft: 5 }}>{t.name}</span>
                      </ResourceNameWrapper>
                      <Description>{t.description}</Description>
                    </InfoContainer>
                    <Right>
                      <DelayedComponent delay={250 + i}>
                        <div style={{ width: 190 }}>
                          <TimeseriesChart
                            height={65}
                            showSmallerTicks
                            timeseriesId={t.id}
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
                      <Checkbox
                        onClick={(e) => {
                          e.preventDefault();
                          handleTimeSeriesClick(t);
                        }}
                        name={`${t.id}`}
                        value={selectedIds.includes(t.id)}
                      />
                    </Right>
                  </Row>
                </TSItem>
              ))}
            </TSList>
          </div>
          <div style={{ marginTop: 16 }}>
            <strong>Chart</strong>
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
                {options[0]}
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
                {options[1]}
              </label>
            </div>
            <Select
              value={chart}
              options={allCharts.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
              onChange={(val: { label: string; value: string }) => {
                setChart(val);
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
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 5px;
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

const Right = styled.div`
  display: flex;
  flex-direction: row;
`;
