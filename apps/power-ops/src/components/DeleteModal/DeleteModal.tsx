import { Body, Modal } from '@cognite/cogs.js';

export const DeleteModal = ({
  isOpen = false,
  onOk,
  onCancel,
  title,
}: {
  isOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  title?: string;
}) => (
  <Modal
    testId="delete-modal"
    visible={isOpen}
    title={['Delete', title].filter(Boolean).join(' ')}
    onCancel={onCancel}
    onOk={onOk}
    appElement={document.getElementById('root') ?? undefined}
  >
    <Body>Do you really want to delete{title && ` this ${title}`}?</Body>
  </Modal>
);
