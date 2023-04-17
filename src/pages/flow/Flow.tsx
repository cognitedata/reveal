import { Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Canvas } from 'components/canvas';
import { useParams } from 'react-router-dom';
import {
  FlowContextProvider,
  useWorkflowBuilderContext,
} from 'contexts/WorkflowContext';
import { CanvasTopBar } from 'components/canvas-topbar/CanvasTopBar';
import { FloatingComponentsPanel } from 'components/floating-components-panel/FloatingComponentsPanel';
import { FloatingPlusButton } from 'components/floating-plus-button/FloatingPlusButton';

const Flow = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <>404</>;
  }

  return (
    <FlowContextProvider externalId={id}>
      <FlowContainer />
    </FlowContextProvider>
  );
};

function FlowContainer() {
  const { isComponentsPanelVisible, setIsComponentsPanelVisible } =
    useWorkflowBuilderContext();

  return (
    <StyledFlowContainer>
      <CanvasTopBar />
      <Content>
        {isComponentsPanelVisible ? (
          <FloatingComponentsPanel />
        ) : (
          <FloatingPlusButton
            onClick={() => setIsComponentsPanelVisible(true)}
          />
        )}
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
