import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { WorkflowStep } from 'modules/workflows';
import { useActiveWorkflow } from 'hooks';
import { Flex, PageTitle } from 'components/Common';
import { landingPage, diagramSelection } from 'routes/paths';
import { AppStateContext } from 'context';
import NavigationStickyBottomRow from 'components/NavigationStickyBottomRow';
import { getSelectedDiagramsIds } from 'pages/PageResultsOverview/selectors';
import { getWorkflowItems } from './selectors';
import SectionProgress from './SectionProgress';
import SectionSetup from './SectionSetup';
import SectionResults from './SectionResults';
import SettingsBar from './SettingsBar';

type Props = {
  step: WorkflowStep;
};

export default function PageResultsOverview(props: Props) {
  const { step } = props;
  const history = useHistory();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow(step);

  const { workflow } = useSelector(getWorkflowItems(workflowId));
  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);

  const areDiagramsSelected = Boolean(selectedDiagramsIds?.length);

  const onGoBackHomePage = () => history.push(landingPage.path(tenant));

  useEffect(() => {
    if (!workflow) {
      message.error('Invalid data selections');
      history.push(diagramSelection.path(tenant, String(workflowId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow]);

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
      <SectionResults />
      {areDiagramsSelected && <SettingsBar />}
      <NavigationStickyBottomRow
        step={step}
        next={{ text: 'Done', onClick: onGoBackHomePage }}
      />
    </Flex>
  );
}
