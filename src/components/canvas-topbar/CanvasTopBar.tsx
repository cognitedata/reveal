import {
  Button,
  Chip,
  Colors,
  Dropdown,
  Flex,
  Menu,
  SegmentedControl,
} from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { getContainer } from 'utils';
import { useTranslation } from 'common';
import FlowSaveIndicator from '../../pages/flow/FlowSaveIndicator';
import { toPng } from 'html-to-image';
import { ViewMode, useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { useMemo, useState } from 'react';
import EditWorkflowModal from 'components/workflow-modal/EditWorkflowModal';
import {
  WorkflowDefinitionCreate,
  WorkflowWithVersions,
  useCreateWorkflowDefinition,
  useRunWorkflow,
} from 'hooks/workflows';
import {
  areWorkflowDefinitionsSame,
  convertCanvasToWorkflowDefinition,
  getLastWorkflowDefinition,
} from 'utils/workflows';

type CanvasTopBarProps = {
  workflow: WorkflowWithVersions;
};

export const CanvasTopBar = ({ workflow }: CanvasTopBarProps) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { mutate: createWorkflowDefinition } = useCreateWorkflowDefinition();
  const { mutateAsync: runWorkflow } = useRunWorkflow();

  const { flow, setHistoryVisible, activeViewMode, setActiveViewMode } =
    useWorkflowBuilderContext();

  const { workflowDefinition: lastWorkflowDefinition, version: lastVersion } =
    useMemo(() => getLastWorkflowDefinition(workflow), [workflow]);

  const lastVersionAsNumber = parseInt(lastVersion ?? '');

  const nextVersion = lastVersionAsNumber ? lastVersionAsNumber + 1 : 1;

  const shouldPublish = useMemo(
    () =>
      !lastWorkflowDefinition ||
      !areWorkflowDefinitionsSame(
        lastWorkflowDefinition.tasks,
        convertCanvasToWorkflowDefinition(flow)
      ),
    [flow, lastWorkflowDefinition]
  );

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

  const handlePublish = () => {
    const tasks = convertCanvasToWorkflowDefinition(flow);
    const workflowDefinition: WorkflowDefinitionCreate = {
      tasks,
      description: '',
    };

    createWorkflowDefinition({
      externalId: workflow.externalId,
      version: `${nextVersion}`,
      workflowDefinition,
    });
  };

  const handleRun = () => {
    runWorkflow({
      externalId: workflow.externalId,
      version: `${lastVersion}`,
    }).then(() => {
      setActiveViewMode('run-history');
    });
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
            <SegmentedControl
              onButtonClicked={(k) => setActiveViewMode(k as ViewMode)}
              size="medium"
              currentKey={activeViewMode}
            >
              <SegmentedControl.Button key="edit">
                {t('edit-mode')}
              </SegmentedControl.Button>
              <SegmentedControl.Button key="runs">
                {t('run-history')}
              </SegmentedControl.Button>
            </SegmentedControl>
            <SecondaryTopbar.Divider />
            <Flex gap={12}>
              <Button
                disabled={!shouldPublish}
                onClick={handlePublish}
                type="primary"
              >
                {t('publish-version')}
              </Button>
              <Dropdown
                content={
                  <Menu>
                    <Menu.Item onClick={handleRun}>
                      {t('run-as-current-user')}
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button
                  disabled={shouldPublish}
                  icon="ChevronDown"
                  iconPlacement="right"
                  type="primary"
                >
                  {t('run')}
                </Button>
              </Dropdown>
            </Flex>
          </Flex>
        }
        extraContentLeft={
          <Chip
            label={`v${shouldPublish ? `${nextVersion} (Draft)` : lastVersion}`}
            size="small"
            type={shouldPublish ? 'default' : 'neutral'}
          />
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
              <Menu.Item
                icon="History"
                iconPlacement="left"
                key="history"
                onClick={() => setHistoryVisible((visible) => !visible)}
              >
                {t('history')}
              </Menu.Item>
            </Menu>
          ),
        }}
      />
      <EditWorkflowModal
        showWorkflowModal={showUpdateModal}
        setShowWorkflowModal={setShowUpdateModal}
      />
    </Container>
  );
};

const Container = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;
