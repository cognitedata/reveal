import { LabelSize } from '@cognite/cogs.js';

import { StyledLabel } from './elements';

export const StatusLabel = ({
  status,
  size = 'medium',
}: {
  status: string;
  size?: LabelSize;
}) => {
  return (
    <StyledLabel
      size={size}
      variant={
        // eslint-disable-next-line no-nested-ternary
        status === 'RUNNING'
          ? 'normal'
          : // eslint-disable-next-line no-nested-ternary
          status === 'FINISHED'
          ? 'success'
          : status === 'FAILED'
          ? 'danger'
          : 'unknown'
      }
      icon={status === 'RUNNING' && 'Loader'}
      iconPlacement="right"
    >
      {status.charAt(0) + status.substring(1).toLowerCase()}
    </StyledLabel>
  );
};
