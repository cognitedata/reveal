import { useNavigate } from 'react-router-dom';

import { useTranslation } from '@flows/common';
import { useCreateWorkflow } from '@flows/hooks/workflows';
import { FormikErrors, useFormik } from 'formik';

import { createLink } from '@cognite/cdf-utilities';
import { Flex, Modal, InputExp } from '@cognite/cogs.js';

type Props = {
  onCancel: () => void;
  visible: boolean;
};

type CreateWorkflowFormValues = {
  externalId?: string;
  description?: string;
};

export const CreateWorkflowModal = ({ onCancel, visible }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate, isLoading } = useCreateWorkflow({
    onSuccess: (data) => {
      navigate(createLink(`/flows/${data.externalId}`));
    },
  });

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateWorkflowFormValues>({
      initialValues: {},
      onSubmit: (values) => {
        if (values.externalId) {
          mutate({
            externalId: values.externalId,
            description: values.description,
          });
        }
      },
      validate: (values) => {
        const errors: FormikErrors<CreateWorkflowFormValues> = {};
        if (!values.externalId) {
          errors.externalId = t('validation-error-field-required');
        }
        return errors;
      },
      validateOnBlur: false,
      validateOnChange: false,
    });

  return (
    <Modal
      onCancel={onCancel}
      cancelText={t('cancel')}
      okText={t('create')}
      onOk={handleSubmit}
      title={t('create-workflow')}
      visible={visible}
    >
      <Flex direction="column" gap={10}>
        <InputExp
          status={errors.externalId ? 'critical' : undefined}
          statusText={errors.externalId}
          label={{
            text: t('external-id'),
            info: undefined,
            required: true,
          }}
          disabled={isLoading}
          placeholder={t('enter-external-id')}
          value={values.externalId}
          onChange={(e) => {
            setFieldValue('externalId', e.target.value);
          }}
          fullWidth
        />
        <InputExp
          label={t('description')}
          disabled={isLoading}
          placeholder={t('enter-description')}
          value={values.description}
          onChange={(e) => {
            setFieldValue('description', e.target.value);
          }}
          fullWidth
        />
      </Flex>
    </Modal>
  );
};
