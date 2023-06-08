import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Flex, PageTitle } from '@interactive-diagrams-app/components/Common';
import NavigationStickyBottomRow from '@interactive-diagrams-app/components/NavigationStickyBottomRow';
import { DiagramsSettingsBar } from '@interactive-diagrams-app/containers';
import {
  useActiveWorkflow,
  useJobStatus,
  useStartJobs,
} from '@interactive-diagrams-app/hooks';
import {
  selectInteractiveDiagrams,
  WorkflowStep,
} from '@interactive-diagrams-app/modules/workflows';
import {
  landingPage,
  diagramSelection,
} from '@interactive-diagrams-app/routes/paths';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getUrlWithQueryParams } from '@interactive-diagrams-app/utils/config';

import SectionProgress from './SectionProgress';
import SectionResults from './SectionResults';
import SectionSetup from './SectionSetup';
import { getWorkflowItems, getSelectedDiagramsIds } from './selectors';

type Props = {
  step: WorkflowStep;
};

export default function PageResultsOverview(props: Props) {
  const { step } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const client = useQueryClient();
  const { workflowId } = useActiveWorkflow(step);

  const { workflow } = useSelector(getWorkflowItems(workflowId));
  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);

  const jobStatus = useJobStatus();
  const jobDone = ['done', 'error', 'rejected'];
  const isJobDone = jobDone.includes(jobStatus);

  useStartJobs();

  const areDiagramsSelected = Boolean(selectedDiagramsIds?.length);

  const onGoBackHomePage = () =>
    history.push(getUrlWithQueryParams(landingPage.path()));
  const onSelectionClose = () => {
    dispatch(selectInteractiveDiagrams({ workflowId, diagramIds: [] }));
  };

  useEffect(() => {
    if (!workflow) {
      message.error('Invalid data selections');
      history.push(
        getUrlWithQueryParams(diagramSelection.path(String(workflowId)))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow]);

  useEffect(() => {
    const invalidate = () => {
      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'files',
        'get',
        'byId',
      ]);
    };
    if (isJobDone) invalidate();
  }, [client, isJobDone]);

  return (
    <Flex column style={{ width: '100%', position: 'relative' }}>
      <PageTitle title="Run the model" />
      <Flex
        row
        style={{
          width: '100%',
          margin: '24px 0 16px 0',
          justifyContent: 'space-between',
        }}
      >
        <SectionSetup />
        <SectionProgress />
      </Flex>
      <Flex row style={{ width: '100%', marginBottom: '32px' }}>
        <SectionResults />
      </Flex>
      {areDiagramsSelected && (
        <DiagramsSettingsBar
          selectedDiagramsIds={selectedDiagramsIds}
          buttons={['reject', 'approve', 'preview', 'svgSave']}
          primarySetting="svgSave"
          onClose={onSelectionClose}
        />
      )}
      <NavigationStickyBottomRow
        step={step}
        next={{ disabled: !isJobDone, text: 'Done', onClick: onGoBackHomePage }}
      />
    </Flex>
  );
}
