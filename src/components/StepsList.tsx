import React from 'react';
import { generatePath } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import 'antd/dist/antd.css';
import { WorkflowStep } from 'modules/workflows';
import { Flex as BaseFlex, Steps, StepsType } from 'components/Common';
import routesMap, { PathData } from 'routes/routesMap';

const Flex = styled(BaseFlex)`
  margin-bottom: 40px;
  padding-bottom: 30px;
  height: 20px;
`;

/** Leaving this to readd it later */
// type RouteFunction = (keys: { [key: string]: string }) => React.ReactNode[];

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
  const routes = routesMap();

  const stepList: StepsType[] = routes.map((route: PathData) => {
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
  return (
    <Flex row style={{ margin: '24px 0 12px 0' }}>
      <Steps steps={stepList} current={currentStep} />
    </Flex>
  );
}
