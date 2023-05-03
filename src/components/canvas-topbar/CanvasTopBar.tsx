import { Colors, Flex, Menu } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { getContainer } from 'utils';
import { useTranslation } from 'common';
import FlowSaveIndicator from '../../pages/flow/FlowSaveIndicator';
import CanvasTopbarPublishButton from './CanvasTopBarPublishButton';
import CanvasTopBarDiscardChangesButton from './CanvasTopBarDiscardChangesButton';
import { toPng } from 'html-to-image';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useState } from 'react';
import WorkflowModal from 'components/workflow-modal/WorkflowModal';

export const CanvasTopBar = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { flow } = useWorkflowBuilderContext();
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  const downloadCanvasToImage = (dataUrl: string) => {
    const a = document.createElement('a');

    a.setAttribute('download', flow?.name);
    a.setAttribute('href', dataUrl);
    a.click();
  };

  const handleDownloadToPNG = () => {
    toPng(document.querySelector('.react-flow') as HTMLElement, {
      filter: (node) => {
        // we don't want to add the controls to the image
        if (node?.classList?.contains('react-flow__controls')) {
          return false;
        }

        return true;
      },
    }).then(downloadCanvasToImage);
  };

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
          content: (
            <Menu>
              <Menu.Item
                icon="Settings"
                iconPlacement="left"
                onClick={() => setShowUpdateModal(true)}
              >
                General info
              </Menu.Item>
              <Menu.Item
                icon="Download"
                iconPlacement="left"
                onClick={handleDownloadToPNG}
              >
                {t('download-png')}
              </Menu.Item>
            </Menu>
          ),
        }}
      />
      <WorkflowModal
        type="update"
        showWorkflowModal={showUpdateModal}
        setShowWorkflowModal={setShowUpdateModal}
      />
    </Container>
  );
};

const Container = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;
