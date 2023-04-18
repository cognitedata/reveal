import { Colors, Flex, Menu } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { getContainer } from 'utils';
import FlowSaveIndicator from '../../pages/flow/FlowSaveIndicator';
import CanvasTopbarPublishButton from './CanvasTopBarPublishButton';
import CanvasTopBarDiscardChangesButton from './CanvasTopBarDiscardChangesButton';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

export const CanvasTopBar = () => {
  const { flow } = useWorkflowBuilderContext();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  return (
    <Container>
      <SecondaryTopbar
        title={flow.name}
        goBackFallback={createLink(`/${subAppPath}`)}
        extraContent={
          <Flex alignItems="center">
            <Flex>
              <FlowSaveIndicator />
            </Flex>
            <SecondaryTopbar.Divider />
            <Flex gap={10}>
              <CanvasTopBarDiscardChangesButton />
              <CanvasTopbarPublishButton />
            </Flex>
          </Flex>
        }
        optionsDropdownProps={{
          appendTo: getContainer(),
          hideOnSelect: {
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          },
          content: <Menu></Menu>,
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;
