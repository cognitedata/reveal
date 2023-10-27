import { useState } from 'react';

import { Menu, Modal, Divider } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { Pipeline } from '../../hooks/entity-matching-pipelines';
import { getContainer } from '../../utils';

type PipelineActionsMenuProps = {
  pipeline: Pipeline;
  dataTestId?: string;
  onRerunPipeline: () => void;
  onDuplicatePipeline?: () => void;
  onDeletePipeline: () => void;
};
const PipelineActionsMenu = (props: PipelineActionsMenuProps) => {
  const { dataTestId, onRerunPipeline, onDuplicatePipeline, onDeletePipeline } =
    props;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { t } = useTranslation();

  const onCancelDeletePipeline = () => setDeleteModalVisible(false);

  const rerun = props.pipeline?.lastRun?.status;
  const running = rerun === 'Queued' || rerun === 'Running';

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
        {props.pipeline.lastRun && (
          <>
            <Menu.Item
              icon="Play"
              iconPlacement="left"
              onClick={() => onRerunPipeline()}
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
          data-testid={`${dataTestId}-delete`}
        >
          {t('pipeline-actions-menu-delete')}
        </Menu.Item>
      </Menu>
      <PipelineDeleteModal
        visible={deleteModalVisible}
        onOk={onDeletePipeline}
        onCancel={onCancelDeletePipeline}
        dataTestId={`${dataTestId}-delete`}
      />
    </>
  );
};

type PipelineDeleteModalProps = {
  visible: boolean;
  dataTestId?: string;
  onOk: () => void;
  onCancel: () => void;
};
function PipelineDeleteModal(props: PipelineDeleteModalProps) {
  const { visible, dataTestId, onOk, onCancel } = props;
  const { t } = useTranslation();
  return (
    <Modal
      getContainer={getContainer()}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      title={t('pipeline-delete-modal-title')}
      okText={t('pipeline-actions-menu-delete')}
      okButtonProps={{ 'data-testid': `${dataTestId}-ok` }}
    >
      {t('pipeline-delete-modal-warning-message')}
    </Modal>
  );
}

export default PipelineActionsMenu;
