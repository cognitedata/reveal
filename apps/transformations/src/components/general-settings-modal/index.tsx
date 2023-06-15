import { useTranslation } from '@transformations/common';
import TransformationDetailsForm, {
  TransformationDetailsFormValues,
  validateTransformationDetailsForm,
} from '@transformations/components/transformation-details-form';
import { useUpdateTransformation } from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';
import { notification } from 'antd';
import { useFormik } from 'formik';

import { Modal, ModalProps } from '@cognite/cogs.js';

type GeneralSettingsModalProps = {
  onCancel: () => void;
  transformation: TransformationRead;
  visible: ModalProps['visible'];
};

const GeneralSettingsModal = ({
  onCancel,
  transformation,
  visible,
}: GeneralSettingsModalProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutateAsync: updateTransformation } = useUpdateTransformation({
    onSuccess() {
      notification.success({
        message: t('notification-success-transformation-update'),
        key: 'general-settings-update',
      });
      onCancel();
    },
    onError(e) {
      notification.error({
        message: e.errorMessage ?? e.message?.toString(),
        key: 'general-settings-update',
      });
    },
  });

  const formik = useFormik<TransformationDetailsFormValues>({
    initialTouched: {
      externalId: true,
    },
    initialValues: {
      dataSetId: transformation.dataSetId,
      externalId: transformation.externalId,
      name: transformation.name,
    },
    onSubmit: (values) => {
      const dataSetIdParsed = values.dataSetId ? values.dataSetId : undefined;

      if (values.name && values.externalId) {
        updateTransformation({
          id: transformation.id,
          update: {
            name: {
              set: values.name,
            },
            externalId: {
              set: values.externalId,
            },
            dataSetId: dataSetIdParsed
              ? {
                  set: dataSetIdParsed,
                }
              : { setNull: true },
          },
        });
      }
    },
    validate: (values) => validateTransformationDetailsForm(values, t),
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Modal
      onOk={formik.handleSubmit}
      okText={t('save')}
      onCancel={onCancel}
      title={t('general')}
      visible={visible}
    >
      <TransformationDetailsForm formik={formik} />
    </Modal>
  );
};

export default GeneralSettingsModal;
