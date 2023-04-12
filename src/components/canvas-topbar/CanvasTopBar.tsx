import { Flex, Menu } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import { getContainer } from 'utils';
import { Flow } from 'types';
import FlowSaveIndicator from '../../pages/flow/FlowSaveIndicator';
import CanvasTopbarPublishButton from './CanvasTopBarPublishButton';
import CanvasTopBarDiscardChangesButton from './CanvasTopBarDiscardChangesButton';

export const CanvasTopBar = ({ flow }: { flow: Flow }) => {
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  return (
    <>
      <SecondaryTopbar
        title={flow?.name}
        goBackFallback={createLink(`/${subAppPath}`)}
        extraContent={
          <Flex alignItems="center">
            <Flex>
              <FlowSaveIndicator flowId={flow.id} />
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
    </>
  );
};
