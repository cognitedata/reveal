import { Button, Icon, Modal, TextInput } from '@cognite/cogs.js';
import React from 'react';

import { Discrepancy } from './LineReviewViewer';

type Props = {
  isOpen: boolean;
  initialDiscrepancy: Discrepancy;
  onSave: (discrepancy: Discrepancy) => void;
  onDeletePress: () => void;
  onClosePress: () => void;
};

const DiscrepancyModal: React.FC<Props> = ({
  isOpen,
  initialDiscrepancy,
  onDeletePress,
  onSave,
  onClosePress,
}) => {
  const [comment, setComment] = React.useState(initialDiscrepancy.comment);

  const onSavePress = () => {
    onSave({
      ...initialDiscrepancy,
      comment,
    });
  };

  return (
    <Modal visible={isOpen} onCancel={onClosePress} footer={null}>
      <h2>
        <Icon type="ExclamationMark" />
        Mark discrepancy
      </h2>
      <TextInput
        placeholder="Add comment..."
        style={{ width: '100%' }}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div
        style={{
          marginTop: 16,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button style={{ marginRight: 8 }} onClick={onDeletePress}>
          Remove discrepancy
        </Button>
        <Button type="primary" style={{ marginRight: 8 }} onClick={onSavePress}>
          Save for validation
        </Button>
      </div>
    </Modal>
  );
};

export default DiscrepancyModal;
