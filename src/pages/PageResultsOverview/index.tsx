import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from 'react-query';
import { message } from 'antd';
import { landingPage, diagramSelection } from 'routes/paths';
import { useActiveWorkflow, useJobStatus, useStartJobs } from 'hooks';
import { getUrlWithQueryParams } from 'utils/config';
import { AppStateContext } from 'context';
import { DiagramsSettingsBar } from 'containers';
import { Flex, PageTitle } from 'components/Common';
import { selectInteractiveDiagrams, WorkflowStep } from 'modules/workflows';
import NavigationStickyBottomRow from 'components/NavigationStickyBottomRow';
import { getWorkflowItems, getSelectedDiagramsIds } from './selectors';
import SectionProgress from './SectionProgress';
import SectionSetup from './SectionSetup';
import SectionResults from './SectionResults';

type Props = {
  step: WorkflowStep;
};

export default function PageResultsOverview(props: Props) {
  const { step } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const client = useQueryClient();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow(step);

  const { workflow } = useSelector(getWorkflowItems(workflowId));
  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);

  const jobStatus = useJobStatus();
  const jobDone = ['done', 'error', 'rejected'];
  const isJobDone = jobDone.includes(jobStatus);

  useStartJobs();

  const areDiagramsSelected = Boolean(selectedDiagramsIds?.length);

  const onGoBackHomePage = () =>
    history.push(getUrlWithQueryParams(landingPage.path(tenant)));
  const onSelectionClose = () => {
    dispatch(selectInteractiveDiagrams({ workflowId, diagramIds: [] }));
  };

  useEffect(() => {
    if (!workflow) {
      message.error('Invalid data selections');
      history.push(
        getUrlWithQueryParams(diagramSelection.path(tenant, String(workflowId)))
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
