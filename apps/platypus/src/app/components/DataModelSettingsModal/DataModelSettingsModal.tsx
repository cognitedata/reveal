import { useState } from 'react';

import { DataModel } from '@platypus/platypus-core';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { useDataModelMutation } from '../../modules/data-models/hooks/useDataModelMutation';
import { DataModelDetailModal } from '../DataModelDetailModal/DataModelDetailModal';

export type DataModelSettingsModalProps = {
  dataModel: DataModel;
  onRequestClose: () => void;
  visible: boolean;
};

export const DataModelSettingsModal = (props: DataModelSettingsModalProps) => {
  const { update } = useDataModelMutation();
  const { t } = useTranslation('DataModelSettingsModal');

  const [name, setName] = useState(props.dataModel.name);
  const [description, setDescription] = useState(props.dataModel.description);

  const handleSubmit = () => {
    update.mutate(
      {
        description: description,
        externalId: props.dataModel.id,
        name: name || '',
        space: props.dataModel.space,
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
      visible={props.visible}
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
      space={props.dataModel.space}
      title={t('data_model_settings_modal_title', 'Settings')}
    />
  );
};
