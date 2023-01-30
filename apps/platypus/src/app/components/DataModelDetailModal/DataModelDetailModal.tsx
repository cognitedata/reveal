import {
  Button,
  Detail,
  Input,
  OptionType,
  Select,
  Textarea,
} from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog';
import { useState } from 'react';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { InputDetail, NameWrapper, StyledEditableChip } from './elements';
import { DataSet } from '@cognite/sdk';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import {
  DataModelExternalIdValidator,
  Validator,
} from '@platypus/platypus-core';
import { DataModelNameValidator } from '@platypus-core/domain/data-model/validators/data-model-name-validator';
import { DataModelSpaceSelect } from '../DataModelSpaceSelect/DataModelSpaceSelect';
import { DataModelNameValidatorV2 } from '@platypus-core/domain/data-model/validators/data-model-name-validator-v2';
import { isFDMv3 } from '@platypus-app/flags';
import { FormLabel } from '../FormLabel/FormLabel';

export type DataModelDetailModalProps = {
  description: string;
  externalId: string;
  hasInputError?: boolean;
  dataSets: DataSet[];
  isDataSetsLoading?: boolean;
  isDataSetsFetchError?: boolean;
  isExternalIdLocked?: boolean;
  isLoading?: boolean;
  isSpaceDisabled?: boolean;
  okButtonName?: string;
  name: string;
  onCancel: () => void;
  onSubmit: () => void;
  onDescriptionChange: (value: string) => void;
  onExternalIdChange?: (value: string) => void;
  onNameChange: (value: string) => void;
  title: string;
  space?: string;
  onSpaceChange?: (value: string) => void;
};

export const DataModelDetailModal = (props: DataModelDetailModalProps) => {
  const { t } = useTranslation('DataModelDetailModal');
  const isFDMV3 = isFDMv3();
  const [externalIdErrorMessage, setExternalIdErrorMessage] = useState();
  const [nameErrorMessage, setNameErrorMessage] = useState();

  const dataSetOptions = props.dataSets.map(
    (item: DataSet) =>
      ({
        label: item.name,
        value: item.id,
      } as OptionType<typeof item.id>)
  );

  const [selectedDataSet, setSelectedDataSet] = useState<
    OptionType<unknown> | undefined
  >(undefined);

  const validateName = (value: string) => {
    const validator = new Validator({ name: value });
    const dataModelNameValidator = isFDMV3
      ? new DataModelNameValidator()
      : new DataModelNameValidatorV2();
    validator.addRule('name', dataModelNameValidator);
    const result = validator.validate();
    setNameErrorMessage(result.valid ? null : result.errors.name);

    return result.valid;
  };

  const validateExternalId = (value: string) => {
    const validator = new Validator({ externalId: value });
    validator.addRule('externalId', new DataModelExternalIdValidator());
    const result = validator.validate();

    setExternalIdErrorMessage(result.valid ? null : result.errors.externalId);

    return result.valid;
  };

  const isSubmitDisabled =
    !props.name.trim() || externalIdErrorMessage || (isFDMV3 && !props.space);

  return (
    <ModalDialog
      visible
      title={props.title}
      onCancel={props.onCancel}
      onOk={props.onSubmit}
      okDisabled={isSubmitDisabled}
      okButtonName={props.okButtonName}
      okProgress={props.isLoading}
      okType="primary"
      data-cy="create-data-model-modal-content"
    >
      <div>
        <label>
          <FormLabel level={2} strong required>
            {t('modal_name_title', 'Name')}
          </FormLabel>
          <NameWrapper>
            <Input
              fullWidth
              autoFocus
              name="dataModelName"
              data-cy="input-data-model-name"
              value={props.name}
              placeholder={t('modal_name_input_placeholder', 'Enter name')}
              onChange={(e) => {
                validateName(e.target.value);
                props.onNameChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitDisabled) {
                  props.onSubmit();
                }
              }}
              error={props.hasInputError || nameErrorMessage}
            />
          </NameWrapper>
        </label>
        <StyledEditableChip
          data-testid="external-id-field"
          errorMessage={externalIdErrorMessage}
          isLocked={props.isExternalIdLocked}
          label={t('external_id_label', 'External ID')}
          onChange={props.onExternalIdChange}
          placeholder="DataModel-ID"
          tooltip={
            props.externalId
              ? t('tooltip_external_id_label', 'External ID')
              : t(
                  'tooltip_external_id_explanation',
                  'External ID automatically generated from [Name]'
                )
          }
          validate={validateExternalId}
          value={props.externalId}
        />
        <label>
          <FormLabel level={2} strong>
            {t('modal_description_title', 'Description')}
          </FormLabel>
          <Textarea
            name="dataModelDescription"
            data-cy="input-data-model-description"
            value={props.description}
            onChange={(e) => props.onDescriptionChange(e.target.value)}
            placeholder={t(
              'modal_description_textarea_placeholder',
              'Add description'
            )}
          ></Textarea>
        </label>

        <DataModelSpaceSelect
          isDisabled={props.isSpaceDisabled}
          onSpaceSelect={(selectedSpace) =>
            props.onSpaceChange?.(selectedSpace)
          }
          preSelectedSpace={props.space}
        />

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
              noOptionsMessage={() =>
                props.isDataSetsLoading ? (
                  <Spinner />
                ) : props.isDataSetsFetchError ? (
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
            <InputDetail>
              <Detail>
                {t(
                  'detail_data_sets_unique',
                  'You need to select a data set to define access control. This can also be done later in the Settings dialog. '
                )}
              </Detail>
            </InputDetail>
          </>
        )}
      </div>
    </ModalDialog>
  );
};
