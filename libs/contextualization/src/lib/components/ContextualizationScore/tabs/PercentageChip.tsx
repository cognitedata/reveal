import { Chip } from '@cognite/cogs.js';

import { JobStatus } from '../../../types';
import { getScoreColor } from '../../../utils/getScoreColor';

export const PercentageChip = ({
  value,
  status,
  isLoading,
  onClick,
}: {
  value: number | undefined;
  status: JobStatus | undefined;
  isLoading?: boolean;
  onClick?: () => void;
}) => {
  const loading =
    status === JobStatus.Queued || status === JobStatus.Running || isLoading;

  if (!status && !value) {
    return <Chip hideTooltip={true} size="small" label="?" onClick={onClick} />;
  }
  return (
    <Chip
      hideTooltip={true}
      size="small"
      label={loading ? '' : `${value} %`}
      type={getScoreColor(value)}
      icon={loading ? 'Loader' : undefined}
      onClick={onClick}
    />
  );
};
