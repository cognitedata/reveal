import styled from 'styled-components/macro';

import type { ChipType } from '@cognite/cogs.js';
import { Chip, Tooltip } from '@cognite/cogs.js';
import type { CalculationRunMetadata } from '@cognite/simconfig-api-sdk/rtk';

export function CalculationStatusIndicator({
  status,
  statusMessage,
}: Partial<Pick<CalculationRunMetadata, 'status' | 'statusMessage'>>) {
  if (!status || !statusMessage) {
    return <CalculationStatusChip label="N/A" type="default" />;
  }

  return (
    <Tooltip content={statusMessage}>
      <CalculationStatusChip
        label={status}
        type={CalculationStatusChipVariantMap[status]}
      />
    </Tooltip>
  );
}

const CalculationStatusChipVariantMap: Record<
  CalculationRunMetadata['status'],
  keyof typeof ChipType
> = {
  unknown: 'default',
  ready: 'neutral',
  running: 'warning',
  success: 'success',
  failure: 'danger',
} as const;

const CalculationStatusChip = styled(Chip).attrs({
  hideTooltip: true,
  size: 'x-small',
})`
  cursor: help;
  text-transform: capitalize;
`;
