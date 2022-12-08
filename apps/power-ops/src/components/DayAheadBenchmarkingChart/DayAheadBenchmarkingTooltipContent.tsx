import { Card } from 'components/DayAheadBenchmarkingChart/chartConfig';

import { FlexRow, TooltipCard } from '../CommonChart/elements';

import { TooltipData } from './utils';

interface DayAheadBenchmarkingTooltipProps {
  tooltipData: TooltipData;
}
export const DayAheadBenchmarkingTooltipContent = ({
  tooltipData,
}: DayAheadBenchmarkingTooltipProps) => (
  <TooltipCard>
    <FlexRow>
      <Card title={`${tooltipData.name}`} />
    </FlexRow>
    <FlexRow>
      <Card
        title="Latest run"
        value={tooltipData.latestRunDate}
        solidLineColor={tooltipData.color}
      />
      <Card title="Value" value={tooltipData.latestRunValue} />
    </FlexRow>
    <FlexRow>
      <Card
        title="First run"
        value={tooltipData.firstRunDate}
        dashedLineColor={tooltipData.color}
      />
      <Card title="Value" value={tooltipData.firstRunValue} />
    </FlexRow>
  </TooltipCard>
);
