import { Flex, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Canvas } from 'components/canvas';
import { useParams } from 'react-router-dom';
import {
  FlowContextProvider,
  useWorkflowBuilderContext,
} from 'contexts/WorkflowContext';
import { CanvasTopBar } from 'components/canvas-topbar/CanvasTopBar';
import { useCreateFile, useFile } from 'hooks/files';
import { FloatingHistoryPanel } from 'components/floating-history-panel';
import PreviewFeedback from 'components/preview-feedback';
import { useEffect } from 'react';

const Flow = (): JSX.Element => {
  const { externalId } = useParams<{ externalId: string }>();

  const { data, error, isInitialLoading } = useFile(externalId!, { retry: 0 });
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

  if (isInitialLoading || isLoading || !data) {
    return <Loader />;
  }

  return (
    <FlowContextProvider externalId={externalId!} initialFlow={data}>
      <FlowContainer />
    </FlowContextProvider>
  );
};

function FlowContainer() {
  const { isHistoryVisible, previewHash } = useWorkflowBuilderContext();

  return (
    <StyledFlowContainer>
      <CanvasTopBar />
      <Content>
        {previewHash && <PreviewFeedback />}
        {isHistoryVisible && <FloatingHistoryPanel />}
        <Canvas />
      </Content>
    </StyledFlowContainer>
  );
}

const StyledFlowContainer = styled(Flex).attrs({ direction: 'column' })`
  height: 100%;
  width: 100%;
`;

const Content = styled.div`
  flex: 1;
  position: relative;
`;

export default Flow;
