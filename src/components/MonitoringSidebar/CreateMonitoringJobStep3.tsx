import { Button } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { makeDefaultTranslations } from 'utils/translations';
import { SuccessContainer, SuccessIconContainer } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Your monitoring job is succesfully added',
  'View monitoring job'
);

type Props = {
  translations?: typeof defaultTranslations;
  onViewMonitoringJob: () => void;
};
const CreateMonitoringJobStep3 = ({
  translations,
  onViewMonitoringJob,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  return (
    <SuccessContainer>
      <SuccessIconContainer>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 108.047C33.5156 108.047 11.9531 86.4844 11.9531 60C11.9531 33.5156 33.5156 11.9531 60 11.9531C86.4844 11.9531 108.047 33.5156 108.047 60C108.047 86.4844 86.4844 108.047 60 108.047ZM60 14.2969C34.8 14.2969 14.2969 34.8 14.2969 60C14.2969 85.2 34.8 105.703 60 105.703C85.2 105.703 105.703 85.2 105.703 60C105.703 34.8 85.2 14.2969 60 14.2969Z"
            fill="#257B3D"
          />
          <path
            d="M60 18.9844C37.3828 18.9844 18.9844 37.3828 18.9844 60C18.9844 82.6172 37.3828 101.016 60 101.016C82.6172 101.016 101.016 82.6172 101.016 60C101.016 37.3828 82.6172 18.9844 60 18.9844ZM54.6281 77.3203L36.5813 58.8047L42.4406 52.7437L54.5484 65.2711L77.5477 41.4844L83.407 47.5453L54.6281 77.3203Z"
            fill="#6ACE7D"
          />
        </svg>

        <StyledText>{t['Your monitoring job is succesfully added']}</StyledText>
        <StyledButton type="primary" onClick={onViewMonitoringJob}>
          {t['View monitoring job']}
        </StyledButton>
      </SuccessIconContainer>
    </SuccessContainer>
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
