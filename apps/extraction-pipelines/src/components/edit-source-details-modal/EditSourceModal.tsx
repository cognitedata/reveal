import React from 'react';

import { Flex, InputExp, Modal, ModalProps } from '@cognite/cogs.js';
import { FormikErrors, useFormik } from 'formik';

import { useTranslation } from 'common';
import {
  BaseMQTTSource,
  MQTTSourceWithJobMetrics,
  useEditMQTTSource,
} from 'hooks/hostedExtractors';

type EditSourceDetailsModalProps = {
  onCancel: () => void;
  source: MQTTSourceWithJobMetrics;
  visible: ModalProps['visible'];
};

type EditMQTTSourceFormValues = Partial<Pick<BaseMQTTSource, 'host' | 'port'>>;

export const EditSourceDetailsModal = ({
  onCancel,
  source,
  visible,
}: EditSourceDetailsModalProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate: editMQTTSource } = useEditMQTTSource({
    onSuccess: () => {
      onCancel();
    },
  });

  const handleValidate = (
    values: EditMQTTSourceFormValues
  ): FormikErrors<EditMQTTSourceFormValues> => {
    const errors: FormikErrors<EditMQTTSourceFormValues> = {};

    if (!values.host) {
      errors.host = t('validation-error-field-required');
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<EditMQTTSourceFormValues>({
      initialValues: {
        host: source.host,
        port: source.port,
      },
      onSubmit: (values) => {
        if (values.host) {
          editMQTTSource({
            externalId: source.externalId,
            update: {
              host: {
                set: values.host,
              },
              port: values.port
                ? {
                    set: values.port,
                  }
                : {
                    setNull: true,
                  },
            },
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
      okText={t('edit')}
      onOk={handleSubmit}
      title={t('edit-source')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <InputExp
          clearable
          fullWidth
          label={{
            required: true,
            info: undefined,
            text: t('form-host-name'),
          }}
          onChange={(e) => setFieldValue('host', e.target.value)}
          placeholder={t('form-host-name-placeholder')}
          status={errors.host ? 'critical' : undefined}
          statusText={errors.host}
          value={values.host}
        />
        <InputExp
          clearable
          fullWidth
          label={{
            required: false,
            info: undefined,
            text: t('form-port'),
          }}
          onChange={(e) => setFieldValue('port', e.target.value)}
          placeholder={t('form-port-placeholder')}
          status={errors.port ? 'critical' : undefined}
          statusText={errors.port}
          value={values.port}
        />
      </Flex>
    </Modal>
  );
};
