import React, { useEffect } from 'react';
import { LazyWrapper } from 'src/components/LazyWrapper';
import { Route, RouteComponentProps, Switch, Link } from 'react-router-dom';
import { Steps as AntdSteps } from 'antd';
import styled from 'styled-components';
import {
  getLink,
  workflowRoutes,
  WorkflowStepKey,
} from 'src/pages/Workflow/workflowRoutes';
import { VerticalContainer } from 'src/components/VerticalContainer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { FileMetadataPreview } from 'src/pages/Workflow/process/FileMetadataPreview';
import { QueryClient, QueryClientProvider } from 'react-query';
import { toggleFileMetadataPreview } from 'src/store/processSlice';
import BottomNavContainer from './BottomNavContainer';

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
  const dispatch = useDispatch();

  const showDrawer = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadataDrawer
  );

  useEffect(() => {
    if (showDrawer) {
      dispatch(toggleFileMetadataPreview());
    }
  }, [props.match.params.step]);

  const queryClient = new QueryClient();

  return (
    <VerticalContainer>
      <MainContent>
        <StepContainer>
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
        </StepContainer>
        {showDrawer && (
          <DrawerContainer>
            <QueryClientProvider client={queryClient}>
              <FileMetadataPreview />
            </QueryClientProvider>
          </DrawerContainer>
        )}
      </MainContent>

      <BottomNavContainer />
    </VerticalContainer>
  );
}

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: auto;
`;

const StepContainer = styled.div`
  flex: 1;
  min-width: 900px; /* totally random, but mocks have one size for now */

  /* the same padding is used in SubAppWrapper but it's disabled to make bottom nav looking right */
  padding: 20px;
  @media (min-width: 992px) {
    padding: 20px 50px;
  }
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: auto;
  box-sizing: content-box;
`;

const DrawerContainer = styled.div`
  width: 400px;
  border: 1px solid #d9d9d9;
  box-sizing: content-box;
  height: max-content;
  flex-shrink: 0;
`;

const Steps = styled(AntdSteps)`
  padding-bottom: 16px;
  max-width: 500px;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  padding-top: 20px;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
`;
