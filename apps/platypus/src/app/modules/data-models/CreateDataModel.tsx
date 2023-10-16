import { useState } from 'react';

import { DataUtils } from '@platypus/platypus-core';
import { useCdfUserHistoryService } from '@user-history';

import { createLink } from '@cognite/cdf-utilities';

import { DataModelDetailModal } from '../../components/DataModelDetailModal/DataModelDetailModal';
import { Notification } from '../../components/Notification/Notification';
import { SUB_APP_PATH } from '../../constants';
import { useNavigate } from '../../flags/useNavigate';
import { useMixpanel } from '../../hooks/useMixpanel';
import { useTranslation } from '../../hooks/useTranslation';
import { DEFAULT_VERSION_PATH } from '../../utils/config';

import { useDataModelMutation } from './hooks/useDataModelMutation';

export const CreateDataModel = ({
  onCancel,
  visible,
}: {
  onCancel: VoidFunction;
  visible: boolean;
}) => {
  const userHistoryService = useCdfUserHistoryService();

  const [dataModelName, setDataModelName] = useState('');
  const [space, setSpace] = useState<string | undefined>();
  const [dataModelDescription, setDataModelDescription] = useState('');
  const [externalId, setExternalId] = useState('');
  const [dml, setDML] = useState('');
  const [isExternalIdDirty, setIsExternalIdDirty] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('CreateDataModelDialog');
  const { create } = useDataModelMutation();
  const { track } = useMixpanel();

  const handleNameChange = (value: string) => {
    setDataModelName(value);

    if (!isExternalIdDirty) {
      setExternalId(DataUtils.convertToExternalId(value));
    }
  };
  const handleDMLChange = (value = '') => {
    setDML(value);
  };

  const handleExternalIdChange = (value: string) => {
    setExternalId(value);
    setIsExternalIdDirty(true);
  };

  const handleSubmit = () => {
    create.mutate(
      {
        space: space,
        externalId,
        name: dataModelName.trim(),
        description: dataModelDescription,
        ...(dml && { graphQlDml: dml }),
      },
      {
        onSettled: (result) => {
          if (!result) {
            return;
          }

          track('DataModel.Create');
          const dataModelPath = `/${result.space}/${result.id}/${DEFAULT_VERSION_PATH}`;
          // save create action to user history
          if (dataModelName.trim())
            userHistoryService.logNewResourceEdit({
              application: SUB_APP_PATH,
              name: dataModelName.trim(),
              path: createLink(dataModelPath),
            });

          Notification({
            type: 'success',
            message: t(
              'success_data_model_created',
              'Data Model successfully created'
            ),
          });
          navigate(dataModelPath);
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
      isLoading={create.isLoading}
      name={dataModelName}
      okButtonName={t('data_model_create_modal_ok_button', 'Create')}
      onCancel={onCancel}
      onExternalIdChange={handleExternalIdChange}
      onDescriptionChange={(value) => setDataModelDescription(value)}
      onNameChange={handleNameChange}
      // todo, i hate this component - way too much prop chaining, but this is shortest path
      onDMLChange={handleDMLChange}
      onSubmit={handleSubmit}
      space={space}
      onSpaceChange={setSpace}
      title={t('data_model_create_modal_title', 'Create Data Model')}
    />
  );
};
