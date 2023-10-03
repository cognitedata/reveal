import { useState } from 'react';

import { Menu, Modal, Divider } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  PipelineWithLatestRun,
  useRunEMPipeline,
} from '../../hooks/entity-matching-pipelines';
import { getContainer } from '../../utils';

type PipelineActionsMenuProps = {
  pipeline: PipelineWithLatestRun;
  latestRun?: PipelineWithLatestRun['latestRun'];
  onDuplicatePipeline?: () => void;
  onDeletePipeline: () => void;
};
const PipelineActionsMenu = (props: PipelineActionsMenuProps) => {
  const { onDuplicatePipeline, onDeletePipeline } = props;
  const { mutateAsync: runEMPipeline } = useRunEMPipeline();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { t } = useTranslation();

  const onCancelDeletePipeline = () => setDeleteModalVisible(false);

  const rerun = props.pipeline?.latestRun?.status;
  const running = rerun === 'Queued' || rerun === 'Running';

  const handleReRunPipeline = (id: number) => {
    runEMPipeline({ id });
  };

  let itemText;

  switch (rerun) {
    case 'Queued': {
      itemText = t('queued');
      break;
    }
    case 'Running': {
      itemText = t('running');
      break;
    }
    default: {
      itemText = t('rerun-pipeline');
      break;
    }
  }

  return (
    <>
      <Menu>
        {props.latestRun && (
          <>
            <Menu.Item
              icon="Play"
              iconPlacement="left"
              onClick={() => handleReRunPipeline(props.pipeline.id)}
              disabled={running}
            >
              {itemText}
            </Menu.Item>
            <Divider />
          </>
        )}
        <Menu.Item
          icon="Duplicate"
          iconPlacement="left"
          onClick={onDuplicatePipeline}
        >
          {t('pipeline-actions-menu-duplicate')}
        </Menu.Item>
        <Divider />
        <Menu.Item
          icon="Delete"
          iconPlacement="left"
          onClick={() => {
            setDeleteModalVisible(true);
          }}
          destructive
        >
          {t('pipeline-actions-menu-delete')}
        </Menu.Item>
      </Menu>
      <PipelineDeleteModal
        visible={deleteModalVisible}
        onOk={onDeletePipeline}
        onCancel={onCancelDeletePipeline}
      />
    </>
  );
};

type PipelineDeleteModalProps = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
};
function PipelineDeleteModal(props: PipelineDeleteModalProps) {
  const { visible, onOk, onCancel } = props;
  const { t } = useTranslation();
  return (
    <Modal
      getContainer={getContainer()}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      title={t('pipeline-delete-modal-title')}
      okText={t('pipeline-actions-menu-delete')}
    >
      {t('pipeline-delete-modal-warning-message')}
    </Modal>
  );
}

export default PipelineActionsMenu;
