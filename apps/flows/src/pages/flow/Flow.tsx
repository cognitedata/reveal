import { useEffect, useMemo } from 'react';

import { Body, Colors, Elevations, Flex, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { Canvas } from 'components/canvas';
import {
  FlowContextProvider,
  useWorkflowBuilderContext,
} from 'contexts/WorkflowContext';
import { CanvasTopBar } from 'components/canvas-topbar/CanvasTopBar';
import { useCreateFile, useFile } from 'hooks/files';
import { FloatingHistoryPanel } from 'components/floating-history-panel';
import PreviewFeedback from 'components/preview-feedback';
import { useWorkflow } from 'hooks/workflows';
import { NodeConfigurationPanel } from 'components/node-configuration-panel/NodeConfigurationPanel';
import { RunHistorySection } from 'components/run-history-section/RunHistorySection';
import RunCanvas from 'components/run-canvas/RunCanvas';
import { WorkflowWithVersions } from 'types/workflows';
import { getLastWorkflowDefinition, isCanvasEmpty } from 'utils/workflows';
import ViewOnlyCanvas from 'components/view-only-canvas/ViewOnlyCanvas';
import { BasicPlaceholder } from 'components/basic-placeholder/BasicPlaceholder';
import { useTranslation } from 'common';

const Flow = (): JSX.Element => {
  const { externalId } = useParams<{ externalId: string }>();
  const { t } = useTranslation();

  const {
    data: workflow,
    isInitialLoading: isInitialLoadingWorkflow,
    error: errorWorkflow,
  } = useWorkflow(externalId!);

  const {
    data: file,
    error,
    isInitialLoading: isInitialLoadingFile,
  } = useFile(externalId!, {
    enabled: !!workflow,
    retry: 0,
  });
  const { mutate: createFile, isIdle, isLoading } = useCreateFile();

  const isMissingError =
    (error?.missing?.[0] as any | undefined)?.externalId === externalId;

  useEffect(() => {
    {
      if (isMissingError && isIdle) {
        createFile({
          id: externalId!,
          name: externalId!,
          description: '',
          canvas: {
            nodes: [] as any, // FIXME: any
            edges: [] as any, // FIXME: any
          },
        });
      }
    }
  }, [createFile, externalId, isIdle, isMissingError]);

  if (error && !isMissingError) {
    return (
      <BasicPlaceholder
        type="EmptyStateFolderSad"
        title={t('error-canvas-state')}
      >
        <Body level={5}>{JSON.stringify(error)}</Body>
      </BasicPlaceholder>
    );
  }

  if (isInitialLoadingFile || isInitialLoadingWorkflow || isLoading) {
    return <Loader />;
  }

  if (errorWorkflow || !workflow) {
    return (
      <BasicPlaceholder
        type="EmptyStateFolderSad"
        title={t('error-workflow', { count: 1 })}
      >
        <Body level={5}>{JSON.stringify(errorWorkflow)}</Body>
      </BasicPlaceholder>
    );
  }

  if (!file) {
    return (
      <BasicPlaceholder
        type="EmptyStateFileSad"
        title={t('error-missing-file')}
      />
    );
  }

  return (
    <FlowContextProvider externalId={externalId!} initialFlow={file}>
      <FlowContainer workflow={workflow} />
    </FlowContextProvider>
  );
};

type FlowContainerProps = {
  workflow: WorkflowWithVersions;
};

function FlowContainer({ workflow }: FlowContainerProps) {
  const {
    activeViewMode,
    focusedProcessNodeId,
    isHistoryVisible,
    previewHash,
  } = useWorkflowBuilderContext();

  const { flow } = useWorkflowBuilderContext();

  const { workflowDefinition: lastWorkflowDefinition } = useMemo(
    () => getLastWorkflowDefinition(workflow),
    [workflow]
  );

  const viewOnly = isCanvasEmpty(flow) && !!lastWorkflowDefinition;

  return (
    <StyledFlowContainer>
      <CanvasTopBar workflow={workflow} />
      <Content>
        {activeViewMode === 'edit' ? (
          <CanvasSection>
            {previewHash && <PreviewFeedback />}
            {isHistoryVisible && <FloatingHistoryPanel />}
            {focusedProcessNodeId && <NodeConfigurationPanel />}
            {viewOnly ? <ViewOnlyCanvas /> : <Canvas />}
          </CanvasSection>
        ) : (
          <>
            <RunCanvasSection>
              <RunCanvas />
            </RunCanvasSection>
            <RunHistorySectionContainer>
              <RunHistorySection workflow={workflow} />
            </RunHistorySectionContainer>
          </>
        )}
      </Content>
    </StyledFlowContainer>
  );
}

const StyledFlowContainer = styled(Flex).attrs({ direction: 'column' })`
  height: 100%;
  width: 100%;
`;

const Content = styled.div`
  background-color: ${Colors['surface--strong']};
  display: flex;
  flex: 1;
  height: calc(100% - 57px);
  gap: 12px;
  padding: 12px;
  position: relative;
`;

const CanvasSection = styled.div`
  position: relative;
  height: 100%;
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  flex: 1;
  padding: 12px;
`;

const RunCanvasSection = styled.div`
  position: relative;
  height: 100%;
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  flex: 1;
  padding: 12px;
`;

const RunHistorySectionContainer = styled.div`
  position: relative;
  height: 100%;
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  width: 600px;
  padding: 12px;
  display: flex;
  flex-direction: column;
`;

export default Flow;
