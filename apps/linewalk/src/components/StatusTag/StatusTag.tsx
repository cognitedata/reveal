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

  if (status === LineReviewStatus.REVIEWED) {
    return (
      <Label size="small" variant="success">
        {status}
      </Label>
    );
  }

  return <Label>{status}</Label>;
};

export default StatusTag;
