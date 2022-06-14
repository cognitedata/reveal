import { Body, Detail, Icon, Input, Textarea } from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { TOKENS } from '@platypus-app/di';
import { CreateDataModelModalContent } from './elements';
import { useInjection } from '@platypus-app/hooks/useInjection';

export const CreateDataModel = ({
  createDataModel,
  onCancel,
}: {
  createDataModel: boolean;
  onCancel: VoidFunction;
}) => {
  const [creating, setCreating] = useState<boolean>(false);
  const [dataModelName, setDataModelName] = useState('');
  const [dataModelDescription, setDataModelDescription] = useState('');
  const [inputError, setInputError] = useState(false);
  const history = useHistory();
  const { t } = useTranslation('CreateDataModelDialog');

  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  const onCreateDataModel = () => {
    setCreating(true);
    dataModelsHandler
      .create({
        name: dataModelName.trim(),
        description: dataModelDescription,
      })
      .then((result) => {
        setCreating(false);
        if (result.isFailure) {
          if (result.error.name) {
            setInputError(true);
          } else {
            Notification({
              type: 'error',
              message: result.error.message,
            });
          }
        } else {
          Notification({
            type: 'success',
            message: t(
              'success_data_model_created',
              'Data Model successfully created'
            ),
          });
          history.push(
            `data-models/${result.getValue().id}/${DEFAULT_VERSION_PATH}`
          );
        }
      });
  };

  return (
    <ModalDialog
      visible={createDataModel}
      title={t('create_data_model', 'Create Data Model')}
      onCancel={() => {
        setInputError(false);
        setDataModelName('');
        setDataModelDescription('');
        onCancel();
      }}
      onOk={() => onCreateDataModel()}
      okDisabled={!dataModelName || !dataModelName.trim()}
      okButtonName={t('confirm', 'Confirm')}
      okProgress={creating}
      okType="primary"
    >
      <CreateDataModelModalContent data-cy="create-data-model-modal">
        <Body level={2} strong>
          {t('modal_name_title', 'Name')}
        </Body>
        <Input
          fullWidth
          autoFocus
          name="dataModelName"
          data-cy="input-data-model-name"
          value={dataModelName}
          placeholder={t('modal_name_input_placeholder', 'Enter name')}
          onChange={(e) => {
            setDataModelName(e.target.value);
            if (inputError) {
              setInputError(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onCreateDataModel();
            }
          }}
          error={inputError}
        />
        <div className="input-detail">
          {inputError && <Icon type="Warning" />}
          <Detail>
            {t(
              'detail_data_model_name_unique',
              "Data Model's name should be unique"
            )}
          </Detail>
        </div>

        <Body level={2} strong>
          {t('modal_description_title', 'Description')}
        </Body>
        <Textarea
          name="solutionDescription"
          data-cy="input-solution-description"
          value={dataModelDescription}
          onChange={(e) => setDataModelDescription(e.target.value)}
          placeholder={t(
            'modal_description_textarea_placeholder',
            'Description (optional)'
          )}
        ></Textarea>
      </CreateDataModelModalContent>
    </ModalDialog>
  );
};
