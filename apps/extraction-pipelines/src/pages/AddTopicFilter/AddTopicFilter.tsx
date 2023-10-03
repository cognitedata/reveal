import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { notification, Select } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import {
  Body,
  Button,
  Colors,
  Divider,
  Flex,
  Heading,
  InputExp,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import FormFieldRadioGroup from '../../components/form-field-radio-group/FormFieldRadioGroup';
import FormFieldWrapper from '../../components/form-field-wrapper/FormFieldWrapper';
import { BottomBar, TopBar } from '../../components/ToolBars';
import {
  MQTTFormat,
  useCreateMQTTDestination,
  useCreateMQTTJob,
  useMQTTDestinations,
  useMQTTSourceWithMetrics,
} from '../../hooks/hostedExtractors';

import { Section } from './Section';
import { TopicFilterGuide } from './TopicFilterGuide';
import { CreateJobsFormValues, ExpandOptions } from './types';

export const AddTopicFilter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedOption, setExpandedOption] = useState(ExpandOptions.None);

  const onCancel = useCallback(() => navigate(-1), [navigate]);
  const { externalId: sourceExternalId } = useParams();

  const { data: source } = useMQTTSourceWithMetrics(sourceExternalId);

  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');

  const { data: destinations } = useMQTTDestinations();

  const sourceTopicFilters = source?.jobs.map((job) => {
    return job.config.topicFilter;
  });

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
      errors.topicFilters = t(
        tempTopicFilterInput
          ? 'validation-error-topic-filter-click-add-only'
          : 'validation-error-topic-filter-required'
      );
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
    } else {
      if (!values.destinationExternalIdToCreate) {
        errors.destinationExternalIdToCreate = t(
          'validation-error-field-required'
        );
      }
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateJobsFormValues>({
      initialValues: {
        destinationOption: 'use-existing',
      },
      onSubmit: async (val) => {
        if (!val.topicFilters || val.topicFilters.length === 0) {
          return;
        }

        let destinationExternalId: string | undefined = undefined;
        if (
          val.destinationOption === 'use-existing' &&
          val.selectedDestinationExternalId
        ) {
          destinationExternalId = val.selectedDestinationExternalId;
        } else if (
          val.destinationOption === 'client-credentials' &&
          val.clientId &&
          val.clientSecret &&
          val.destinationExternalIdToCreate
        ) {
          const destination = await createDestination({
            credentials: {
              clientId: val.clientId,
              clientSecret: val.clientSecret,
            },
            externalId: val.destinationExternalIdToCreate,
          });
          destinationExternalId = destination.externalId;
        } else if (
          val.destinationOption === 'current-user' &&
          val.destinationExternalIdToCreate
        ) {
          const destination = await createDestination({
            credentials: {
              tokenExchange: true,
            },
            externalId: val.destinationExternalIdToCreate,
          });
          destinationExternalId = destination.externalId;
        }

        if (destinationExternalId && source) {
          await Promise.all(
            val.topicFilters.map((topicFilter) => {
              return createJob({
                destinationId: destinationExternalId!,
                externalId: `${source?.externalId}-${val.selectedDestinationExternalId}-${topicFilter}`,
                format: {
                  type: val.format ?? 'cognite',
                },
                sourceId: source?.externalId,
                config: {
                  topicFilter,
                },
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
      type: 'rockwell',
    },
    {
      type: 'value',
    },
    {
      type: 'sparkplug',
    },
    {
      type: 'custom',
    },
  ];

  const formatFieldOptions = formatField.map(({ type }) => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    label: t(`form-format-option-${type}`),
    value: type,
  }));

  return (
    <GridContainer>
      <StyledTopBar title={t('back')} onClick={onCancel} />
      <TopicFilterContent>
        <Heading level={3}>{t('form-setup-stream')}</Heading>
        <SectionContainer>
          <Section
            title={t('form-step-1-x', { step: t('add-topic-filter') })}
            subtitle={t('form-add-topic-filter-detail')}
            expandOption={ExpandOptions.TopicFilters}
            setExpandOption={setExpandedOption}
          ></Section>
          <Flex gap={16} direction="column" style={{ width: '100%' }}>
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
                  onKeyDown={(e) => {
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
                    values.topicFilters?.includes(tempTopicFilterInput) ||
                    sourceTopicFilters?.includes(tempTopicFilterInput)
                  }
                  onClick={handleAddTopicFilter}
                  type="primary"
                >
                  {t('add')}
                </Button>
              </div>
            </Flex>
            <Flex style={{ width: '100%' }} direction="column" gap={8}>
              {values.topicFilters?.map((filter) => (
                <TopicFilterContainer>
                  <Body size="medium">{filter}</Body>
                  <Button
                    icon="Delete"
                    onClick={() => handleDeleteTopicFilter(filter)}
                    size="small"
                    type="ghost"
                  />
                </TopicFilterContainer>
              ))}
            </Flex>
          </Flex>
        </SectionContainer>
        <Divider />
        <SectionContainer>
          <Section
            title={t('form-step-2-x', { step: t('form-choose-format') })}
            subtitle={t('form-choose-format-detail')}
            expandOption={ExpandOptions.Format}
            setExpandOption={setExpandedOption}
          ></Section>
          <FormFieldWrapper isRequired title={t('form-message-format')}>
            <Select
              onChange={(e) => setFieldValue('format', e)}
              options={formatFieldOptions}
              placeholder={t('select-format')}
              value={values.format}
              aria-placeholder={t('select-format')}
            />
          </FormFieldWrapper>
        </SectionContainer>
        <Divider />
        <SectionContainer>
          <Section
            title={t('form-step-3-x', {
              step: t('form-select-authenticate-sync'),
            })}
            subtitle={t('form-select-authenticate-detail')}
            expandOption={ExpandOptions.Sync}
            setExpandOption={setExpandedOption}
          ></Section>
          <FormFieldRadioGroup
            direction="column"
            isRequired
            onChange={(value) => setFieldValue('destinationOption', value)}
            options={[
              {
                label: t('form-use-existing-sync'),
                value: 'use-existing',
                content: (
                  <RadioButtonContentContainer>
                    <FormFieldWrapper
                      isRequired
                      error={errors.selectedDestinationExternalId}
                      title={t('form-existing-syncs')}
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
                        placeholder={t('form-existing-syncs-placeholder')}
                        value={values.selectedDestinationExternalId}
                      />
                    </FormFieldWrapper>
                  </RadioButtonContentContainer>
                ),
              },
              {
                label: t('form-create-new-sync-current-user'),
                value: 'current-user',
                content: (
                  <RadioButtonContentContainer>
                    <InputExp
                      clearable
                      fullWidth
                      label={{
                        info: undefined,
                        required: true,
                        text: t('form-sink-external-id'),
                      }}
                      onChange={(e) =>
                        setFieldValue(
                          'destinationExternalIdToCreate',
                          e.target.value
                        )
                      }
                      status={
                        errors.destinationExternalIdToCreate
                          ? 'critical'
                          : undefined
                      }
                      statusText={errors.destinationExternalIdToCreate}
                      placeholder={t('form-sink-external-id-placeholder')}
                      value={values.destinationExternalIdToCreate}
                    />
                  </RadioButtonContentContainer>
                ),
              },
              {
                label: t('form-create-new-sync-client-credentials'),
                value: 'client-credentials',
                content: (
                  <RadioButtonContentContainer gap={16}>
                    <InputExp
                      clearable
                      fullWidth
                      label={{
                        info: undefined,
                        required: true,
                        text: t('form-sink-external-id'),
                      }}
                      onChange={(e) =>
                        setFieldValue(
                          'destinationExternalIdToCreate',
                          e.target.value
                        )
                      }
                      status={
                        errors.destinationExternalIdToCreate
                          ? 'critical'
                          : undefined
                      }
                      statusText={errors.destinationExternalIdToCreate}
                      placeholder={t('form-sink-external-id-placeholder')}
                      value={values.destinationExternalIdToCreate}
                    />
                    <InputExp
                      clearable
                      fullWidth
                      label={{
                        required: true,
                        info: undefined,
                        text: t('form-sink-client-id'),
                      }}
                      onChange={(e) =>
                        setFieldValue('clientId', e.target.value)
                      }
                      placeholder={t('form-sink-client-id-placeholder')}
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
                  </RadioButtonContentContainer>
                ),
              },
            ]}
            value={values.destinationOption}
          />
        </SectionContainer>
      </TopicFilterContent>
      <StyledBottomBar
        title={t('field-is-mandatory')}
        onSubmit={handleSubmit}
      />
      <StyledTopicFilterGuide
        expandedOption={expandedOption}
        onChange={setExpandedOption}
      />
    </GridContainer>
  );
};

const RadioButtonContentContainer = styled(Flex)`
  align-self: stretch;
  padding-left: 28px;
  flex-direction: column;
`;

const TopicFilterContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--interactive--disabled']};
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  padding: 4px 4px 4px 12px;
`;

const SectionContainer = styled(Flex)`
  gap: 24px;
  flex-direction: column;
  width: 100%;
`;

const TopicFilterContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 40px 56px 108px;
  align-items: flex-start;
  flex: 1 1 0;
  gap: 32px;
  background: ${Colors['surface--muted']};
  overflow-y: auto;
  grid-column: first / second;
  grid-row: middle / bottom;
`;

const StyledTopBar = styled(TopBar)`
  grid-column: first / end;
  grid-row: top / middle;
`;

const StyledBottomBar = styled(BottomBar)`
  border-top: 1px solid ${Colors['border--interactive--default']};
  padding-left: 92px;
  grid-column: first / second;
  grid-row: bottom / end;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: [first] minmax(824px, 1fr) [second] minmax(616px, 1fr) [end];
  grid-template-rows: [top] 50px [middle] auto [bottom] 70px [end];
  height: 100%;
  width: 100%;
`;

const StyledTopicFilterGuide = styled(TopicFilterGuide)`
  grid-column: second / end;
  grid-row: middle / end;
`;
