import { useTranslation } from '@transformations/common';
import TransformationDestinationForm, {
  convertDestinationFormValuesToDestination,
  getDestinationFormInitialValues,
  TransformationDestinationFormValues,
  validateTransformationDestinationForm,
} from '@transformations/components/transformation-destination-form';
import { useUpdateTransformation } from '@transformations/hooks';
import { Destination, TransformationRead } from '@transformations/types';
import { notification } from 'antd';
import { useFormik } from 'formik';

import { Flex, Modal, ModalProps } from '@cognite/cogs.js';

type TargetModalProps = Pick<ModalProps, 'onCancel' | 'visible'> & {
  transformation: TransformationRead;
};

const TargetModal = ({
  onCancel,
  transformation,
  visible,
}: TargetModalProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutateAsync: updateTransformation, isLoading } =
    useUpdateTransformation({
      onSuccess() {
        notification.success({
          message: t('notification-success-transformation-update'),
          key: 'target-update',
        });
        if (onCancel) {
          onCancel('cancelClick');
        }
      },
    });

  const handleValidate = (values: TransformationDestinationFormValues) => {
    return validateTransformationDestinationForm(values, t);
  };

  const destinationForm = useFormik<TransformationDestinationFormValues>({
    initialValues: {
      ...getDestinationFormInitialValues(transformation),
    },
    onSubmit: async () => {
      const { action, shouldIgnoreNullFields } = destinationForm.values;

      const destination: Destination | undefined =
        convertDestinationFormValuesToDestination(destinationForm.values);

      if (destination && action) {
        updateTransformation({
          id: transformation.id,
          update: {
            destination: {
              set: destination,
            },
            conflictMode: {
              set: action,
            },
            ignoreNullFields: {
              set: shouldIgnoreNullFields === 'false' ? false : true,
            },
          },
          updateMapping: true,
        }).then(() => {
          if (onCancel) {
            onCancel('cancelClick');
          }
        });
      }
    },
    validate: handleValidate,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Modal
      onCancel={onCancel}
      onOk={destinationForm.handleSubmit}
      okDisabled={isLoading}
      okText={isLoading ? t('saving') : t('save')}
      icon={isLoading ? 'Loader' : undefined}
      title={t('target-title')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <TransformationDestinationForm formik={destinationForm} />
      </Flex>
    </Modal>
  );
};

export default TargetModal;
