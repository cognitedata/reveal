import styled from 'styled-components/macro';

import { Icon, Tooltip } from '@cognite/cogs.js';
import type { CalculationRunMetadata } from '@cognite/simconfig-api-sdk/rtk';

export function CalculationRunTypeIndicator({
  runType,
  userEmail,
}: Partial<CalculationRunMetadata>) {
  return indicatorMap[runType ?? 'none']((userEmail ?? '') || 'unknown user');
}

const indicatorMap: Record<
  CalculationRunMetadata['runType'] | 'none',
  (userName: string) => JSX.Element
> = {
  manual: (userName: string) => (
    <Tooltip content={`Manually started by ${userName}`}>
      <CalculationRunTypeIcon type="User" />
    </Tooltip>
  ),
  scheduled: (userName: string) => (
    <Tooltip content={`Scheduled by ${userName}`}>
      <CalculationRunTypeIcon type="Calendar" />
    </Tooltip>
  ),
  external: () => (
    <Tooltip content="External">
      <CalculationRunTypeIcon type="Code" />
    </Tooltip>
  ),
  none: () => (
    <Tooltip content="Calculation has not been run yet">
      <CalculationRunTypeIcon type="Error" />
    </Tooltip>
  ),
} as const;

const CalculationRunTypeIcon = styled(Icon)`
  cursor: help;
`;
