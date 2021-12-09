import { Tag } from '@cognite/cogs.js';
import { LineReviewStatus } from 'modules/lineReviews/types';

export type StatusTagProps = {
  status: LineReviewStatus;
};

const StatusTag = ({ status }: StatusTagProps) => {
  return <Tag>{status}</Tag>;
};

export default StatusTag;
