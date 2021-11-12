import React, { useMemo } from 'react';

import get from 'lodash/get';

import { ScatterPlot } from 'components/charts';
import { AxisPlacement } from 'components/charts/common/Axis';
import { ScatterPlotOptions } from 'components/charts/modules/ScatterPlot/types';
import { useNPTGraphSelectedWellboreData } from 'modules/wellInspect/selectors';
import { NPTEvent } from 'modules/wellSearch/types';
import { FlexColumn, FlexRow } from 'styles/layout';

import { accessors, colors, DEFAULT_NPT_COLOR } from '../../constants';
import { NO_NPT_DATA_COLOR } from '../constants';

import {
  NPT_EVENTS_GRAPH_TITLE,
  NPT_EVENTS_GRAPH_X_AXIS_TITLE,
  NPT_EVENTS_GRAPH_Y_AXIS_TITLE,
} from './constants';
import {
  NPTCodeContainer,
  ChartWrapper,
  NPTEventCard,
  SectionTitle,
  SectionData,
  NPTCodeIndicator,
  QuarterColumn,
  HalfColumn,
  CardSection,
} from './elements';

export const Card = ({
  title,
  value,
  multiline = false,
}: {
  title: string;
  value: string;
  multiline?: boolean;
}) => {
  return (
    <CardSection>
      <SectionTitle>{title}</SectionTitle>
      <SectionData multiline={multiline}>{value || '-'}</SectionData>
    </CardSection>
  );
};

export const NPTEventsGraph: React.FC = () => {
  const { data: selectedWellboreData } = useNPTGraphSelectedWellboreData();

  const options: ScatterPlotOptions<NPTEvent> = useMemo(
    () => ({
      colorConfig: {
        colors,
        accessor: accessors.NPT_CODE,
        defaultColor: DEFAULT_NPT_COLOR,
        noDataColor: NO_NPT_DATA_COLOR,
      },
      legendOptions: {
        isolate: false,
      },
      margins: {
        top: 10,
        bottom: 5,
        left: 60,
      },
    }),
    []
  );

  const formatAxisLabel = (startTime: number) => {
    const date = new Date(startTime);
    const month = date.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    });
    return month;
  };

  const getFormattedDate = (time: number) => {
    const date = new Date(time);
    const formattedDate = date.toLocaleString('default', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formattedDate;
  };

  const renderPlotHoverComponent = (nptEvent: NPTEvent) => {
    const nptCode = get(nptEvent, accessors.NPT_CODE);
    const nptCodeIndicatorColor = get(colors, nptCode, DEFAULT_NPT_COLOR);

    return (
      <NPTEventCard>
        <NPTCodeContainer>
          <NPTCodeIndicator color={nptCodeIndicatorColor} />
          <FlexColumn>
            <SectionTitle>NPT code</SectionTitle>
            <SectionData>{nptCode}</SectionData>
          </FlexColumn>
        </NPTCodeContainer>

        <FlexRow>
          <QuarterColumn>
            <Card
              title="Start date"
              value={getFormattedDate(get(nptEvent, accessors.START_TIME))}
            />
            <Card
              title="NPT MD (ft.)"
              value={get(nptEvent, accessors.MEASURED_DEPTH).toFixed(2)}
            />
            <Card
              title="Root cause"
              value={get(nptEvent, accessors.ROOT_CAUSE)}
            />
            <Card
              title="NPT level"
              value={get(nptEvent, accessors.NPT_LEVEL)}
            />
            <Card title="Created" value="-" />
          </QuarterColumn>

          <QuarterColumn>
            <Card
              title="End date"
              value={getFormattedDate(get(nptEvent, accessors.END_TIME))}
            />
            <Card
              title="Duration (hrs)"
              value={get(nptEvent, accessors.DURATION)}
            />
            <Card
              title="Failre location"
              value={get(nptEvent, accessors.LOCATION)}
            />
            <Card title="Subtype" value={get(nptEvent, accessors.SUBTYPE)} />
            <Card title="Updated" value="-" />
          </QuarterColumn>

          <HalfColumn>
            <Card
              title="Description"
              value={get(nptEvent, accessors.DESCRIPTION)}
              multiline
            />
          </HalfColumn>
        </FlexRow>
      </NPTEventCard>
    );
  };

  return (
    <ChartWrapper>
      <ScatterPlot<NPTEvent>
        data={selectedWellboreData}
        xAxis={{
          accessor: accessors.START_TIME,
          title: NPT_EVENTS_GRAPH_X_AXIS_TITLE,
          placement: AxisPlacement.Bottom,
          formatAxisLabel,
        }}
        yAxis={{
          accessor: accessors.MEASURED_DEPTH,
          title: NPT_EVENTS_GRAPH_Y_AXIS_TITLE,
          spacing: 30,
          reverseScaleDomain: true,
        }}
        title={NPT_EVENTS_GRAPH_TITLE}
        options={options}
        renderPlotHoverComponent={renderPlotHoverComponent}
      />
    </ChartWrapper>
  );
};
