import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { Modal } from 'antd';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import styled from 'styled-components';
import { ProcessStepActionButtons } from 'src/pages/Workflow/process/ProcessStepActionButtons';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { createLink } from '@cognite/cdf-utilities';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';

export default function BottomNavContainer() {
  const history = useHistory();

  const files = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );

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
