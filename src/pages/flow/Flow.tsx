import { Flex, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Canvas } from 'components/canvas';
import { useParams } from 'react-router-dom';
import {
  FlowContextProvider,
  useWorkflowBuilderContext,
} from 'contexts/WorkflowContext';
import { CanvasTopBar } from 'components/canvas-topbar/CanvasTopBar';
import { useFlow } from 'hooks/files';
import { NodeConfigurationPanel } from 'components/node-configuration-panel/NodeConfigurationPanel';
import { FloatingHistoryPanel } from 'components/floating-history-panel';
import PreviewFeedback from 'components/preview-feedback';

const Flow = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, error, isInitialLoading } = useFlow(id!, { enabled: !!id });

  if (error) {
    return <>ERROR: {JSON.stringify(error)}</>;
  }

  if (isInitialLoading) {
    return <Loader />;
  }

  if (!data || !id) {
    return <>wtf?</>;
  }

  return (
    <FlowContextProvider externalId={id} initialFlow={data}>
      <FlowContainer />
    </FlowContextProvider>
  );
};

function FlowContainer() {
  const { isHistoryVisible, previewHash, isNodeConfigurationPanelOpen, } = useWorkflowBuilderContext();

  return (
    <StyledFlowContainer>
      <CanvasTopBar />

      <Content>
        {previewHash && <PreviewFeedback />}
        {isHistoryVisible && <FloatingHistoryPanel />}
        <Canvas />
        {isNodeConfigurationPanelOpen && <NodeConfigurationPanel />}
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
