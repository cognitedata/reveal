import { Label } from '@cognite/cogs.js';

const StatusLabel = ({ status }: { status: string }) => {
  return (
    <Label
      variant={
        // eslint-disable-next-line no-nested-ternary
        status === 'RUNNING'
          ? 'accent'
          : // eslint-disable-next-line no-nested-ternary
          status === 'FINISHED'
          ? 'success'
          : status === 'FAILED'
          ? 'danger'
          : 'unknown'
      }
    >
      {status}
    </Label>
  );
};

export default StatusLabel;
