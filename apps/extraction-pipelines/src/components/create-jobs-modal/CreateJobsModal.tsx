import React, { useState } from 'react';
import {
  Body,
  Button,
  Colors,
  Flex,
  InputExp,
  Modal,
  ModalProps,
} from '@cognite/cogs.js';
import { Select, notification } from 'antd';
import { FormikErrors, useFormik } from 'formik';
import styled from 'styled-components';

import { useTranslation } from 'common';
import FormFieldRadioGroup from 'components/form-field-radio-group/FormFieldRadioGroup';
import {
  MQTTDestinationType,
  MQTTFormat,
  MQTTSourceWithJobMetrics,
  useCreateMQTTDestination,
  useCreateMQTTJob,
  useMQTTDestinations,
} from 'hooks/hostedExtractors';
import FormFieldWrapper from 'components/form-field-wrapper/FormFieldWrapper';

const MQTT_DESTINATION_TYPE_OPTIONS: {
  label: string;
  value: MQTTDestinationType;
}[] = [
  {
    label: 'Datapoints',
    value: 'datapoints',
  },
];

type CreateJobsFormDestinationOptionType =
  | 'use-existing'
  | 'current-user'
  | 'client-credentials';

type CreateJobsFormValues = {
  topicFilters?: string[];
  destinationOption: CreateJobsFormDestinationOptionType;
  selectedDestinationExternalId?: string;
  destinationExternalIdToCreate?: string;
  clientId?: string;
  clientSecret?: string;
  type?: MQTTDestinationType;
  formatField?: MQTTFormat;
};

type CreateJobsModalProps = {
  onCancel: () => void;
  source: MQTTSourceWithJobMetrics;
  visible: ModalProps['visible'];
};

export const CreateJobsModal = ({
  onCancel,
  source,
  visible,
}: CreateJobsModalProps): JSX.Element => {
  const { t } = useTranslation();

  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');

  const { data: destinations } = useMQTTDestinations();

  const { mutateAsync: createDestination } = useCreateMQTTDestination();
  const { mutateAsync: createJob } = useCreateMQTTJob({
    onSuccess: () => {
      notification.success({
        message: t('notification-success-job-create'),
        key: 'delete-source',
      });
      onCancel();
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        description: e.message,
        key: 'delete-source',
      });
    },
  });

  const handleValidate = (
    values: CreateJobsFormValues
  ): FormikErrors<CreateJobsFormValues> => {
    const errors: FormikErrors<CreateJobsFormValues> = {};

    if (!values.topicFilters || values.topicFilters.length === 0) {
      errors.topicFilters = t('validation-error-field-required');
    }

    if (values.destinationOption === 'use-existing') {
      if (!values.selectedDestinationExternalId) {
        errors.selectedDestinationExternalId = t(
          'validation-error-field-required'
        );
      }
    } else if (values.destinationOption === 'client-credentials') {
      if (!values.destinationExternalIdToCreate) {
        errors.destinationExternalIdToCreate = t(
          'validation-error-field-required'
        );
      }
      if (!values.clientId) {
        errors.clientId = t('validation-error-field-required');
      }
      if (!values.clientSecret) {
        errors.clientSecret = t('validation-error-field-required');
      }
      if (!values.type) {
        errors.type = t('validation-error-field-required');
      }
    } else {
      if (!values.destinationExternalIdToCreate) {
        errors.destinationExternalIdToCreate = t(
          'validation-error-field-required'
        );
      }
      if (!values.type) {
        errors.type = t('validation-error-field-required');
      }
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateJobsFormValues>({
      initialValues: {
        destinationOption: 'use-existing',
        type: 'datapoints',
      },
      onSubmit: async (values) => {
        if (!values.topicFilters || values.topicFilters.length === 0) {
          return;
        }

        let destinationExternalId: string | undefined = undefined;
        if (
          values.destinationOption === 'use-existing' &&
          values.selectedDestinationExternalId
        ) {
          destinationExternalId = values.selectedDestinationExternalId;
        } else if (
          values.destinationOption === 'client-credentials' &&
          values.clientId &&
          values.clientSecret &&
          values.destinationExternalIdToCreate &&
          values.type
        ) {
          const destination = await createDestination({
            credentials: {
              clientId: values.clientId,
              clientSecret: values.clientSecret,
            },
            externalId: values.destinationExternalIdToCreate,
            type: values.type,
          });
          destinationExternalId = destination.externalId;
        } else if (
          values.destinationOption === 'current-user' &&
          values.destinationExternalIdToCreate &&
          values.type
        ) {
          const destination = await createDestination({
            credentials: {
              tokenExchange: true,
            },
            externalId: values.destinationExternalIdToCreate,
            type: values.type,
          });
          destinationExternalId = destination.externalId;
        }

        if (destinationExternalId) {
          await Promise.all(
            values.topicFilters.map((topicFilter) => {
              return createJob({
                destinationId: destinationExternalId!,
                externalId: `${source.externalId}-${values.selectedDestinationExternalId}-${topicFilter}`,
                format: {
                  type: 'cognite',
                },
                sourceId: source.externalId,
                topicFilter,
              });
            })
          );
        }
      },
      validate: handleValidate,
      validateOnBlur: false,
      validateOnChange: false,
    });

  const handleAddTopicFilter = (): void => {
    if (
      !values.topicFilters ||
      !values.topicFilters.includes(tempTopicFilterInput)
    ) {
      setFieldValue(
        'topicFilters',
        values.topicFilters?.concat(tempTopicFilterInput) ?? [
          tempTopicFilterInput,
        ]
      );
      setTempTopicFilterInput('');
    }
  };

  const handleDeleteTopicFilter = (filter: string): void => {
    setFieldValue(
      'topicFilters',
      values.topicFilters?.filter((f) => f !== filter) ?? []
    );
  };

  const formatField: MQTTFormat[] = [
    {
      type: 'cognite',
    },
    {
      type: 'siemens',
    },
    {
      type: 'tmc',
    },
    {
      type: 'rockwell',
    },
  ];

  const formatFieldOptions = formatField.map(({ type }) => ({
    label: `${
      type === 'tmc' ? 'TMC' : type.charAt(0).toUpperCase() + type.slice(1)
    }: "${type}"`,
    value: type,
  }));

  return (
    <Modal
      onCancel={onCancel}
      okText={t('done')}
      onOk={handleSubmit}
      title={t('add-topic-filters')}
      visible={visible}
    >
      <Flex direction="column" gap={16}>
        <Flex direction="column" gap={8}>
          <Flex gap={8} style={{ width: '100%' }}>
            <div style={{ flex: 1 }}>
              <InputExp
                label={{
                  info: t('form-topic-filters-info'),
                  required: true,
                  text: t('topic-filter_other'),
                }}
                fullWidth
                onChange={(e) => setTempTopicFilterInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !!tempTopicFilterInput) {
                    handleAddTopicFilter();
                  }
                }}
                status={errors.topicFilters ? 'critical' : undefined}
                statusText={errors.topicFilters}
                placeholder={t('form-topic-filters-placeholder')}
                value={tempTopicFilterInput}
              />
            </div>
            <div style={{ marginTop: 27 }}>
              <Button
                disabled={
                  !tempTopicFilterInput ||
                  values.topicFilters?.includes(tempTopicFilterInput)
                }
                onClick={handleAddTopicFilter}
                type="primary"
              >
                {t('add')}
              </Button>
            </div>
          </Flex>
          {values.topicFilters?.map((filter) => (
            <TopicFilterContainer>
              <Body level={2}>{filter}</Body>
              <Button
                icon="Delete"
                onClick={() => handleDeleteTopicFilter(filter)}
                size="small"
                type="ghost"
              />
            </TopicFilterContainer>
          ))}
          <FormFieldWrapper isRequired title={t('format-field')}>
            <Select
              onChange={(_, e) => setFieldValue('formatField', e)}
              options={formatFieldOptions}
              placeholder={t('select-format')}
              value={values.formatField}
              aria-placeholder="Select format"
            />
          </FormFieldWrapper>
        </Flex>
        <FormFieldRadioGroup
          direction="column"
          isRequired
          onChange={(value) => setFieldValue('destinationOption', value)}
          options={[
            { label: t('use-existing-destination'), value: 'use-existing' },
            {
              label: t('create-new-destination-as-current-user'),
              value: 'current-user',
            },
            {
              label: t('create-new-destination-with-client-credentials'),
              value: 'client-credentials',
            },
          ]}
          title={t('destination-option')}
          value={values.destinationOption}
        />
        {values.destinationOption === 'use-existing' ? (
          <FormFieldWrapper
            isRequired
            error={errors.selectedDestinationExternalId}
            title={t('destination')}
          >
            <Select
              showSearch
              onChange={(value) => {
                setFieldValue('selectedDestinationExternalId', value);
              }}
              options={destinations?.map(({ externalId }) => ({
                label: externalId,
                value: externalId,
              }))}
              placeholder={t('select-destination-placeholder')}
              value={values.selectedDestinationExternalId}
            />
          </FormFieldWrapper>
        ) : (
          <>
            <InputExp
              clearable
              fullWidth
              label={{
                info: undefined,
                required: true,
                text: t('destination-external-id'),
              }}
              onChange={(e) =>
                setFieldValue('destinationExternalIdToCreate', e.target.value)
              }
              status={
                errors.destinationExternalIdToCreate ? 'critical' : undefined
              }
              statusText={errors.destinationExternalIdToCreate}
              placeholder={t('destination-external-id-placeholder')}
              value={values.destinationExternalIdToCreate}
            />
            {values.destinationOption === 'client-credentials' && (
              <>
                <InputExp
                  clearable
                  fullWidth
                  label={{
                    required: true,
                    info: undefined,
                    text: t('form-client-id'),
                  }}
                  onChange={(e) => setFieldValue('clientId', e.target.value)}
                  placeholder={t('form-client-id-placeholder')}
                  status={errors.clientId ? 'critical' : undefined}
                  statusText={errors.clientId}
                  value={values.clientId}
                />
                <InputExp
                  clearable
                  fullWidth
                  label={{
                    required: true,
                    info: undefined,
                    text: t('form-client-secret'),
                  }}
                  onChange={(e) =>
                    setFieldValue('clientSecret', e.target.value)
                  }
                  placeholder={t('form-client-secret-placeholder')}
                  status={errors.clientSecret ? 'critical' : undefined}
                  statusText={errors.clientSecret}
                  value={values.clientSecret}
                />
              </>
            )}
            <FormFieldWrapper isRequired title={t('form-destination-type')}>
              <Select
                onChange={(e) => setFieldValue('type', e)}
                options={MQTT_DESTINATION_TYPE_OPTIONS}
                placeholder={t('form-destination-type-placeholder')}
                value={values.type}
              />
            </FormFieldWrapper>
          </>
        )}
      </Flex>
    </Modal>
  );
};

const TopicFilterContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--interactive--disabled']};
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  padding: 4px 4px 4px 12px;
`;
