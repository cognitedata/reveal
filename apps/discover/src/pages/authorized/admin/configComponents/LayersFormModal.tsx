import { useTranslation } from 'react-i18next';

import { useFormik } from 'formik';
import omit from 'lodash/omit';
import { geospatial } from 'services/geospatial';
import { log } from 'utils/log';

import { FileReaderComp } from 'components/FileReader';
import { Modal } from 'components/Modal';
import { showErrorMessage } from 'components/Toast';

import { ConfigFormFields } from '../projectConfig';

import { CustomForm } from './elements';
import { LayerFormValues, FormModalProps } from './types';

const validate = (values: LayerFormValues) => {
  const errors: Record<string, string> = {};
  if (!values.id) {
    errors.id = 'Please enter a valid Id';
  }
  if (!values.name) {
    errors.name = 'Please enter a valid Name';
  }
  if (!values.layerSource) {
    errors.layerSource = 'Please select a source file';
  }
  return errors;
};

const getNewUniqueLayerId = (): string => {
  return `${String(Date.now())}_${String(Math.random()).slice(2, 7)}`;
};

export const LayersFormModal = ({
  onClose,
  onOk,
  metadataValue,
  value,
  mode,
}: FormModalProps) => {
  const { t } = useTranslation();

  const createNewLayer = (values: LayerFormValues) => {
    return geospatial
      .createLayer(values.layerSource, values.featureTypeId)
      .then(() => onOk(omit(values, 'layerSource')))
      .catch((error) => {
        showErrorMessage(
          error?.message || 'Could not create layer. Please check JSON file.'
        );
      });
  };

  const updateExistingLayer = (values: LayerFormValues) => {
    const newLayerId = getNewUniqueLayerId();
    const oldLayerId = values.featureTypeId;
    return geospatial
      .createLayer(values.layerSource, newLayerId)
      .then(() =>
        onOk({ ...omit(values, 'layerSource'), featureTypeId: newLayerId })
      )
      .then(() => geospatial.deleteFeatureType(oldLayerId || values.id))
      .catch((error) => {
        showErrorMessage(error);
        log('Could not update layer.');
      });
  };

  const onSubmit = (values: any) => {
    return mode === 'EDIT'
      ? updateExistingLayer(values)
      : createNewLayer(values);
  };

  const { values, errors, setFieldValue, submitForm, isSubmitting } =
    useFormik<LayerFormValues>({
      initialValues: (value as LayerFormValues) || {
        disabled: false,
        featureTypeId: getNewUniqueLayerId(),
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
        <FileReaderComp
          onRead={handleRead}
          error={errors.layerSource as string}
        />
      </CustomForm>
    </Modal>
  );
};
