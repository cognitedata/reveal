import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useCdfUserHistoryService } from '@user-history';

import { createLink } from '@cognite/cdf-utilities';

import { Notification } from '../../components/Notification/Notification';
import { SUB_APP_PATH } from '../../constants';
import { useDMContext } from '../../context/DMContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataModelMutation } from '../../modules/data-models/hooks/useDataModelMutation';
import { DataModelDetailModal } from '../DataModelDetailModal/DataModelDetailModal';

export type DataModelSettingsModalProps = {
  onRequestClose: () => void;
  visible: boolean;
};

export const DataModelSettingsModal = ({
  onRequestClose,
  visible,
}: DataModelSettingsModalProps) => {
  const { selectedDataModel } = useDMContext();
  const { name, description, externalId, space, version } = selectedDataModel;
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
        name: dataModelName || '',
        space,
        version,
      },
      {
        onSuccess: () => {
          // save data-model edit action to user history
          if (externalId) {
            userHistoryService.logNewResourceView({
              application: SUB_APP_PATH,
              name: externalId,
              path: createLink(dataModelPathname),
            });
          }
          onRequestClose();
        },
        onError: (error) => {
          Notification({
            type: 'error',
            message: error.message,
          });
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
