import React from 'react';
import { AutoMLTrainingJob } from 'src/api/vision/autoML/types';
import styled from 'styled-components';
import {
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  Legend,
} from 'recharts';
import { Body } from '@cognite/cogs.js';

const dataKeyLabelMap = new Map<string, string>([
  ['precision', 'Precision'],
  ['recall', 'Recall'],
  ['confidenceThreshold', 'Confidence threshold'],
]);

const tickFormatter = (value: number) => {
  return `${Math.round(value * 10) / 10}`;
};

const renderPRCurve = (data: any[], xDataKey: string, yDataKey: string) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart margin={{ left: 20 }} data={data}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--cogs-midblue-5)"
              stopOpacity={0.9}
            />
            <stop
              offset="95%"
              stopColor="var(--cogs-midblue-5)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={yDataKey}
          stroke="var(--cogs-midblue-3)"
          fillOpacity={1}
          fill="url(#colorUv)"
          isAnimationActive={false}
        />
        <XAxis
          type="number"
          dataKey={xDataKey}
          tickFormatter={tickFormatter}
          tickCount={6}
        >
          <Label
            value={dataKeyLabelMap.get(xDataKey)}
            offset={0}
            position="insideBottom"
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey={yDataKey}
          tickFormatter={tickFormatter}
          tickCount={6}
        >
          <Label
            value={dataKeyLabelMap.get(yDataKey)}
            offset={0}
            angle={270}
            position="insideLeft"
          />
        </YAxis>
        <Tooltip />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const renderPRCurveByThreshold = (
  data: any[],
  threshold: string,
  precision: string,
  recall: string
) => {
  const legendFormatter = (value: string) => {
    return [dataKeyLabelMap.get(value)];
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart margin={{ left: 20 }} data={data}>
        <defs>
          <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--cogs-midblue-5)"
              stopOpacity={0.9}
            />
            <stop
              offset="95%"
              stopColor="var(--cogs-midblue-5)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--cogs-green-5)"
              stopOpacity={0.9}
            />
            <stop
              offset="95%"
              stopColor="var(--cogs-green-5)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <XAxis
          type="number"
          dataKey={threshold}
          tickFormatter={tickFormatter}
          tickCount={6}
        >
          <Label
            value={dataKeyLabelMap.get(threshold)}
            offset={0}
            position="insideBottom"
          />
        </XAxis>

        <Area
          type="monotone"
          dataKey={precision}
          stroke="var(--cogs-midblue-3)"
          fillOpacity={1}
          isAnimationActive={false}
          dot={false}
          fill="url(#blue)"
        />

        <Area
          type="monotone"
          dataKey={recall}
          stroke="var(--cogs-green-3)"
          fillOpacity={1}
          isAnimationActive={false}
          dot={false}
          fill="url(#green)"
        />

        <YAxis type="number" tickFormatter={tickFormatter} tickCount={6} />
        <Tooltip />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="top"
          height={36}
          iconType="plainline"
          formatter={legendFormatter}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const AutoMLCharts = (props: { model: AutoMLTrainingJob }) => {
  const data = props.model.modelEvaluation?.metrics;
  return data ? (
    <Container>
      <ChartContainer>
        <StyledBody strong>Precision-recall curve</StyledBody>
        {renderPRCurve(data, 'recall', 'precision')}
      </ChartContainer>

      <ChartContainer>
        <StyledBody strong>Precision-recall by threshold</StyledBody>
        {renderPRCurveByThreshold(
          data,
          'confidenceThreshold',
          'precision',
          'recall'
        )}
      </ChartContainer>
    </Container>
  ) : (
    <></>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 40px;
`;

const ChartContainer = styled.div`
  display: flex;
  width: 48%;
  height: 100%;
  padding: 20px;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
`;

const StyledBody = styled(Body)`
  padding-bottom: 30px;
`;
