import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import styled from 'styled-components';
import { ProcessStepActionButtons } from 'src/pages/Workflow/process/ProcessStepActionButtons';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { annotationsById } from 'src/store/previewSlice';

export default function BottomNavContainer() {
  const history = useHistory();
  const { allFilesStatus } = useSelector(
    (state: RootState) => state.uploadedFiles
  );

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });

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
                disabled: !allFilesStatus,
                title: !allFilesStatus ? 'Upload files to proceed' : '',
                onClick() {
                  history.push(getLink(workflowRoutes.process));
                },
              }}
              skipBtnProps={{
                disabled: !allFilesStatus || !!Object.keys(annotations).length,
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
