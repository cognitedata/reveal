import { Button, Icon, TextInput } from '@cognite/cogs.js';
import React from 'react';

import PopupModal from './PopupModal';
import { Discrepancy } from './LineReviewViewer';

type Props = {
  initialPosition: { x: number; y: number };
  initialDiscrepancy: Discrepancy;
  onSave: (discrepancy: Discrepancy) => void;
  onDeletePress: () => void;
};

const DiscrepancyModal: React.FC<Props> = ({
  initialPosition,
  initialDiscrepancy,
  onDeletePress,
  onSave,
}) => {
  const [comment, setComment] = React.useState(initialDiscrepancy.comment);

  const onSavePress = () => {
    onSave({
      ...initialDiscrepancy,
      comment,
    });
  };

  return (
    <PopupModal
      key={`${initialPosition.x}_${initialPosition.y}`}
      initialDimensions={initialPosition}
    >
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
    </PopupModal>
  );
};

export default DiscrepancyModal;
