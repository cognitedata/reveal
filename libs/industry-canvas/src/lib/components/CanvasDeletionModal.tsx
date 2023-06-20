import { Body, Modal } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { useTranslation } from '../hooks/useTranslation';
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
  const { t } = useTranslation();
  if (canvas === undefined) {
    return <></>;
  }
  return (
    <Modal
      visible={canvas !== undefined}
      title={t(translationKeys.MODAL_CANVAS_DELETION_TITLE, 'Delete canvas?')}
      onCancel={onCancel}
      onOk={() => onDeleteCanvas(canvas)}
      okDisabled={isDeleting}
      okText="Delete"
      icon={isDeleting ? 'Loader' : undefined}
      destructive
    >
      <Body level={2}>
        {t(
          translationKeys.MODAL_CANVAS_DELETION_CONFIRMATION,
          'Are you sure you want to delete the canvas'
        )}{' '}
        <strong>{canvas.name || '<no name>'}</strong>
        "?
        <br />
        {t(
          translationKeys.MODAL_CANVAS_DELETION_MESSAGE,
          'The canvas will be deleted permanently.'
        )}
      </Body>
    </Modal>
  );
};

export default CanvasDeletionModal;
