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
  const eventId = String(calculationRun.id);
  const { data: chartLinks, isFetching: isFetchingChartLinks } =
    useGetCalculationQuery({
      project,
      externalId,
      eventId,
    });

  if (!chartLinks) {
    return null;
  }

  if (isFetchingChartLinks) {
    return <Skeleton.Rectangle height="50" width="100%" />;
  }

  return (
    <ChartButtonGroups>
      <Button
        href={chartLinks.inputLink}
        icon="LineChart"
        loading={isFetchingChartLinks}
        target="_blank"
        type="primary"
        toggled
      >
        Open Inputs in Charts
      </Button>

      <Button
        href={chartLinks.outputLink}
        icon="LineChart"
        loading={isFetchingChartLinks}
        target="_blank"
        type="primary"
        toggled
      >
        Open Outputs in Charts
      </Button>
    </ChartButtonGroups>
  );
}

const ChartButtonGroups = styled.div`
  display: flex;
  width: 50%;
  justify-content: space-between;
  padding-top: 1em;
`;
