import { useState } from 'react';
import { OperationVersions } from '@cognite/calculation-backend';
import { Button } from '@cognite/cogs.js';
import { defaultTranslations } from 'components/NodeEditor/translations';
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
  translations: typeof defaultTranslations;
};

const ActionBar = ({
  actions,
  capabilities,
  status,
  data,
  translations: t,
}: Props) => {
  if (!actions) throw new Error('Actions are missing!');
  if (!capabilities) throw new Error('Capabilities are missing!');
  const {
    onEditClick,
    onEditFunctionClick,
    onDuplicateClick,
    onRemoveClick,
    onInfoClick,
  } = actions;

  const { canEdit, canRemove, canDuplicate, canSeeInfo } = capabilities;

  if (onEditFunctionClick && typeof status?.isEditing !== 'boolean') {
    throw new Error('onEditFunctionClick need an isEditing status');
  }

  if (onEditClick && typeof status?.isEditing !== 'boolean') {
    throw new Error('onEditClick need an isEditing status');
  }

  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      {onEditClick && typeof status?.isEditing === 'boolean' && (
        <EditSaveViewButton
          disabled={false}
          onClick={() => onEditClick()}
          isEditing={status.isEditing}
          readOnly={false}
          translations={t}
        />
      )}
      {onEditFunctionClick && typeof status?.isEditing === 'boolean' && (
        <EditSaveViewButton
          disabled={false}
          onClick={() => onEditFunctionClick()}
          isEditing={status.isEditing}
          readOnly={!canEdit}
          translations={t}
        />
      )}
      {onDuplicateClick && (
        <Button
          type="ghost"
          icon="Duplicate"
          aria-label={t.Duplicate}
          title={t.Duplicate}
          disabled={!canDuplicate}
          onClick={() => onDuplicateClick()}
        />
      )}
      {onRemoveClick && (
        <Button
          type="ghost"
          icon="Delete"
          aria-label={t.Remove}
          title={t.Remove}
          disabled={!canRemove}
          onClick={() => onRemoveClick()}
        />
      )}
      {canSeeInfo && data?.indslFunction && (
        <>
          <Button
            type="ghost"
            icon="Info"
            aria-label={t['See more info']}
            title={t['See more info']}
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
