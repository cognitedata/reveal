import React from 'react';
import styled from 'styled-components';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { Link, Flex } from 'components/Common';
import { useCurrentStep } from 'hooks';
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
          align
          onClick={(e) => e.preventDefault()}
          isCurrent={substep.workflowStep === currentStep}
        >
          <Link to={substep.path} onClick={() => onSubStepClick(substep)}>
            <Flex row style={{ width: '100%', height: '100%' }}>
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
