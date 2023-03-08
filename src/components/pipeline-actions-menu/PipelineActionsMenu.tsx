import { useState } from 'react';
import { Menu, Modal, Divider } from '@cognite/cogs.js';
import { getContainer } from 'utils';
import { useTranslation } from 'common/i18n';

type PipelineActionsMenuProps = {
  id: number;
  onDuplicatePipeline?: () => void;
  onDeletePipeline: () => void;
};
const PipelineActionsMenu = (props: PipelineActionsMenuProps) => {
  const { onDuplicatePipeline, onDeletePipeline } = props;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { t } = useTranslation();

  const onCancelDeletePipeline = () => setDeleteModalVisible(false);

  return (
    <>
      <Menu>
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
