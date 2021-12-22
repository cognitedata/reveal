import styled from 'styled-components/macro';

import type { LabelVariants } from '@cognite/cogs.js';
import { Label, Tooltip } from '@cognite/cogs.js';
import type { CalculationRunMetadata } from '@cognite/simconfig-api-sdk/rtk';

export function CalculationStatusIndicator({
  status,
  statusMessage,
}: Partial<Pick<CalculationRunMetadata, 'status' | 'statusMessage'>>) {
  if (!status || !statusMessage) {
    return (
      <CalculationStatusLabel size="small" variant="unknown">
        N/A
      </CalculationStatusLabel>
    );
  }

  return (
    <Tooltip content={statusMessage}>
      <CalculationStatusLabel
        size="small"
        variant={CalculationStatusLabelVariantMap[status]}
      >
        {status}
      </CalculationStatusLabel>
    </Tooltip>
  );
}

const CalculationStatusLabelVariantMap: Record<
  CalculationRunMetadata['status'],
  LabelVariants
> = {
  unknown: 'unknown',
  ready: 'default',
  running: 'warning',
  success: 'success',
  failure: 'danger',
} as const;

const CalculationStatusLabel = styled(Label)`
  cursor: help;
  text-transform: capitalize;
`;
