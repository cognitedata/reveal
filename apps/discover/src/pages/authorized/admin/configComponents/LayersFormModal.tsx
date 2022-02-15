import { useTranslation } from 'react-i18next';

import { useFormik } from 'formik';
import omit from 'lodash/omit';
import { geospatialV1 } from 'services/geospatial/geospatialV1';

import { FileReaderComp } from 'components/file-reader';
import { Modal } from 'components/modal';
import { showErrorMessage } from 'components/toast';

import { CustomComponent, ConfigFormFields } from '../projectConfig';

import { CustomForm } from './elements';

const validate = (values: Record<string, unknown>) => {
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

export const LayersFormModal: CustomComponent = ({
  onClose,
  onOk,
  metadataValue,
}) => {
  const { t } = useTranslation();

  const onSubmit = (values: any) => {
    return geospatialV1
      .createLayer(values.layerSource, values.id)
      .then(() => {
        onOk(omit(values, 'layerSource'));
        onClose();
      })
      .catch((error) => {
        showErrorMessage(
          error?.message || 'Could not create layer. Please check JSON file.'
        );
      });
  };

  const { values, errors, setFieldValue, submitForm, isSubmitting } =
    useFormik<{ layerSource?: object; disabled: boolean }>({
      initialValues: { disabled: false },
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
      title={`New ${metadataValue?.label}`}
      onCancel={onClose}
      okText={t('Create')}
      okDisabled={isSubmitting}
      onOk={submitForm}
      className="project-config-modal-form"
    >
      <CustomForm direction="column" gap={16}>
        <ConfigFormFields
          metadataValue={metadataValue}
          value={values}
          onChange={setFieldValue}
          error={errors}
        />
        <FileReaderComp onRead={handleRead} error={errors.layerSource} />
      </CustomForm>
    </Modal>
  );
};
