import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '@transformations/common';
import TransformationDestinationForm, {
  convertDestinationFormValuesToDestination,
  TransformationDestinationFormValues,
  validateTransformationDestinationForm,
} from '@transformations/components/transformation-destination-form';
import TransformationDetailsForm, {
  TransformationDetailsFormValues,
  validateTransformationDetailsForm,
} from '@transformations/components/transformation-details-form';
import { useCreateTransformation } from '@transformations/hooks';
import {
  Destination,
  TransformationCreate,
  TransformationCreateError,
} from '@transformations/types';
import { createInternalLink } from '@transformations/utils';
import { notification } from 'antd';
import { useFormik } from 'formik';

import { Modal, ModalProps } from '@cognite/cogs.js';

type CreateTransformationModalProps = Pick<
  ModalProps,
  'onCancel' | 'visible'
> & {};

type CreateTransformationModalStep = 'details' | 'destination';

const CreateTransformationModal = ({
  onCancel,
  visible,
}: CreateTransformationModalProps): JSX.Element => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [step, setStep] = useState<CreateTransformationModalStep>('details');

  const {
    mutateAsync: createTransformation,
    reset,
    isLoading,
  } = useCreateTransformation({
    onError(e) {
      handleError(e);
    },
  });

  const onCreateClick = async (transformation: TransformationCreate) => {
    const { name, id } = await createTransformation({
      transformation,
      addMapping: true,
    });

    notification.success({
      message: t('create-transformation-success', { name }),
      key: 'table-delete',
    });
    navigate(createInternalLink(`${id}`));
  };

  const errorMsg: { [key: number]: string } = {
    409: t('create-transformation-error-externalid-already-exists'),
  };

  const handleError = ({
    status,
    errorMessage,
    requestId,
    duplicated,
  }: TransformationCreateError) => {
    const error = status ? errorMsg[status] : undefined;
    notification.error({
      key: 'transformation-create',
      message: t('create-transformation-error-generic', {
        name: detailsForm.values.name,
      }),
      description: status && (
        <>
          <p>{t('create-transformation-error-code', { code: status })}</p>
          <p>
            {error ||
              t('create-transformation-error-message', { error: errorMessage })}
          </p>
          <p>{t('create-transformation-error-request-id', { requestId })}</p>
        </>
      ),
    });
    reset();
    if (duplicated?.find((e) => Object.keys(e).includes('externalId'))) {
      detailsForm.setFieldError('externalId', error);
      setStep('details');
    }
  };

  const handleValidateDetailsForm = (
    values: TransformationDetailsFormValues
  ) => {
    return validateTransformationDetailsForm(values, t);
  };

  const handleValidateDestinationForm = (
    values: TransformationDestinationFormValues
  ) => {
    return validateTransformationDestinationForm(values, t);
  };

  const detailsForm = useFormik<TransformationDetailsFormValues>({
    initialValues: {},
    onSubmit: () => {
      setStep('destination');
    },
    validate: handleValidateDetailsForm,
    validateOnBlur: false,
    validateOnChange: false,
  });

  const destinationForm = useFormik<TransformationDestinationFormValues>({
    initialValues: {
      shouldIgnoreNullFields: 'true',
    },
    onSubmit: () => {
      const { dataSetId, externalId, name } = detailsForm.values;
      const { action, shouldIgnoreNullFields } = destinationForm.values;

      const destination: Destination | undefined =
        convertDestinationFormValuesToDestination(destinationForm.values);

      if (externalId && name && destination && action) {
        onCreateClick({
          name,
          externalId,
          dataSetId,
          destination,
          conflictMode: action,
          ignoreNullFields: shouldIgnoreNullFields === 'false' ? false : true,
        });
      }
    },
    validate: handleValidateDestinationForm,
    validateOnBlur: false,
    validateOnChange: false,
  });

  const handleSubmit = () => {
    if (step === 'details') {
      detailsForm.handleSubmit();
    } else {
      destinationForm.handleSubmit();
    }
  };

  const getOkText = () => {
    if (step === 'details') {
      return t('next-step');
    } else if (isLoading) {
      return t('creating');
    } else {
      return t('create');
    }
  };

  return (
    <Modal
      title={t('create-transformation')}
      subtitle={detailsForm.values.name}
      icon={isLoading ? 'Loader' : undefined}
      visible={visible}
      onCancel={onCancel}
      cancelText={t('cancel')}
      onOk={handleSubmit}
      okDisabled={isLoading}
      okText={getOkText()}
      additionalActions={
        step === 'destination'
          ? [
              {
                icon: 'ArrowLeft',
                iconPlacement: 'left',
                children: '',
                onClick: () => setStep('details'),
              },
            ]
          : undefined
      }
    >
      {step === 'details' ? (
        <TransformationDetailsForm formik={detailsForm} />
      ) : (
        <TransformationDestinationForm formik={destinationForm} />
      )}
    </Modal>
  );
};

export default CreateTransformationModal;
