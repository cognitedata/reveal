import React from 'react';

import styled, { keyframes } from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import Tooltip from '@raw-explorer/components/Tooltip/Tooltip';
import {
  FULL_PROFILE_LIMIT,
  ProfileCoverageType,
  ProfileResultType,
} from '@raw-explorer/hooks/profiling-service';

import { Icon } from '@cognite/cogs.js';

type ProfileCoverageLabelProps = {
  coverageType: ProfileCoverageType;
  resultType: ProfileResultType;
  nrOfProfiledRows?: number;
};
export const ProfileCoverageLabel = ({
  coverageType,
  resultType,
  nrOfProfiledRows,
}: ProfileCoverageLabelProps): JSX.Element => {
  const { t } = useTranslation();

  switch (resultType) {
    case 'running':
      return (
        <StyledLabelRunning>
          {t('profile-coverage-label-running')}
        </StyledLabelRunning>
      );
    case 'partial':
      // eslint-disable-next-line no-case-declarations
      const nrOfRows =
        nrOfProfiledRows && nrOfProfiledRows < FULL_PROFILE_LIMIT
          ? nrOfProfiledRows
          : t('million');
      return (
        <Tooltip
          content={t('profile-coverage-label-partial-tooltip', {
            amount: nrOfRows,
          })}
        >
          {coverageType === 'rows' ? (
            <StyledLabelPartial>
              <StyledPartialIcon size={14} type="WarningTriangleFilled" />
              {t('profile-coverage-label-partial-text')}
            </StyledLabelPartial>
          ) : (
            <></>
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
