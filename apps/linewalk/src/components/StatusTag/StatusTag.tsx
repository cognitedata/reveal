import { Label } from '@cognite/cogs.js';
import { LineReviewStatus } from 'modules/lineReviews/types';

export type StatusTagProps = {
  status: LineReviewStatus;
};

const StatusTag = ({ status }: StatusTagProps) => {
  if (status === LineReviewStatus.OPEN) {
    return (
      <Label size="small" variant="danger">
        {status}
      </Label>
    );
  }

  return <div>{status}</div>;
};

export default StatusTag;
