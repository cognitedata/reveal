import React from 'react';
import { generatePath } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import 'antd/dist/antd.css';
import { WorkflowStep } from 'modules/workflows';
import { Steps, StepsType } from 'components/Common';
import { PathData, stepsMap } from 'routes/routesMap';

export default function StepsList() {
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
    const path = generatePath(route.staticPath, {
      tenant,
      workflowId,
      fileId,
    });
    const workflowStep: WorkflowStep | undefined =
      route.workflowStepName ?? undefined;
    return {
      path,
      title,
      workflowStep,
    };
  });
  const currentStep = stepList.findIndex(
    (step: StepsType) => step.path === location.pathname
  );

  if (!stepList.length) {
    return <span />;
  }
  if (currentStep === -1) {
    return <></>;
  }
  return <Steps steps={stepList} current={currentStep} />;
}
