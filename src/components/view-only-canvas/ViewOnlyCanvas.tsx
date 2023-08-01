import { json } from '@codemirror/lang-json';
import { CodeSnippet } from '@cognite/cdf-utilities';
import { Body, Loader } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { BasicPlaceholder } from 'components/basic-placeholder/BasicPlaceholder';
import { useWorkflow } from 'hooks/workflows';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getLastWorkflowDefinition } from 'utils/workflows';

const ViewOnlyCanvas = () => {
  const { t } = useTranslation();

  const extensions = useMemo(() => [json()], []);

  const { externalId } = useParams<{ externalId: string }>();

  const {
    data: workflow,
    isInitialLoading: isLoadingWorkflow,
    error,
  } = useWorkflow(externalId!);
  const { workflowDefinition: lastWorkflowDefinition } = useMemo(
    () => getLastWorkflowDefinition(workflow),
    [workflow]
  );

  if (isLoadingWorkflow) return <Loader />;

  if (error)
    return (
      <BasicPlaceholder type="EmptyStateFolderSad" title={t('error-workflow')}>
        <Body level={5}>{JSON.stringify(error)}</Body>
      </BasicPlaceholder>
    );

  return (
    <Container>
      <CodeSnippet
        extensions={extensions}
        value={JSON.stringify(lastWorkflowDefinition?.tasks, undefined, 2)}
      />
    </Container>
  );
};

const Container = styled.div`
  overflow: auto;
  height: 100%;
`;

export default ViewOnlyCanvas;
