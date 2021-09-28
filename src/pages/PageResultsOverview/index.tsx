import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQueryClient } from 'react-query';
import { message } from 'antd';
import { landingPage, diagramSelection } from 'routes/paths';
import { useActiveWorkflow } from 'hooks';
import { AppStateContext } from 'context';
import { DiagramsSettingsBar } from 'containers';
import { Flex, PageTitle } from 'components/Common';
import NavigationStickyBottomRow from 'components/NavigationStickyBottomRow';
import { WorkflowStep } from 'modules/workflows';
import { useParsingJob } from 'modules/contextualization/pnidParsing';
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
  const client = useQueryClient();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow(step);

  const { workflow } = useSelector(getWorkflowItems(workflowId));
  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);

  const { status: parsingJobStatus } = useParsingJob(workflowId);
  const isJobDone =
    parsingJobStatus === 'Completed' || parsingJobStatus === 'Failed';

  const areDiagramsSelected = Boolean(selectedDiagramsIds?.length);

  const onGoBackHomePage = () => history.push(landingPage.path(tenant));

  useEffect(() => {
    if (!workflow) {
      message.error('Invalid data selections');
      history.push(diagramSelection.path(tenant, String(workflowId)));
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
        />
      )}
      <NavigationStickyBottomRow
        step={step}
        next={{ disabled: !isJobDone, text: 'Done', onClick: onGoBackHomePage }}
      />
    </Flex>
  );
}
