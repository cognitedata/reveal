import { OperationVersions } from '@cognite/calculation-backend';
import { Button } from '@cognite/cogs.js';
import { useState } from 'react';
import EditSaveViewButton from './EditSaveViewButton';
import InfoModal from './InfoModal';

type Props = {
  actions: {
    onEditClick?: () => void;
    onEditFunctionClick?: () => void;
    onDuplicateClick?: () => void;
    onRemoveClick?: () => void;
    onInfoClick?: () => void;
  };
  capabilities: {
    canEdit: boolean;
    canRemove: boolean;
    canDuplicate: boolean;
    canSeeInfo: boolean;
  };
  status?: {
    isEditing?: boolean;
  };
  data?: {
    indslFunction?: OperationVersions;
  };
};

const ActionBar = ({ actions, capabilities, status, data }: Props) => {
  if (!actions) {
    throw new Error('Actions are missing!');
  }

  if (!capabilities) {
    throw new Error('Capabilities are missing!');
  }

  const {
    onEditClick,
    onEditFunctionClick,
    onDuplicateClick,
    onRemoveClick,
    onInfoClick,
  } = actions;

  if (onEditFunctionClick && typeof status?.isEditing !== 'boolean') {
    throw new Error('onEditFunctionClick need an isEditing status');
  }

  if (onEditClick && typeof status?.isEditing !== 'boolean') {
    throw new Error('onEditClick need an isEditing status');
  }

  const { canEdit, canRemove, canDuplicate, canSeeInfo } = capabilities;
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      {onEditClick && typeof status?.isEditing === 'boolean' && (
        <EditSaveViewButton
          disabled={false}
          onClick={() => onEditClick()}
          isEditing={status.isEditing}
          readOnly={false}
        />
      )}
      {onEditFunctionClick && typeof status?.isEditing === 'boolean' && (
        <EditSaveViewButton
          disabled={false}
          onClick={() => onEditFunctionClick()}
          isEditing={status.isEditing}
          readOnly={!canEdit}
        />
      )}
      {onDuplicateClick && (
        <Button
          type="ghost"
          icon="Duplicate"
          aria-label="Duplicate"
          title="Duplicate"
          disabled={!canDuplicate}
          onClick={() => onDuplicateClick()}
        />
      )}
      {onRemoveClick && (
        <Button
          type="ghost"
          icon="Delete"
          aria-label="Remove"
          title="Remove"
          disabled={!canRemove}
          onClick={() => onRemoveClick()}
        />
      )}
      {canSeeInfo && data?.indslFunction && (
        <>
          <Button
            type="ghost"
            icon="Info"
            aria-label="See more info"
            title="See more info"
            onClick={() => {
              if (onInfoClick) onInfoClick();
              setIsModalVisible(true);
            }}
          />
          <InfoModal
            indslFunction={data.indslFunction}
            isOpen={isModalVisible}
            onClose={() => setIsModalVisible(false)}
          />
        </>
      )}
    </>
  );
};

export default ActionBar;
