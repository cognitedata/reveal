import { Body, Modal } from '@cognite/cogs.js';

import { SerializedCanvasDocument } from '../types';

type CanvasDeletionModalProps = {
  canvas: SerializedCanvasDocument | undefined;
  isDeleting: boolean;
  onCancel: VoidFunction;
  onDeleteCanvas: (canvas: SerializedCanvasDocument) => void;
};

const CanvasDeletionModal: React.FC<CanvasDeletionModalProps> = ({
  canvas,
  onCancel,
  onDeleteCanvas,
  isDeleting,
}) => {
  if (canvas === undefined) {
    return <></>;
  }
  return (
    <Modal
      visible={canvas !== undefined}
      title="Delete canvas?"
      onCancel={onCancel}
      onOk={() => onDeleteCanvas(canvas)}
      okDisabled={isDeleting}
      okText="Delete"
      icon={isDeleting ? 'Loader' : undefined}
      destructive
    >
      <Body level={2}>
        Are you sure you want to delete the canvas "
        <strong>{canvas.name || '<no name>'}</strong>
        "?
        <br />
        The canvas will be deleted permanently.
      </Body>
    </Modal>
  );
};

export default CanvasDeletionModal;
