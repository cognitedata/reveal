import { useMemo } from 'react';

import styled from 'styled-components';

import { useTranslation, TranslationKeys } from '@transformations/common';
import FormFieldRadioGroup from '@transformations/components/form-field-radio-group';
import FormFieldSelect from '@transformations/components/form-field-select';
import FormFieldSelectOption from '@transformations/components/form-field-select/FormFieldSelectOption';
import { DESTINATION_ACTION_OPTIONS } from '@transformations/components/target/Destination';
import { DataModel, useModels } from '@transformations/hooks/fdm';
import {
  ConflictMode,
  Destination,
  isCleanDestination,
  isCleanResourceType,
  isDataModelCentric,
  isFDMDestination,
  isRAWDestination,
  isRAWResourceType,
  ResourceType,
  TransformationRead,
  WellDataType,
} from '@transformations/types';
import {
  flattenFDMModels,
  isDestinationActionSupported,
} from '@transformations/utils';
import {
  getDataModelKey,
  getSelectedModel,
  parseDataModelKey,
} from '@transformations/utils/fdm';
import { Select } from 'antd';
import { FormikErrors, FormikProps } from 'formik';

import { ExtendedTranslationKeys } from '@cognite/cdf-i18n-utils';
import { Flex } from '@cognite/cogs.js';

import CleanDestinationForm from './CleanDestinationForm';
import FDMDestinationForm from './FDMDestinationForm';
import RawDestinationForm from './RawDestinationForm';

const { Option, OptGroup } = Select;

type TransformationDestinationFormProps = {
  initialValueForModel?: string;
  formik: FormikProps<TransformationDestinationFormValues>;
};

export type TransformationDestinationFormValues = {
  model?: 'clean' | 'raw' | string;
  action?: ConflictMode;
  resourceType?: ResourceType;
  shouldIgnoreNullFields: string;

  // Clean form values
  sequenceExternalId?: string;
  wdlDataType?: WellDataType;

  // RAW form values
  rawDatabase?: string;
  rawTable?: string;

  // FDM generic form values
  instanceSpace?: string;

  // FDM form values for data model
  dataModelSpace?: string;
  dataModelVersion?: string;

  // FDM form values for views
  viewExternalId?: string;

  // FDM form values for connection definitions
  connectionDefinitionProperty?: string;
};

export const getDestinationFormInitialValues = (
  transformation: TransformationRead
): TransformationDestinationFormValues => {
  const { conflictMode, destination, ignoreNullFields } = transformation;

  // FIXME: we need to remove this check when we start supporting updating
  // destination if edges are selected
  if (isFDMDestination(destination) && destination.type === 'edges') {
    return {
      shouldIgnoreNullFields: 'true',
    };
  }

  const formValues: TransformationDestinationFormValues = {
    action: conflictMode,
    shouldIgnoreNullFields: ignoreNullFields ? 'true' : 'false',
    resourceType: destination.type,
  };

  if (isCleanDestination(destination)) {
    formValues.model = 'clean';
    if (destination.type === 'sequence_rows') {
      formValues.sequenceExternalId = destination.externalId;
    } else if (destination.type === 'well_data_layer') {
      formValues.wdlDataType = destination.wdlDataType;
    }
  } else if (isRAWDestination(destination)) {
    formValues.model = 'raw';
    formValues.rawDatabase = destination.database;
    formValues.rawTable = destination.table;
  } else if (isDataModelCentric(destination)) {
    // FDM generic form values
    formValues.instanceSpace = destination.instanceSpace;

    // FDM form values for data model
    formValues.model = destination.dataModel.externalId;
    formValues.dataModelSpace = destination.dataModel.space;
    formValues.dataModelVersion = destination.dataModel.version;

    // FDM form values for views
    formValues.viewExternalId = destination.dataModel.destinationType;

    // FDM form values for connection definitions
    formValues.connectionDefinitionProperty =
      destination.dataModel.destinationRelationshipFromType;
  }

  return formValues;
};

export const convertDestinationFormValuesToDestination = (
  values: TransformationDestinationFormValues
): Destination | undefined => {
  const {
    model,
    resourceType,

    // Clean form values
    sequenceExternalId,
    wdlDataType,

    // RAW form values
    rawDatabase,
    rawTable,

    // FDM generic form values
    instanceSpace,

    // FDM form values for data model
    dataModelSpace,
    dataModelVersion,

    // FDM form values for views
    viewExternalId,

    // FDM form values for connection definitions
    connectionDefinitionProperty,
  } = values;

  let destination: Destination | undefined = undefined;
  if (
    model === 'raw' &&
    isRAWResourceType(resourceType) &&
    rawDatabase &&
    rawTable
  ) {
    destination = {
      type: resourceType,
      database: rawDatabase,
      table: rawTable,
    };
  } else if (model === 'clean' && isCleanResourceType(resourceType)) {
    if (resourceType === 'sequence_rows') {
      if (sequenceExternalId) {
        destination = {
          type: resourceType,
          externalId: sequenceExternalId,
        };
      }
    } else if (resourceType === 'well_data_layer') {
      if (wdlDataType) {
        destination = {
          type: resourceType,
          wdlDataType,
        };
      }
    } else {
      destination = { type: resourceType };
    }
  } else if (model) {
    if (viewExternalId && dataModelSpace && dataModelVersion) {
      destination = {
        type: 'instances',
        instanceSpace,
        dataModel: {
          externalId: model,
          space: dataModelSpace,
          version: dataModelVersion,
          destinationType: viewExternalId,
          destinationRelationshipFromType: connectionDefinitionProperty,
        },
      };
    }
  }

  return destination;
};

export const validateTransformationDestinationForm = (
  values: TransformationDestinationFormValues,
  t: (key: ExtendedTranslationKeys<TranslationKeys>) => string
): FormikErrors<TransformationDestinationFormValues> => {
  const errors: FormikErrors<TransformationDestinationFormValues> = {};

  if (!values.model) {
    errors.model = t('validation-error-field-required');
  }

  if (!values.action) {
    errors.action = t('validation-error-field-required');
  }

  if (!values.resourceType) {
    errors.resourceType = t('validation-error-field-required');
  }

  if (values.model === 'raw') {
    if (!values.rawDatabase) {
      errors.rawDatabase = t('validation-error-field-required');
    }
    if (!values.rawTable) {
      errors.rawTable = t('validation-error-field-required');
    }
  } else if (values.model === 'clean') {
    if (values.resourceType === 'sequence_rows' && !values.sequenceExternalId) {
      errors.sequenceExternalId = t('validation-error-field-required');
    }
    if (values.resourceType === 'well_data_layer' && !values.wdlDataType) {
      errors.wdlDataType = t('validation-error-field-required');
    }
  } else if (values.model) {
    if (!values.dataModelSpace) {
      errors.dataModelSpace = t('validation-error-field-required');
    }
    if (!values.dataModelVersion) {
      errors.dataModelVersion = t('validation-error-field-required');
    }
    if (!values.viewExternalId) {
      errors.viewExternalId = t('validation-error-field-required');
    }
  }

  return errors;
};

const TransformationDestinationForm = ({
  formik,
}: TransformationDestinationFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, initialValues, resetForm, setFieldValue, values } = formik;

  const { data, isInitialLoading } = useModels();

  const models = useMemo(
    () =>
      flattenFDMModels(
        data?.pages.reduce(
          (accl, p) => [...accl, ...p.items],
          [] as DataModel[]
        ) || []
      ).sort((a, b) => a.externalId.localeCompare(b.externalId)),
    [data]
  );

  const selectedModel = useMemo(() => {
    return getSelectedModel(models, {
      externalId: values.model,
      space: values.dataModelSpace,
    });
  }, [models, values.model, values.dataModelSpace]);

  return (
    <Flex direction="column" gap={24}>
      <ModelFieldContainer>
        <DataModelFieldWrapper>
          <FormFieldSelect<TransformationDestinationFormValues['model']>
            error={errors.model}
            isRequired
            loading={isInitialLoading}
            onChange={(value) => {
              if (!value) {
                throw new Error('value is empty');
              }
              const { externalId: modelExternalId, space: modelSpace } =
                parseDataModelKey(value);
              const nextValues: TransformationDestinationFormValues = {
                model: modelExternalId,
                shouldIgnoreNullFields: initialValues.shouldIgnoreNullFields,
              };
              if (value === 'raw') {
                nextValues.resourceType = value;
              }
              if (value !== 'raw' && value !== 'clean') {
                const selectedModel = getSelectedModel(models, {
                  externalId: modelExternalId,
                  space: modelSpace,
                });
                if (selectedModel) {
                  nextValues.instanceSpace = selectedModel.space;
                  nextValues.dataModelSpace = selectedModel.space;
                }
                nextValues.resourceType = 'instances';
              }
              resetForm({ values: nextValues });
            }}
            optionFilterProp="label"
            placeholder={t(
              'transformation-details-form-data-model-field-placeholder'
            )}
            showSearch
            title={t('data-model')}
            value={
              values.model && values.dataModelSpace
                ? getDataModelKey({
                    externalId: values.model,
                    space: values.dataModelSpace,
                  })
                : values.model
            }
          >
            <OptGroup label={t('standard-data-model_other')} />
            <Option label={t('asset-hierarchy')} value="clean">
              <FormFieldSelectOption label={t('asset-hierarchy')} />
            </Option>
            <Option label={t('staging-area')} value="raw">
              <FormFieldSelectOption label={t('staging-area')} />
            </Option>
            {models.length && (
              <>
                <OptGroup label={t('custom-data-model_other')} />
                {models.map(({ externalId, name, space }) => (
                  <Option
                    key={getDataModelKey({ externalId, space })}
                    label={name ?? externalId}
                    value={getDataModelKey({ externalId, space })}
                  >
                    <FormFieldSelectOption
                      chipProps={{
                        icon: 'Folder',
                        label: space,
                      }}
                      description={externalId}
                      label={name ?? externalId}
                    />
                  </Option>
                ))}
              </>
            )}
          </FormFieldSelect>
        </DataModelFieldWrapper>
        {!!values.model &&
          values.model !== 'raw' &&
          values.model !== 'clean' && (
            <DataModelVersionWrapper>
              <FormFieldSelect<
                TransformationDestinationFormValues['dataModelVersion']
              >
                allowClear
                error={errors.dataModelVersion}
                isRequired
                onChange={(value) => {
                  setFieldValue('dataModelVersion', value);

                  // clear FDM form values for views
                  setFieldValue('viewExternalId', undefined);

                  // clear FDM form values for connection definitions
                  setFieldValue('connectionDefinitionProperty', undefined);
                }}
                options={selectedModel?.versions.map((modelVersion) => ({
                  label: modelVersion.version,
                  value: modelVersion.version,
                }))}
                placeholder={t('fdm-version-placeholder')}
                showSearch
                title={t('fdm-version')}
                value={values.dataModelVersion}
              />
            </DataModelVersionWrapper>
          )}
      </ModelFieldContainer>
      {values.model === 'raw' && <RawDestinationForm formik={formik} />}
      {values.model === 'clean' && <CleanDestinationForm formik={formik} />}
      {!!values.model && values.model !== 'raw' && values.model !== 'clean' && (
        <FDMDestinationForm formik={formik} />
      )}
      {!!values.model && values.resourceType && (
        <FormFieldSelect<TransformationDestinationFormValues['action']>
          error={errors.action}
          isRequired
          onChange={(value) => setFieldValue('action', value)}
          options={DESTINATION_ACTION_OPTIONS.filter(
            ({ value }) =>
              values.resourceType &&
              isDestinationActionSupported(value, values.resourceType)
          ).map((option) => ({
            ...option,
          }))}
          placeholder={t('action-placeholder')}
          title={t('action')}
          value={values.action}
        />
      )}
      {values.action === 'upsert' || values.action === 'update' ? (
        <FormFieldRadioGroup
          isRequired
          onChange={(value) => setFieldValue('shouldIgnoreNullFields', value)}
          options={[
            {
              details: `(${t('default')})`,
              label: t('keep-existing-values'),
              value: 'true',
            },
            { label: t('clear-existing-values'), value: 'false' },
          ]}
          title={t('for-incoming-null-values-on-updates-with-colon')}
          value={values.shouldIgnoreNullFields}
        />
      ) : (
        <></>
      )}
    </Flex>
  );
};

const ModelFieldContainer = styled(Flex).attrs({ gap: 16 })`
  width: 100%;
`;

const DataModelFieldWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const DataModelVersionWrapper = styled.div`
  width: 128px;
`;

export default TransformationDestinationForm;
