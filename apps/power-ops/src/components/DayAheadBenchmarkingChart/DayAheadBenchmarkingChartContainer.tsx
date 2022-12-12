import { useFetchBenchmarkingSequences } from 'queries/useFetchBenchmarkingData';
import { BenchmarkingFilterType } from '@cognite/power-ops-api-types';
import { CommonChart } from 'components/CommonChart/CommonChart';
import { Loader } from '@cognite/cogs.js';
import { CommonError } from 'components/CommonError/CommonError';
import { ComponentProps, useMemo, useState } from 'react';
import { PlotMouseEvent } from 'plotly.js';
import { CommonChartTooltip } from 'components/CommonChart/CommonChartTooltip';
import { BenchmarkingTypeOption } from 'types';
import { getPointOffset, TooltipOffset } from 'components/CommonChart/utils';

import { formatPlotData, TooltipData } from './utils';
import { chartStyles, layout } from './chartConfig';
import { PlotContainer } from './elements';
import { DayAheadBenchmarkingTooltipContent } from './DayAheadBenchmarkingTooltipContent';

type Props = {
  filter: BenchmarkingFilterType | undefined;
  type: BenchmarkingTypeOption;
  showFirstRuns: boolean;
};

export const DayAheadBenchmarkingChartContainer = ({
  filter,
  type,
  showFirstRuns,
}: Props) => {
  const { data = [], status } = useFetchBenchmarkingSequences(filter);
  const [tooltipData, setTooltipData] = useState<TooltipData | undefined>();
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [tooltipOffset, setTooltipOffset] = useState<TooltipOffset>({
    top: 0,
    left: 0,
  });
  const [tooltipAlignClass, setTooltipAlignClass] =
    useState<ComponentProps<typeof CommonChartTooltip>['alignClass']>(
      'right-from-point'
    );

  const tooltipContent = useMemo(() => {
    return (
      tooltipData && (
        <DayAheadBenchmarkingTooltipContent tooltipData={tooltipData} />
      )
    );
  }, [tooltipData]);

  if (status === 'loading')
    return (
      <Loader infoTitle="Loading Benchmarking data ..." darkMode={false} />
    );
  if (status === 'error')
    return (
      <PlotContainer>
        <CommonError title="Oops!" buttonText="Reload Data">
          We weren’t able to fetch any data.
          <br />
          Try reloading the page.
        </CommonError>
      </PlotContainer>
    );

  const formattedData = formatPlotData(data, type, showFirstRuns);

  const getChartTitle = (): string => {
    return data?.[0] ? `${data[0].label} by method` : 'No data found';
  };
  const getChartSubtitle = (): string => {
    return `Showing ${
      showFirstRuns ? 'first and' : 'only'
    } latests runs per day`;
  };

  const benchmarkingLayout = {
    ...layout,
    yaxis: {
      ...layout.yaxis,
      title: {
        standoff: 8,
        text:
          type !== 'absolute'
            ? `${data[0]?.label}: Difference vs ${type}`
            : `${data[0]?.label}: Absolute`,
        font: {
          size: 10,
        },
      },
    },
  };

  const handleChartHoverEvent = (event: PlotMouseEvent) => {
    setTooltipVisible(true);
    // We add an additional left offset (32 + 48) to account for external
    // and internal paddings added according to style guidelines
    const offset = getPointOffset(event.points[0], { left: 32 + 48, top: 0 });
    setTooltipOffset(offset);

    if (event.points[0].pointIndex >= event.points[0].data.x.length - 8) {
      setTooltipAlignClass('left-from-point');
    } else {
      setTooltipAlignClass('right-from-point');
    }

    const date = `${event.points[0].x}`;
    setTooltipData({
      name: event.points[0].data.name,
      latestRunDate: date,
      latestRunValue: Number(
        (event.points[0].data as any).meta.latestRunValues[date]
      ).toFixed(2),
      firstRunDate: date,
      firstRunValue: Number(
        (event.points[0].data as any).meta.firstRunValues[date]
      ).toFixed(2),
      color: event.points[0].data.marker.color as string,
    });
  };

  return (
    <>
      {tooltipContent && tooltipVisible && (
        <CommonChartTooltip
          content={tooltipContent}
          offset={tooltipOffset}
          visible={tooltipVisible}
          alignClass={tooltipAlignClass}
        />
      )}
      <CommonChart
        title={getChartTitle()}
        subTitle={getChartSubtitle()}
        data={formattedData}
        layout={benchmarkingLayout}
        chartStyles={chartStyles}
        onHover={handleChartHoverEvent}
        onUnhover={() => setTooltipVisible(false)}
      />
    </>
  );
};
