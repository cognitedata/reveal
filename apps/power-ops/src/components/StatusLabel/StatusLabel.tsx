import { LabelSize, LabelVariants } from '@cognite/cogs.js';

import { StyledLabel } from './elements';

type Props = {
  status: 'RUNNING' | 'FINISHED' | 'FAILED' | string;
  size?: LabelSize;
};

const variant: Record<string, LabelVariants> = {
  FAILED: 'danger',
  RUNNING: 'normal',
  FINISHED: 'success',
};

export const StatusLabel = ({ status, size = 'medium' }: Props) => (
  <StyledLabel
    size={size}
    variant={variant[status] ?? 'unknown'}
    icon={status === 'RUNNING' && 'Loader'}
    iconPlacement="right"
  >
    {status.charAt(0) + status.substring(1).toLowerCase()}
  </StyledLabel>
);
