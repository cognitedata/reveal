import { useEffect, useState } from 'react';

import { ParentSize } from '@visx/responsive';

import { extent } from 'd3';
import styled from 'styled-components/macro';

import { SegmentedControl, Slider } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type { DatapointAggregate } from '@cognite/sdk';
import type {
  AggregateType,
  LogicalCheck,
} from '@cognite/simconfig-api-sdk/rtk';

import { SteadyStateDetectionChart } from 'components/charts/SteadyStateDetectionChart/SteadyStateDetectionChart';
import type { Datapoint } from 'utils/ssd/timeseries';

export function ExampleChart() {
  const { client } = useAuthContext();
  const [threshold, setThreshold] = useState(0);
  const [minSegmentDistance, setMinSegmentDistance] = useState(15);
  const [varianceThreshold, setVarianceThreshold] = useState(5);
  const [slopeThreshold, setSlopeThreshold] = useState(-3.5);
  const [check, setCheck] = useState('eq');
  const [aggregation, setAggregation] = useState('average');

  const [cdfData, setCdfData] = useState<Datapoint[]>([]);
  const [range, setRange] = useState({ min: 0, max: 1 });
  const [step, setStep] = useState(1);
  const [axisLabel, setAxisLabel] = useState('Process sensor');

  useEffect(() => {
    async function getExampleTimeseries() {
      if (!client) {
        return;
      }
      try {
        const {
          items: [{ unit, description }],
        } = await client.timeseries.list({
          filter: {
            externalIdPrefix: 'UK_PI_CFAW.003-PI011.PV',
          },
        });
        setAxisLabel(`${description.substr(0, 20)} (${unit ?? 'n/a'})`);
      } catch (e) {
        console.error('Error while reading time series (missing permissions?)');
        return;
      }

      const [{ datapoints }] = await client.datapoints.retrieve({
        items: [
          {
            externalId: 'UK_PI_CFAW.003-PI011.PV',
            start: new Date('2021-11-25T12:30').getTime(),
            end: new Date('2021-11-25T17:30').getTime(),
            aggregates: ['average'],
            granularity: '30s',
            limit: 1000,
          },
        ],
      });

      const mappedDatapoints = (datapoints as DatapointAggregate[]).map(
        ({ timestamp, average }) => ({
          timestamp,
          value: average ?? 0,
        })
      );

      const [min = 0, max = 1] = extent(mappedDatapoints, (dp) => dp.value);

      setCdfData(mappedDatapoints);
      setRange({ min, max });
      setThreshold(Math.floor((min + max) / 2));
      setStep(Math.ceil(min / 100) / 100);
    }
    void getExampleTimeseries();
  }, [client, client?.datapoints, client?.timeseries]);

  if (!cdfData.length) {
    return null;
  }

  return (
    <>
      <ChartContainer>
        <ParentSize>
          {({ width, height }) => (
            <SteadyStateDetectionChart
              aggregation={aggregation as AggregateType}
              check={check as Required<LogicalCheck>['check']}
              data={cdfData}
              height={height}
              minSegmentDistance={minSegmentDistance}
              slopeThreshold={slopeThreshold}
              threshold={threshold}
              varianceThreshold={varianceThreshold}
              width={width}
              yAxisLabel={axisLabel}
            />
          )}
        </ParentSize>
      </ChartContainer>
      <ChartControlContainer>
        <ChartControl>
          <div className="label">Aggregation</div>
          <div className="control">
            <SegmentedControl size="small" onButtonClicked={setAggregation}>
              <SegmentedControl.Button key="average">
                Average
              </SegmentedControl.Button>
              <SegmentedControl.Button key="stepInterpolation">
                Step interpolation
              </SegmentedControl.Button>
              <SegmentedControl.Button key="interpolation">
                Interpolation
              </SegmentedControl.Button>
            </SegmentedControl>
          </div>
        </ChartControl>
        <ChartControl>
          <div className="label">Logical check</div>
          <div className="control">
            <SegmentedControl size="small" onButtonClicked={setCheck}>
              <SegmentedControl.Button key="eq">=</SegmentedControl.Button>
              <SegmentedControl.Button key="ne">≠</SegmentedControl.Button>
              <SegmentedControl.Button key="gt">&gt;</SegmentedControl.Button>
              <SegmentedControl.Button key="ge">≥</SegmentedControl.Button>
              <SegmentedControl.Button key="lt">&lt;</SegmentedControl.Button>
              <SegmentedControl.Button key="le">≤</SegmentedControl.Button>
            </SegmentedControl>
          </div>
        </ChartControl>
        <ChartControl>
          <div className="label">Threshold</div>
          <div className="value">{threshold}</div>
          <div className="control">
            <Slider
              max={range.max}
              min={range.min}
              step={step}
              value={threshold}
              onChange={setThreshold}
            />
          </div>
        </ChartControl>
        <ChartControl>
          <div className="label">Min. distance</div>
          <div className="value">{minSegmentDistance}</div>
          <div className="control">
            <Slider
              max={50}
              min={1}
              step={1}
              value={minSegmentDistance}
              onChange={setMinSegmentDistance}
            />
          </div>
        </ChartControl>
        <ChartControl>
          <div className="label">Variance threshold</div>
          <div className="value">{varianceThreshold}</div>
          <div className="control">
            <Slider
              max={50}
              min={0}
              step={0.1}
              value={varianceThreshold}
              onChange={setVarianceThreshold}
            />
          </div>
        </ChartControl>
        <ChartControl>
          <div className="label">Slope threshold</div>
          <div className="value">{slopeThreshold}</div>
          <div className="control">
            <Slider
              max={10}
              min={-10}
              step={0.1}
              value={slopeThreshold}
              onChange={setSlopeThreshold}
            />
          </div>
        </ChartControl>
      </ChartControlContainer>
    </>
  );
}

const ChartContainer = styled.div`
  height: 250px;
`;
const ChartControlContainer = styled.div`
  margin: 12px 0 0 0;
`;
const ChartControl = styled.div`
  display: flex;
  white-space: nowrap;
  align-items: center;
  gap: 12px;
  margin: 6px 0;
  .label {
    flex: 1 1 auto;
  }
  .value {
    font-weight: bold;
  }
  .control {
    flex: 0 1 70%;
  }
`;
