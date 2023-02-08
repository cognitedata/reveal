import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataModel } from '@platypus/platypus-core';
import { useState } from 'react';
import { useDataModelMutation } from '../../modules/data-models/hooks/useDataModelMutation';
import { DataModelDetailModal } from '../DataModelDetailModal/DataModelDetailModal';

export type DataModelSettingsModalProps = {
  dataModel: DataModel;
  onRequestClose: () => void;
};

export const DataModelSettingsModal = (props: DataModelSettingsModalProps) => {
  const { update } = useDataModelMutation();
  const { t } = useTranslation('DataModelSettingsModal');

  const [name, setName] = useState(props.dataModel.name);
  const [description, setDescription] = useState(props.dataModel.description);
  const [space, setSpace] = useState(props.dataModel.space);

  const handleSubmit = () => {
    update.mutate(
      {
        description: description,
        externalId: props.dataModel.id,
        name: name || '',
        space,
        version: props.dataModel.version,
      },
      {
        onSuccess: () => {
          props.onRequestClose();
        },
      }
    );
  };

  return (
    <DataModelDetailModal
      dataSets={[]}
      description={description || ''}
      externalId={props.dataModel.id}
      isExternalIdLocked
      isLoading={update.isLoading}
      isSpaceDisabled
      name={name || ''}
      okButtonName={t('data_model_settings_modal_ok_button', 'Update')}
      onCancel={props.onRequestClose}
      onDescriptionChange={(value) => setDescription(value)}
      onNameChange={(value) => setName(value)}
      onSubmit={handleSubmit}
      space={space}
      onSpaceChange={setSpace}
      title={t('data_model_settings_modal_title', 'Settings')}
    />
  );
};
