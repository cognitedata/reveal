import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import 'antd/dist/antd.min.css';
import { WorkflowStep } from '@interactive-diagrams-app/modules/workflows';
import { PathData, stepsMap } from '@interactive-diagrams-app/routes/routesMap';
import { Steps } from './Steps';
import { StepsType } from './types';

export const StepsList = () => {
  const location = useLocation();
  const {
    project = 'unknown',
    workflowId = 'unknown',
    fileId = 'unknown',
  } = useParams<{
    project?: string;
    workflowId?: string;
    fileId?: string;
  }>();
  const steps = stepsMap();

  const stepList: StepsType[] = steps.map((route: PathData) => {
    const { title } = route;
    const path = route.path(workflowId, fileId);

    const workflowStep: WorkflowStep | undefined =
      route.workflowStepName ?? undefined;
    const substeps = route.substeps
      ? route.substeps.map((substep) => ({
          path: substep.path(workflowId, fileId),
          title: substep.title,
          workflowStep: substep.workflowStepName ?? undefined,
        }))
      : undefined;
    return {
      path,
      title,
      workflowStep,
      substeps,
    };
  });

  const currentStep = stepList.findIndex((step: StepsType) => {
    const isCurrentStep = `/${project}${step.path}` === location.pathname;
    const isCurrentSubstep = step.substeps?.find(
      (substep) => `/${project}${substep.path}` === location.pathname
    );
    return isCurrentStep || isCurrentSubstep;
  });

  if (currentStep === -1) {
    return <span />;
  }
  return <Steps steps={stepList} current={currentStep} small />;
};
