import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { json } from '@codemirror/lang-json';
import { useTranslation } from '@flows/common';
import { BasicPlaceholder } from '@flows/components/basic-placeholder/BasicPlaceholder';
import { useWorkflow } from '@flows/hooks/workflows';
import { getLastWorkflowDefinition } from '@flows/utils/workflows';

import { CodeSnippet } from '@cognite/cdf-utilities';
import { Body, Loader } from '@cognite/cogs.js';

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
      <BasicPlaceholder
        type="EmptyStateFolderSad"
        title={t('error-workflow', { count: 1 })}
      >
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
