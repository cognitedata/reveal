import { Chip } from '@cognite/cogs.js';

import { JobStatus } from '../../../types';
import { getScoreColor } from '../../../utils/getScoreColor';

export const PercentageChip = ({
  value,
  status,
  onClick,
}: {
  value: number;
  status: JobStatus;
  onClick?: () => void;
}) => {
  const isLoading = status === JobStatus.Queued || status === JobStatus.Running;
  return (
    <Chip
      hideTooltip={true}
      size="small"
      label={isLoading ? '' : `${value} %`}
      type={getScoreColor(value)}
      icon={isLoading ? 'Loader' : undefined}
      onClick={onClick}
    />
  );
};
