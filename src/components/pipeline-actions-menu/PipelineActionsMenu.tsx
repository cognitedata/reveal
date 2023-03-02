import { useState } from 'react';
import { Menu, Modal, Divider } from '@cognite/cogs.js';
import { getContainer } from 'utils';

type PipelineActionsMenuProps = {
  id: number;
  onDuplicatePipeline?: () => void;
  onDeletePipeline: () => void;
};
const PipelineActionsMenu = (props: PipelineActionsMenuProps) => {
  const { onDuplicatePipeline, onDeletePipeline } = props;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const onCancelDeletePipeline = () => setDeleteModalVisible(false);

  return (
    <>
      <Menu>
        <Menu.Item
          icon="Duplicate"
          iconPlacement="left"
          onClick={onDuplicatePipeline}
        >
          Duplicate
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
          Delete
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
  return (
    <Modal
      getContainer={getContainer()}
      visible={visible}
      onCancel={onCancel}
      onOk={onOk}
      title="Delete pipeline"
      okText="Delete"
    >
      Are you sure you want to delete this pipeline?
    </Modal>
  );
}

export default PipelineActionsMenu;
