import { useState } from 'react';

import { Body, Button, Flex, Modal } from '@cognite/cogs.js';
import { useFormik } from 'formik';

import { useTranslation } from 'common';

import {
  CreateMQTTSource,
  CreateMQTTSourceFormValues,
  MQTT_SOURCE_TYPE_OPTIONS,
  validateCreateMQTTSourceForm,
} from './CreateMQTTSource';
import {
  CreateMQTTDestination,
  CreateMQTTDestinationFormValues,
  MQTT_DESTINATION_TYPE_OPTIONS,
  validateCreateMQTTDestinationForm,
} from './CreateMQTTDestination';
import {
  CreateMQTTJob,
  CreateMQTTJobFormValues,
  validateCreateMQTTJobForm,
} from './CreateMQTTJob';
import {
  useCreateMQTTDestination,
  useCreateMQTTJob,
  useCreateMQTTSource,
} from 'hooks/hostedExtractors';
import { createLink } from '@cognite/cdf-utilities';
import { useNavigate } from 'react-router-dom';

type ConnectToHostedExtractorModalProps = {
  onCancel: VoidFunction;
  visible: boolean;
};

const CONNECT_TO_HOSTED_EXTRACTOR_MODAL_STEPS = [
  'create-source',
  'create-destination',
  'create-job',
] as const;

type ConnectToHostedExtractorModalStep =
  typeof CONNECT_TO_HOSTED_EXTRACTOR_MODAL_STEPS[number];

export const ConnectToHostedExtractorModal = ({
  onCancel,
  visible,
}: ConnectToHostedExtractorModalProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [modalStep, setModalStep] =
    useState<ConnectToHostedExtractorModalStep>('create-source');

  const { mutateAsync: createMQTTSource } = useCreateMQTTSource();
  const { mutateAsync: createMQTTDestination } = useCreateMQTTDestination();
  const { mutateAsync: createMQTTJob } = useCreateMQTTJob();

  const handleSubmitModal = async () => {
    const sourceValues = createMQTTSourceForm.values;
    const destinationValues = createMQTTDestinationForm.values;
    const jobValues = createMQTTJobForm.values;

    if (
      sourceValues.externalId &&
      sourceValues.type &&
      sourceValues.username &&
      sourceValues.password &&
      sourceValues.host &&
      destinationValues.externalId &&
      destinationValues.type &&
      destinationValues.clientId &&
      destinationValues.clientSecret &&
      jobValues.topicFilters
    ) {
      const source = await createMQTTSource({
        externalId: sourceValues.externalId,
        type: sourceValues.type,
        username: sourceValues.username,
        password: sourceValues.password,
        host: sourceValues.host,
        port: sourceValues.port,
      });

      const destination = await createMQTTDestination({
        externalId: destinationValues.externalId,
        type: destinationValues.type,
        clientId: destinationValues.clientId,
        clientSecret: destinationValues.clientSecret,
      });

      await Promise.all(
        jobValues.topicFilters.map((topicFilter) => {
          return createMQTTJob({
            sourceId: source.externalId,
            destinationId: destination.externalId,
            externalId: `${source.externalId}-${destination.externalId}-${topicFilter}`,
            format: {
              type: 'cognite',
            },
            topicFilter,
          });
        })
      );

      navigate(createLink(`/extpipes`, { tab: 'hosted' }));
    }
  };

  const goNextStep = (): void => {
    switch (modalStep) {
      case 'create-source':
        setModalStep('create-destination');
        break;
      case 'create-destination':
        setModalStep('create-job');
        break;
      case 'create-job':
        handleSubmitModal();
        break;
    }
  };

  const goPrevStep = () => {
    switch (modalStep) {
      case 'create-source':
        break;
      case 'create-destination':
        setModalStep('create-source');
        break;
      case 'create-job':
        setModalStep('create-destination');
        break;
    }
  };

  const createMQTTSourceForm = useFormik<CreateMQTTSourceFormValues>({
    initialValues: {
      type: MQTT_SOURCE_TYPE_OPTIONS[0].value,
    },
    onSubmit: goNextStep,
    validate: (values) => validateCreateMQTTSourceForm(values, t),
    validateOnBlur: false,
    validateOnChange: false,
  });

  const createMQTTDestinationForm = useFormik<CreateMQTTDestinationFormValues>({
    initialValues: {
      type: MQTT_DESTINATION_TYPE_OPTIONS[0].value,
    },
    onSubmit: goNextStep,
    validate: (values) => validateCreateMQTTDestinationForm(values, t),
    validateOnBlur: false,
    validateOnChange: false,
  });

  const createMQTTJobForm = useFormik<CreateMQTTJobFormValues>({
    initialValues: {},
    onSubmit: goNextStep,
    validate: (values) => validateCreateMQTTJobForm(values, t),
    validateOnBlur: false,
    validateOnChange: false,
  });

  const onNextButtonClick = (): void => {
    switch (modalStep) {
      case 'create-source':
        createMQTTSourceForm.handleSubmit();
        break;
      case 'create-destination':
        createMQTTDestinationForm.handleSubmit();
        break;
      case 'create-job':
        createMQTTJobForm.handleSubmit();
        break;
    }
  };

  const currentStepIndex = CONNECT_TO_HOSTED_EXTRACTOR_MODAL_STEPS.findIndex(
    (step) => step === modalStep
  );
  const totalStepCount = CONNECT_TO_HOSTED_EXTRACTOR_MODAL_STEPS.length;

  return (
    <Modal
      visible={visible}
      subtitle={t(`${modalStep}-step-subtitle`)}
      chip="Settings"
      title={t('connect-cdf-to-mqtt-broker')}
      onCancel={onCancel}
      hideFooter
    >
      <Flex direction="column" gap={16}>
        {modalStep === 'create-source' && (
          <CreateMQTTSource formik={createMQTTSourceForm} />
        )}
        {modalStep === 'create-destination' && (
          <CreateMQTTDestination formik={createMQTTDestinationForm} />
        )}
        {modalStep === 'create-job' && (
          <CreateMQTTJob formik={createMQTTJobForm} />
        )}
        <Flex justifyContent="space-between">
          <Flex alignItems="center" gap={8}>
            {currentStepIndex > 0 && (
              <Button
                aria-label={'Go back one step'}
                icon="ArrowLeft"
                onClick={goPrevStep}
                type="secondary"
              />
            )}
            <Body level={3} strong muted>
              {t('step-count', {
                current: currentStepIndex + 1,
                max: totalStepCount,
              })}
            </Body>
          </Flex>

          <Flex gap={8}>
            <Button onClick={onCancel} type="ghost">
              {t('cancel')}
            </Button>
            <Button onClick={onNextButtonClick} type="primary">
              {currentStepIndex === totalStepCount - 1
                ? t('create')
                : t('next')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
};
