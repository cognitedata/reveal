import React from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { useCurrentStep } from '../../../../hooks';
import { getUrlWithQueryParams } from '../../../../utils/config';
import { PNID_METRICS, trackUsage } from '../../../../utils/Metrics';
import { Flex } from '../../atoms';

import { StepsType, StyledStepProps } from './types';

type Props = { substeps?: StepsType[] };

export const StepCombo = (props: Props): JSX.Element => {
  const { substeps } = props;
  const currentStep = useCurrentStep();

  const onSubStepClick = (substep: StepsType) => {
    if (substep.workflowStep)
      trackUsage(PNID_METRICS.navigation.stepsWizard, {
        step: substep.workflowStep,
      });
  };

  return (
    <SubstepWrapper>
      {substeps?.map((substep) => (
        <Substep
          key={`substep-${substep.workflowStep}`}
          align
          onClick={(e) => e.preventDefault()}
          isCurrent={substep.workflowStep === currentStep}
        >
          <Link
            to={getUrlWithQueryParams(substep.path)}
            onClick={() => onSubStepClick(substep)}
            data-cy="create-interactive-diagrams-sub-step-title"
          >
            <Flex
              row
              style={{ width: '100%', height: '100%' }}
              data-cy="create-interactive-diagrams-sub-step-title"
            >
              {substep.title}
            </Flex>
          </Link>
        </Substep>
      ))}
    </SubstepWrapper>
  );
};

const Substep = styled(Flex)<StyledStepProps>`
  justify-content: flex-start;
  padding: 8px;
  background-color: ${({ isCurrent }) => (isCurrent ? '#e8eaef' : 'none')};
  border-radius: 8px;
  width: 100%;
  height: 100%;

  & > * {
    width: 100%;
  }
`;

const SubstepWrapper = styled.div`
  display: block;
  width: 100%;
  margin-top: 8px;
`;
