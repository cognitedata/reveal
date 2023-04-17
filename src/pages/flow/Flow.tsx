import { Flex, Icon } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { Canvas } from 'components/canvas';
import { FloatingPlusButton } from 'components/floating-plus-button/FloatingPlusButton';
import { useFlow, useInsertFlow } from 'hooks/raw';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { FloatingComponentsPanel } from 'components/floating-components-panel/FloatingComponentsPanel';
import { CanvasTopBar } from 'components/canvas-topbar/CanvasTopBar';

const Flow = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFlow(id!, { enabled: !!id });
  const { mutate } = useInsertFlow();
  const onChange = debounce(mutate, 100);

  const { isComponentsPanelVisible, setIsComponentsPanelVisible } =
    useWorkflowBuilderContext();

  if (isLoading) {
    return <Icon type="Loader" />;
  }
  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }
  if (!id || !data) {
    return <>404</>;
  }

  return (
    <FlowContainer>
      <CanvasTopBar flow={data} />
      <Content>
        {isComponentsPanelVisible ? (
          <FloatingComponentsPanel />
        ) : (
          <FloatingPlusButton
            onClick={() => setIsComponentsPanelVisible(true)}
          />
        )}
        <Canvas flow={data} onChange={onChange} />
      </Content>
    </FlowContainer>
  );
};

const FlowContainer = styled(Flex).attrs({ direction: 'column' })`
  height: 100%;
  width: 100%;
`;

const Content = styled.div`
  flex: 1;
  position: relative;
`;

export default Flow;
