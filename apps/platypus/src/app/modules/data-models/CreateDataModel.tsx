import {
  Body,
  Button,
  Detail,
  Icon,
  Input,
  OptionType,
  Select,
  Textarea,
} from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { TOKENS } from '@platypus-app/di';
import { CreateDataModelModalContent } from './elements';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useDataSets } from '@platypus-app/hooks/useDataSets';
import { DataSet } from '@cognite/sdk/dist/src/types';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

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

  const {
    data: dataSets,
    isLoading: isDataSetsLoading,
    isError: isDataSetsFetchError,
  } = useDataSets();

  const dataSetOptions = (dataSets || []).map(
    (item: DataSet) =>
      ({
        label: item.name,
        value: item.id,
      } as OptionType<typeof item.id>)
  );

  const [selectedDataSet, setSelectedDataSet] = useState<
    OptionType<unknown> | undefined
  >(undefined);

  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  const onCreateDataModel = () => {
    setCreating(true);
    dataModelsHandler
      .create({
        name: dataModelName.trim(),
        description: dataModelDescription,
      })
      .then((result: any) => {
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
          css={{}}
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
          name="dataModelDescription"
          data-cy="input-data-model-description"
          value={dataModelDescription}
          onChange={(e) => setDataModelDescription(e.target.value)}
          placeholder={t(
            'modal_description_textarea_placeholder',
            'Description (optional)'
          )}
        ></Textarea>

        <div
          style={{
            borderTop: '1px solid var(--cogs-greyscale-grey4)',
            margin: '32px 0px 20px 0px',
          }}
        ></div>

        <Body level={2} strong>
          {t('modal_data_sets_title', 'Access Control')}
        </Body>
        <Body level={3}>
          <em>{t('modal_data_sets_title_coming_soon', 'Coming Soon')}</em>
        </Body>
        {/* Temporarily hidden until backend support is available */}
        {false && (
          <>
            <Select
              fullWidth
              name="dataSet"
              data-cy="input-data-set"
              options={dataSetOptions}
              isMulti={false}
              value={selectedDataSet}
              placeholder={t(
                'modal_data_sets_input_placeholder',
                'Select data set'
              )}
              onChange={setSelectedDataSet}
              // error={inputError}
              noOptionsMessage={() =>
                isDataSetsLoading ? (
                  <Spinner />
                ) : isDataSetsFetchError ? (
                  <span>
                    {t(
                      'data_sets_error',
                      "Something went wrong! Couldn't fetch data sets."
                    )}
                  </span>
                ) : (
                  <span>
                    {t('data_sets_empty', 'There are no data sets available')}
                  </span>
                )
              }
              menuFooter={
                (
                  <Button iconPlacement="right" icon="ExternalLink">
                    {t('add_data_set_btn_text', 'Add data set')}
                  </Button>
                ) as unknown as HTMLButtonElement
              }
            />
            <div className="input-detail">
              <Detail>
                {t(
                  'detail_data_sets_unique',
                  'You need to select a data set to define access control. This can also be done later in the Settings dialog. '
                )}
              </Detail>
            </div>
          </>
        )}
      </CreateDataModelModalContent>
    </ModalDialog>
  );
};
