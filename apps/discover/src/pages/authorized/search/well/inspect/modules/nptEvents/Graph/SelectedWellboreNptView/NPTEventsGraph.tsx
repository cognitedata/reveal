import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';
import { getEndTimeDisplay } from 'domain/wells/npt/internal/selectors/getEndTimeDisplay';
import { getStartTimeDisplay } from 'domain/wells/npt/internal/selectors/getStartTimeDisplay';
import {
  NptCodeDefinitionType,
  NptView,
} from 'domain/wells/npt/internal/types';

import React, { useCallback } from 'react';

import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import { formatDate, getTimeDuration } from 'utils/date';
import { CHART_AXIS_LABEL_DATE_FORMAT } from 'utils/date/constants';

import { ScatterPlot } from 'components/Charts';
import { AxisPlacement } from 'components/Charts/common/Axis';
import { ScatterPlotOptions } from 'components/Charts/modules/ScatterPlot/types';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { FlexColumn, FlexRow } from 'styles/layout';

import { NptCodeDefinition } from '../../components/NptCodeDefinition';
import { accessors } from '../../constants';
import { NPT_GRAPH_COMMON_COLOR_CONFIG } from '../constants';
import { getNptCodesColorMap } from '../utils';

import {
  GRAPH_MAX_HEIGHT,
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
  IconStyle,
  InfoIconStyle,
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
      <SectionData $multiline={multiline}>{value || '-'}</SectionData>
    </CardSection>
  );
};

export const NPTEventsGraph: React.FC<{
  data: NptView[];
  nptCodeDefinitions?: NptCodeDefinitionType;
}> = React.memo(({ data, nptCodeDefinitions }) => {
  const { data: unit } = useUserPreferencesMeasurement();

  const getInfoIcon = useCallback(
    (option: string) => (
      <NptCodeDefinition
        nptCodeDefinition={nptCodeDefinitions && nptCodeDefinitions[option]}
        iconStyle={IconStyle}
      />
    ),
    []
  );

  const options: ScatterPlotOptions<NptView> = useDeepMemo(
    () => ({
      maxHeight: GRAPH_MAX_HEIGHT,
      colorConfig: {
        ...NPT_GRAPH_COMMON_COLOR_CONFIG,
        colors: getNptCodesColorMap(data),
      },
      legendOptions: {
        isolate: false,
      },
      getInfoIcon,
    }),
    [data]
  );

  const formatAxisLabel = (startTime: number) => {
    return formatDate(startTime, CHART_AXIS_LABEL_DATE_FORMAT);
  };

  const renderPlotHoverComponent = (nptEvent: NptView) => {
    const nptCode = get(nptEvent, accessors.NPT_CODE);
    const nptCodeDefinition = getCodeDefinition(
      nptEvent.nptCode,
      nptCodeDefinitions
    );

    return (
      <NPTEventCard key={uniqueId(nptCode)}>
        <NPTCodeContainer>
          <NPTCodeIndicator color={nptEvent.nptCodeColor} />
          <FlexColumn>
            <SectionTitle>NPT code</SectionTitle>
            <SectionData>
              {nptCode}
              <NptCodeDefinition
                nptCodeDefinition={nptCodeDefinition}
                iconStyle={InfoIconStyle}
              />
            </SectionData>
          </FlexColumn>
        </NPTCodeContainer>

        <FlexRow>
          <QuarterColumn>
            <Card title="Start date" value={getStartTimeDisplay(nptEvent)} />
            <Card
              title={`NPT MD${unit ? ` (${unit})` : ''}`}
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
            <Card title="End date" value={getEndTimeDisplay(nptEvent)} />
            <Card
              title="Duration"
              value={getTimeDuration(
                get(nptEvent, accessors.DURATION),
                'hours'
              )}
            />
            <Card
              title="Failure location"
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
      <ScatterPlot<NptView>
        id="selected-wellbore-npt-events-graph"
        data={data}
        xAxis={{
          accessor: accessors.START_TIME,
          title: NPT_EVENTS_GRAPH_X_AXIS_TITLE,
          placement: AxisPlacement.Bottom,
          formatAxisLabel,
        }}
        yAxis={{
          accessor: accessors.MEASURED_DEPTH,
          title: `${NPT_EVENTS_GRAPH_Y_AXIS_TITLE} (${unit})`,
          spacing: 30,
          reverseScaleDomain: true,
        }}
        title={NPT_EVENTS_GRAPH_TITLE}
        options={options}
        renderPlotHoverComponent={renderPlotHoverComponent}
      />
    </ChartWrapper>
  );
});
