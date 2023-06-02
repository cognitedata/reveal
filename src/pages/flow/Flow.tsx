import { useEffect } from 'react';

import { Colors, Elevations, Flex, Loader } from '@cognite/cogs.js';
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
import { WorkflowWithVersions, useWorkflow } from 'hooks/workflows';
import { NodeConfigurationPanel } from 'components/node-configuration-panel/NodeConfigurationPanel';
import InspectSection from 'components/inspect-section/InspectSection';

const Flow = (): JSX.Element => {
  const { externalId } = useParams<{ externalId: string }>();

  const { data: workflow, isInitialLoading: isInitialLoadingWorkflow } =
    useWorkflow(externalId!);

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
    return <>ERROR: {JSON.stringify(error)}</>;
  }

  if (isInitialLoadingFile || isInitialLoadingWorkflow || isLoading) {
    return <Loader />;
  }

  if (!workflow) {
    return <div>not found</div>;
  }

  if (!file) {
    return <div>not found</div>;
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
  const { focusedProcessNodeId, isHistoryVisible, previewHash } =
    useWorkflowBuilderContext();

  return (
    <StyledFlowContainer>
      <CanvasTopBar workflow={workflow} />
      <Content>
        <CanvasSection>
          <CanvasContainer>
            {previewHash && <PreviewFeedback />}
            {isHistoryVisible && <FloatingHistoryPanel />}
            {focusedProcessNodeId && <NodeConfigurationPanel />}
            <Canvas />
          </CanvasContainer>
        </CanvasSection>
        <InspectSectionContainer>
          <InspectSection workflow={workflow} />
        </InspectSectionContainer>
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
  position: relative;
`;

const CanvasSection = styled.div`
  flex: 1;
  height: 100%;
  padding: 12px 6px 12px 12px;
`;

const CanvasContainer = styled.div`
  position: relative;
  height: 100%;
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  padding: 12px;
`;

const InspectSectionContainer = styled.div`
  padding: 12px 12px 12px 6px;
  width: 600px;
`;

export default Flow;
