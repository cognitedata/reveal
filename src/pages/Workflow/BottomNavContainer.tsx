import React, { useEffect } from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
} from 'react-router-dom';
import { Modal } from 'antd';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import styled from 'styled-components';
import { ProcessStepActionButtons } from 'src/pages/Workflow/process/ProcessStepActionButtons';
import {
  getLink,
  workflowRoutes,
  WorkflowStepKey,
} from 'src/pages/Workflow/workflowRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { toggleFileMetadataPreview } from 'src/store/processSlice';
import { createLink } from '@cognite/cdf-utilities';

type WorkflowContainerProps = RouteComponentProps<{ step: WorkflowStepKey }>;

export default function BottomNavContainer(props: WorkflowContainerProps) {
  const history = useHistory();
  const dispatch = useDispatch();

  const showDrawer = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadataDrawer
  );

  const files = useSelector(
    ({ uploadedFiles }: RootState) => uploadedFiles.uploadedFiles
  );

  useEffect(() => {
    if (showDrawer) {
      dispatch(toggleFileMetadataPreview());
    }
  }, [props.match.params.step]);

  return (
    <Container className="z-4">
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
                disabled: !files.length,
                onClick() {
                  history.push(getLink(workflowRoutes.process));
                },
              }}
              skipBtnProps={{
                disabled: !files.length,
                onClick() {
                  Modal.confirm({
                    title: 'Just so you know',
                    content:
                      'By skipping processing you will be taken back to the home page. Your files are uploaded to Cognite Data Fusion and can be processed later.',
                    onOk: () => {
                      history.push(createLink('/explore/search/file'));
                    },
                  });
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
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
`;
