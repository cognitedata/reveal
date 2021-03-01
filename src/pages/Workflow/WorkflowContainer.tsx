import React from 'react';
import { LazyWrapper } from 'src/components/LazyWrapper';
import {
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
  Link,
} from 'react-router-dom';
import { Steps as AntdSteps } from 'antd';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import styled from 'styled-components';
import { ProcessStepActionButtons } from 'src/pages/Workflow/process/ProcessStepActionButtons';
import {
  getLink,
  workflowRoutes,
  WorkflowStepKey,
} from 'src/pages/Workflow/workflowRoutes';
import { VerticalContainer } from 'src/components/VerticalContainer';

const { Step } = AntdSteps;

const UploadStep = (props: RouteComponentProps) =>
  LazyWrapper(props, () => import('src/pages/Workflow/upload/UploadStep'));

const ProcessStep = (props: RouteComponentProps) =>
  LazyWrapper(props, () => import('src/pages/Workflow/process/ProcessStep'));

function getStepNumberByStepName(stepName: WorkflowStepKey) {
  if (stepName === 'process') {
    return 1;
  }
  return 0;
}

type WorkflowContainerProps = RouteComponentProps<{ step: WorkflowStepKey }>;

export default function WorkflowContainer(props: WorkflowContainerProps) {
  const history = useHistory();

  return (
    <VerticalContainer>
      <MainContent>
        <Steps
          current={getStepNumberByStepName(props.match.params.step)}
          style={{ paddingBottom: 16 }}
        >
          <Step
            title={
              <Link
                to={getLink(workflowRoutes.upload)}
                style={{ color: 'inherit' }}
              >
                Upload
              </Link>
            }
          />
          <Step title="Process & Review" />
        </Steps>

        <StepContent>
          <Switch>
            <Route
              key={workflowRoutes.upload}
              path={workflowRoutes.upload}
              exact
              component={UploadStep}
            />
            <Route
              key="process-and-review"
              path={workflowRoutes.process}
              exact
              component={ProcessStep}
            />
          </Switch>
        </StepContent>
      </MainContent>

      <BottomNavContainer className="z-4">
        <Switch>
          <Route
            key="upload-step"
            path={workflowRoutes.upload}
            exact
            component={() => (
              <PrevNextNav
                prevBtnProps={{
                  onClick() {
                    history.goBack();
                  },
                }}
                nextBtnProps={{
                  onClick() {
                    history.push(getLink(workflowRoutes.process));
                  },
                }}
              />
            )}
          />

          <Route
            key="process-step"
            path={workflowRoutes.process}
            exact
            component={ProcessStepActionButtons}
          />
        </Switch>
      </BottomNavContainer>
    </VerticalContainer>
  );
}

const MainContent = styled(VerticalContainer)`
  min-width: 900px; /* totally random, but mocks have one size for now */

  overflow: auto;

  /* the same padding is used in SubAppWrapper but it's disabled to make bottom nav looking right */
  padding: 20px;
  @media (min-width: 992px) {
    padding: 20px 50px;
  }
`;

const Steps = styled(AntdSteps)`
  padding-bottom: 16px;
  max-width: 500px;
`;

const StepContent = styled.div`
  padding-top: 20px;
  flex-grow: 1;
`;

const BottomNavContainer = styled.div`
  position: sticky;
  bottom: 0;
`;
