import React from 'react';

import { Icon } from '@cognite/cogs.js';
import styled, { keyframes } from 'styled-components';

import {
  ProfileCoverageType,
  ProfileResultType,
} from 'hooks/profiling-service';
import Tooltip from 'components/Tooltip/Tooltip';

type ProfileCoverageLabelProps = {
  coverageType: ProfileCoverageType;
  resultType: ProfileResultType;
};
export const ProfileCoverageLabel = ({
  coverageType,
  resultType,
}: ProfileCoverageLabelProps): JSX.Element => {
  switch (resultType) {
    case 'complete':
      return <StyledLabelComplete>Complete</StyledLabelComplete>;
    case 'running':
      return <StyledLabelRunning>Running</StyledLabelRunning>;
    case 'partial':
      return (
        <Tooltip content="Only the first million rows of data were profiled">
          {coverageType === 'rows' ? (
            <StyledLabelPartial>
              <StyledPartialIcon size={14} type="WarningTriangleFilled" />
              Partial
            </StyledLabelPartial>
          ) : (
            <StyledLabelComplete>Complete</StyledLabelComplete>
          )}
        </Tooltip>
      );
    default:
      return <></>;
  }
};

const StyledLabelBaseWrapper = styled.div`
  align-items: center;
  border-radius: 6px;
  display: flex;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  padding: 0 12px;
`;

const StyledLabelComplete = styled(StyledLabelBaseWrapper)`
  background-color: #39a2631f;
  color: #22633c;
`;

const StyledEllipsisAnimation = keyframes`
  to {
    width: 15px;    
  }
`;

const StyledLabelRunning = styled(StyledLabelBaseWrapper)`
  background-color: #6e85fc1f;
  color: #2b3a88;
  width: 92px;

  ::after {
    overflow: hidden;
    animation: ${StyledEllipsisAnimation} steps(4, end) 1s infinite;
    content: '\2026';
    padding-left: 1px;
    width: 0px;
  }
`;

const StyledLabelPartial = styled(StyledLabelBaseWrapper)`
  background-color: #ffbb001f;
  color: #bb5b00;
`;

const StyledPartialIcon = styled(Icon)`
  color: #bb5b00;
  margin-right: 6px;
`;
