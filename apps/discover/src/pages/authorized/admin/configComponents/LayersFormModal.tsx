import { useLayersCreateMutate } from 'domain/geospatial/internal/actions/useLayersCreateMutate';
import { useLayersUpdateMutate } from 'domain/geospatial/internal/actions/useLayersUpdateMutate';
import { useFeatureTypesListQuery } from 'domain/geospatial/internal/queries/useFeatureTypesListQuery';
import { LayerFormValues } from 'domain/geospatial/internal/types';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormik } from 'formik';
import isEmpty from 'lodash/isEmpty';

import { Select, OptionType, Detail } from '@cognite/cogs.js';

import { FileReaderComp } from 'components/FileReader';
import { Modal } from 'components/Modal';
import { showErrorMessage } from 'components/Toast';

import { ConfigFormFields } from '../projectConfig';

import { CustomForm } from './elements';
import { FormModalProps } from './types';
import { validate, getNewFeatureTypeId } from './utils';

export const LayersFormModal = ({
  onClose,
  onOk,
  metadataValue,
  value,
  mode,
}: FormModalProps) => {
  const { t } = useTranslation();
  const { data: featureTypes } = useFeatureTypesListQuery();
  const { mutate: createNewLayer } = useLayersCreateMutate(onOk);
  const { mutate: updateExistingLayer } = useLayersUpdateMutate(onOk);

  const onSubmit = (values: any) => {
    // for new source create new layer
    if (values.layerSource) {
      if (mode === 'EDIT') {
        return updateExistingLayer({
          ...values,
          featureTypeId: getNewFeatureTypeId(),
        });
      }
      return createNewLayer({
        ...values,
        featureTypeId: getNewFeatureTypeId(),
      });
    }
    // for exising feature type, just need to update featureTypeId
    return onOk(values);
  };

  const { values, errors, setFieldValue, submitForm, isSubmitting } =
    useFormik<LayerFormValues>({
      initialValues: (value as LayerFormValues) || {
        disabled: false,
      },
      validate,
      onSubmit,
      validateOnChange: false,
    });

  const handleRead = (fileContent: unknown) => {
    try {
      if (typeof fileContent === 'string') {
        setFieldValue('layerSource', JSON.parse(fileContent as string));
      }
    } catch (e) {
      showErrorMessage('Invalid JSON file.');
    }
  };

  const featureTypeOptions = useMemo(() => {
    if (!featureTypes) {
      return [];
    }
    return featureTypes.map((featureType) => ({
      label: featureType.externalId,
      value: featureType.externalId,
    }));
  }, [featureTypes]);

  return (
    <Modal
      halfWidth
      visible
      title={`${mode === 'EDIT' ? 'Edit' : 'New'} ${metadataValue?.label}`}
      onCancel={onClose}
      okText={mode === 'EDIT' ? t('Update') : t('Create')}
      okDisabled={isSubmitting}
      onOk={submitForm}
      className="project-config-modal-form"
    >
      <CustomForm direction="column" gap={16}>
        <ConfigFormFields
          metadataValue={metadataValue}
          values={values}
          onChange={setFieldValue}
          error={errors}
        />
        <>
          <Detail strong>Select Existing Feature Type</Detail>
          <Select
            label="Select"
            id="featureTypeId"
            inputId="featureTypeId"
            placeholder="Select Feature Type"
            value={
              values.featureTypeId
                ? { label: values.featureTypeId, value: values.featureTypeId }
                : undefined
            }
            isClearable
            onChange={(option: OptionType<string>) => {
              if (isEmpty(option)) {
                setFieldValue('featureTypeId', undefined);
              } else {
                setFieldValue('featureTypeId', option.value);
              }
            }}
            options={featureTypeOptions}
          />
        </>
        <FileReaderComp
          onRead={handleRead}
          error={errors.layerSource as string}
        />
      </CustomForm>
    </Modal>
  );
};
