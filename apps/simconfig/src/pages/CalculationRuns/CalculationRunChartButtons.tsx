import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Skeleton } from '@cognite/cogs.js';
import type { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';
import { useGetCalculationQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

interface CalculationRunChartButtonsProps {
  calculationRun: CalculationRun;
}

export function CalculationRunChartButtons({
  calculationRun,
}: CalculationRunChartButtonsProps) {
  const project = useSelector(selectProject);
  const externalId = calculationRun.metadata.calcConfig;
  const eventId = calculationRun.id?.toString();
  const { data: chartLinks, isFetching: isFetchingChartLinks } =
    useGetCalculationQuery({
      project,
      externalId,
      eventId,
    });

  if (isFetchingChartLinks) {
    return <Skeleton.Rectangle />;
  }

  if (!chartLinks) {
    return null;
  }

  return (
    <ChartButtonGroups>
      <Button
        href={chartLinks.inputLink}
        icon="LineChart"
        loading={isFetchingChartLinks}
        target="_blank"
        type="tertiary"
      >
        Open Inputs in Charts
      </Button>

      <Button
        href={chartLinks.outputLink}
        icon="LineChart"
        loading={isFetchingChartLinks}
        target="_blank"
        type="tertiary"
      >
        Open Outputs in Charts
      </Button>
    </ChartButtonGroups>
  );
}

const ChartButtonGroups = styled.div`
  display: flex;
  column-gap: 12px;
`;
