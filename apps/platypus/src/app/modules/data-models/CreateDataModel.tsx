import { Notification } from '@platypus-app/components/Notification/Notification';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useDataSets } from '@platypus-app/hooks/useDataSets';
import { useDataModelMutation } from './hooks/useDataModelMutation';
import { DataUtils } from '@platypus/platypus-core';
import { DataModelDetailModal } from '../../components/DataModelDetailModal/DataModelDetailModal';

export const CreateDataModel = ({ onCancel }: { onCancel: VoidFunction }) => {
  const [dataModelName, setDataModelName] = useState('');
  const [dataModelDescription, setDataModelDescription] = useState('');
  const [hasInputError, setHasInputError] = useState(false);
  const [externalId, setExternalId] = useState('');
  const [isExternalIdDirty, setIsExternalIdDirty] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('CreateDataModelDialog');
  const { create } = useDataModelMutation();

  const {
    data: dataSets,
    isLoading: isDataSetsLoading,
    isError: isDataSetsFetchError,
  } = useDataSets();

  const handleNameChange = (value: string) => {
    setDataModelName(value);

    if (!isExternalIdDirty) {
      setExternalId(DataUtils.convertToCamelCase(value));
    }

    if (hasInputError) {
      setHasInputError(false);
    }
  };

  const handleExternalIdChange = (value: string) => {
    setExternalId(value);
    setIsExternalIdDirty(true);
  };

  const handleSubmit = () => {
    create.mutate(
      {
        externalId,
        name: dataModelName.trim(),
        description: dataModelDescription,
      },
      {
        onSettled: (result) => {
          if (!result) {
            return;
          }

          if (result.isFailure) {
            setHasInputError(true);
            Notification({
              type: 'error',
              message: result.error.message,
            });

            return;
          }

          Notification({
            type: 'success',
            message: t(
              'success_data_model_created',
              'Data Model successfully created'
            ),
          });
          navigate(
            `/data-models/${result.getValue().space}/${
              result.getValue().id
            }/${DEFAULT_VERSION_PATH}`
          );
        },
      }
    );
  };

  return (
    <DataModelDetailModal
      dataSets={dataSets || []}
      description={dataModelDescription || ''}
      externalId={externalId}
      hasInputError={hasInputError}
      isDataSetsFetchError={isDataSetsFetchError}
      isDataSetsLoading={isDataSetsLoading}
      isLoading={create.isLoading}
      name={dataModelName}
      onCancel={onCancel}
      onExternalIdChange={handleExternalIdChange}
      onDescriptionChange={(value) => setDataModelDescription(value)}
      onNameChange={handleNameChange}
      onSubmit={handleSubmit}
      title={t('modal-title', 'Create Data Model')}
    />
  );
};
