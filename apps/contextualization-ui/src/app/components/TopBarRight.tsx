import styled from 'styled-components';

import { Button, Divider, Tooltip, TopBar } from '@cognite/cogs.js';

import { RunAdvancedJoinButton } from './RunAdvancedJoinButton';

export const TopBarRight = ({
  runStage,
  isAdvancedJoinRunnable,
  savedManualMatchesCount,
  handleRunAdvancedJoin,
}: {
  runStage: boolean;
  isAdvancedJoinRunnable: boolean;
  savedManualMatchesCount: number;
  handleRunAdvancedJoin: () => void;
}) => {
  return (
    <StyledTopBarRight>
      {!runStage && (
        <RunAdvancedJoinButton
          isAdvancedJoinRunnable={isAdvancedJoinRunnable}
          savedManualMatchesCount={savedManualMatchesCount}
          handleRunAdvancedJoin={handleRunAdvancedJoin}
        />
      )}
      <Divider direction="vertical" />
      <Tooltip position="bottom" content="Documentation">
        <StyledButton
          icon="Documentation"
          aria-label="Documentation"
          onClick={() => {
            window.open(
              'https://cognitedata.atlassian.net/wiki/spaces/CON/pages/3916234764/Cycle+Bet+Proposal+-+C2304+Advanced+join+-+Contextualization+score',
              '_blank'
            );
          }}
        />
      </Tooltip>
      <Tooltip position="bottom" content="Feedback">
        <StyledButton
          icon="Feedback"
          aria-label="Feedback"
          onClick={() => {
            window.open('https://hub.cognite.com/', '_blank');
          }}
        />
      </Tooltip>
    </StyledTopBarRight>
  );
};

export const StyledButton = styled(Button)`
  && {
    background: transparent;
  }
`;

export const StyledTopBarRight = styled(TopBar.Right)`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 12px;
`;
