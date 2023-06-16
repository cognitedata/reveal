import styled, { keyframes } from 'styled-components';

import { useTranslation } from '@transformations/common';
import { Job } from '@transformations/types';

import { Timestamp } from '@cognite/cdf-utilities';
import { Body, Colors } from '@cognite/cogs.js';

interface JobDateProps {
  status: Job['status'];
  timestamp: number;
}

const JobDate = ({ status, timestamp }: JobDateProps) => {
  const { t } = useTranslation();

  if (status === 'Running') {
    return (
      <StyledContainer>
        <AnimatedEllipsis>
          {t(`transformation-details-sidebar-panel-history-status-running`)}
        </AnimatedEllipsis>
      </StyledContainer>
    );
  }

  if (status === 'Created') {
    return (
      <StyledContainer>
        {t(`transformation-details-sidebar-panel-history-status-created`)}
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Timestamp absolute timestamp={timestamp} />
    </StyledContainer>
  );
};

const StyledContainer = styled(Body).attrs({
  level: 3,
  strong: true,
})`
  color: ${Colors['text-icon--strong']};
`;

const styledEllipsisAnimation = keyframes`
  to {
    width: 25px;
  }
`;

const AnimatedEllipsis = styled.div`
  ::after {
    vertical-align: bottom;
    display: inline-block;
    overflow: hidden;
    animation: ${styledEllipsisAnimation} steps(4, end) 1s infinite;
    content: '\2026';
    padding-left: 1px;
    width: 0px;
  }
`;

export default JobDate;
