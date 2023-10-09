import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { DataModel } from '@platypus/platypus-core';

import { createLink, useCdfUserHistoryService } from '@cognite/cdf-utilities';

import { SUB_APP_PATH } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataModelMutation } from '../../modules/data-models/hooks/useDataModelMutation';
import { DataModelDetailModal } from '../DataModelDetailModal/DataModelDetailModal';

export type DataModelSettingsModalProps = {
  dataModel: DataModel;
  onRequestClose: () => void;
  visible: boolean;
};

export const DataModelSettingsModal = ({
  dataModel,
  onRequestClose,
  visible,
}: DataModelSettingsModalProps) => {
  const { name, description, id: externalId, space, version } = dataModel;
  const { pathname: dataModelPathname } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const { update } = useDataModelMutation();
  const { t } = useTranslation('DataModelSettingsModal');

  const [dataModelName, setName] = useState(name);
  const [dataModelDescription, setDescription] = useState(description);

  const handleSubmit = () => {
    update.mutate(
      {
        description: dataModelDescription,
        externalId,
        name: dataModelName,
        space,
        version,
      },
      {
        onSuccess: () => {
          // save data-model edit action to user history
          if (externalId)
            userHistoryService.logNewResourceView({
              application: SUB_APP_PATH,
              name: externalId,
              path: createLink(dataModelPathname),
            });
          onRequestClose();
        },
      }
    );
  };

  return (
    <DataModelDetailModal
      visible={visible}
      description={dataModelDescription || ''}
      externalId={externalId}
      isExternalIdLocked
      isLoading={update.isLoading}
      isSpaceDisabled
      name={dataModelName || ''}
      okButtonName={t('data_model_settings_modal_ok_button', 'Update')}
      onCancel={onRequestClose}
      onDescriptionChange={(value) => setDescription(value)}
      onNameChange={(value) => setName(value)}
      onSubmit={handleSubmit}
      space={space}
      title={t('data_model_settings_modal_title', 'Settings')}
    />
  );
};
