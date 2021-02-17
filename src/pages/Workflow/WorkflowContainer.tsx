import React from 'react';
import { LazyWrapper } from 'src/components/LazyWrapper';
import {
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
} from 'react-router-dom';
import { Steps } from 'antd';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import styled from 'styled-components';
import { ProcessStepActionButtons } from 'src/pages/Workflow/process/ProcessStepActionButtons';
import {
  getLink,
  workflowRoutes,
  WorkflowStepKey,
} from 'src/pages/Workflow/workflowRoutes';

const { Step } = Steps;

const UploadStep = (props: RouteComponentProps) =>
  LazyWrapper(props, () => import('src/pages/Workflow/upload/UploadStep'));

// tried to use memo to avoid remount of this component between steps, but without success...
const ProcessAndReviewStep = (props: RouteComponentProps) =>
  LazyWrapper(props, () => import('src/pages/Workflow/process/ProcessStep'));

function getStepNumberByStepName(stepName: WorkflowStepKey) {
  if (stepName === 'review') {
    return 2;
  }
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
        <Steps current={getStepNumberByStepName(props.match.params.step)}>
          <Step title="Upload" />
          <Step title="Process" />
          <Step title="Review" />
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
              path={[workflowRoutes.process, workflowRoutes.review]}
              exact
              component={ProcessAndReviewStep}
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
                onPrevClicked={() => {
                  console.info('Exit...');
                  // history.push(createLink('/explore/search/file'));
                }}
                onNextClicked={() =>
                  history.push(getLink(workflowRoutes.process))
                }
              />
            )}
          />

          <Route
            key="process-step"
            path={workflowRoutes.process}
            exact
            component={ProcessStepActionButtons}
          />

          <Route
            key="review-step"
            path={workflowRoutes.review}
            exact
            component={() => (
              <PrevNextNav
                onPrevClicked={() =>
                  history.push(getLink(workflowRoutes.process))
                }
                onNextClicked={() => {
                  console.info('Complete...');
                  // history.push(createLink('/explore/search/file'));
                }}
                titleNext="Complete"
              />
            )}
          />
        </Switch>
      </BottomNavContainer>
    </VerticalContainer>
  );
}

const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MainContent = styled(VerticalContainer)`
  min-width: 900px; /* totally random, but mocks have one size for now */

  overflow: auto;

  /* the same padding is used in SubAppWrapper but it's disabled to make bottom nav looking right */
  padding: 20px;
  @media (min-width: 992px) {
    padding: 20px 50px;
  }
`;

const StepContent = styled.div`
  padding-top: 20px;
  flex-grow: 1;
`;

const BottomNavContainer = styled.div`
  position: sticky;
  bottom: 0;
`;
