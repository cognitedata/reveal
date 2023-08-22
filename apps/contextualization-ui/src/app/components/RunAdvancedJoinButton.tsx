import { Button, Tooltip } from '@cognite/cogs.js';

import { NUM_MANUAL_MATCHES_TO_STATISTICALLY_SIGNIFICANT } from '../constants';

export const RunAdvancedJoinButton = ({
  isAdvancedJoinRunnable,
  savedManualMatchesCount,
  handleRunAdvancedJoin,
}: {
  isAdvancedJoinRunnable: boolean;
  savedManualMatchesCount: number;
  handleRunAdvancedJoin: () => void;
}) => {
  const tooltipContent = (
    <>
      {isAdvancedJoinRunnable && (
        <>
          Configure and run an Advanced Join
          <br />
        </>
      )}
      Progress: {savedManualMatchesCount} out of a minimum of{' '}
      {NUM_MANUAL_MATCHES_TO_STATISTICALLY_SIGNIFICANT} manual labels
    </>
  );
  return (
    <Tooltip content={tooltipContent} position="bottom">
      <Button
        icon="Play"
        type="primary"
        disabled={!isAdvancedJoinRunnable}
        style={{
          whiteSpace: 'nowrap',
          textAlign: 'center',
          marginRight: '16px',
        }}
        onClick={handleRunAdvancedJoin}
      >
        Run advanced join
      </Button>
    </Tooltip>
  );
};
