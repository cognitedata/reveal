import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import 'antd/dist/antd.css';
import { WorkflowStep } from 'modules/workflows';
import { PathData, stepsMap } from 'routes/routesMap';
import { Steps } from './Steps';
import { StepsType } from './types';

export const StepsList = () => {
  const location = useLocation();
  const {
    tenant = 'unknown',
    workflowId = 'unknown',
    fileId = 'unknown',
  } = useParams<{
    tenant?: string;
    workflowId?: string;
    fileId?: string;
  }>();
  const steps = stepsMap();

  const stepList: StepsType[] = steps.map((route: PathData) => {
    const { title } = route;
    const path = route.path(tenant, workflowId, fileId);

    const workflowStep: WorkflowStep | undefined =
      route.workflowStepName ?? undefined;
    const substeps = route.substeps
      ? route.substeps.map((substep) => ({
          path: substep.path(tenant, workflowId, fileId),
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
    const isCurrentStep = `/${tenant}${step.path}` === location.pathname;
    const isCurrentSubstep = step.substeps?.find(
      (substep) => `/${tenant}${substep.path}` === location.pathname
    );
    return isCurrentStep || isCurrentSubstep;
  });

  if (currentStep === -1) {
    return <span />;
  }
  return <Steps steps={stepList} current={currentStep} small />;
};
