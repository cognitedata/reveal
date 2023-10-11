import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';
import { ErrorIcon } from '../Icons/Error';
import { SuccessIcon } from '../Icons/Success';

import { Step3Container, Step3IconContainer } from './elements';

const defaultTranslation = makeDefaultTranslations(
  'Your monitoring job is successfully added',
  'View monitoring job',
  'Something went wrong',
  'Go back',
  'Try again, or contact support'
);

type Props = {
  hasError: boolean;
  onViewMonitoringJob: () => void;
  onBack: () => void;
};
const CreateMonitoringJobStep3 = ({
  hasError,
  onViewMonitoringJob,
  onBack,
}: Props) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };
  if (hasError) {
    return (
      <Step3Container>
        <Step3IconContainer>
          <ErrorIcon />

          <StyledText>{t['Something went wrong']}</StyledText>

          <div>{t['Try again, or contact support']}</div>

          <StyledButton type="primary" onClick={onBack}>
            {t['Go back']}
          </StyledButton>
        </Step3IconContainer>
      </Step3Container>
    );
  }

  return (
    <Step3Container>
      <Step3IconContainer>
        <SuccessIcon />

        <StyledText>
          {t['Your monitoring job is successfully added']}
        </StyledText>

        <StyledButton type="primary" onClick={onViewMonitoringJob}>
          {t['View monitoring job']}
        </StyledButton>
      </Step3IconContainer>
    </Step3Container>
  );
};

const StyledText = styled.div`
  font-weight: bold;
  font-size: 1.2em;
`;
const StyledButton = styled(Button)`
  margin-top: 1em;
`;

export default CreateMonitoringJobStep3;
