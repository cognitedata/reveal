import styled from 'styled-components';

import {
  Body,
  Button,
  Flex,
  Popconfirm,
  Tooltip,
  TopBar,
} from '@cognite/cogs.js';

export const TopBarLeft = ({
  confirmedBack,
  noUnsavedManualMatches,
  handleBackButton,
  runStage,
}: {
  confirmedBack: () => void;
  noUnsavedManualMatches: boolean | undefined;
  handleBackButton: () => void;
  runStage: boolean;
}) => {
  return (
    <StyledTopBarLeft>
      <StyledFlex alignItems="center">
        <Tooltip
          position="right"
          content={
            runStage
              ? 'Go back to Manual Match'
              : 'Go back to data model list page'
          }
        >
          <Popconfirm
            onConfirm={confirmedBack}
            okText="Proceed"
            disabled={runStage || noUnsavedManualMatches}
            content="Unsaved Matches Detected. Proceed Anyway?"
          >
            <StyledTitleButton
              type="secondary"
              icon="ArrowLeft"
              iconPlacement="left"
              aria-label="Go Back to data model"
              onClick={handleBackButton}
              data-cy="back-to-all-models-btn"
            />
          </Popconfirm>
        </Tooltip>
        <StyledTitle level="1" strong>
          Advanced Join
        </StyledTitle>
      </StyledFlex>
    </StyledTopBarLeft>
  );
};

export const StyledFlex = styled(Flex)`
  padding: 0 10px;
`;

export const StyledTitle = styled(Body)`
  && {
    color: var(--cogs-text-icon--medium);
    margin-left: 10px;
    user-select: text;
  }
`;

export const StyledTitleButton = styled(Button)`
  && {
    width: 36px;
    height: 36px;
    padding: 10px !important;
  }
`;

export const StyledTopBarLeft = styled(TopBar.Left)`
  display: flex;
  align-items: center;
  padding-right: 10px;
`;
