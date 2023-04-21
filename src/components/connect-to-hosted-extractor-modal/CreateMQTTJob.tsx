import { ExtendedTranslationKeys } from '@cognite/cdf-i18n-utils';
import { Body, Button, Colors, Flex, InputExp } from '@cognite/cogs.js';
import { FormikErrors, FormikProps } from 'formik';
import styled from 'styled-components';

import { TranslationKeys, useTranslation } from 'common';
import {
  CreateMQTTJob as CreateMQTTJobType,
  MQTTDestinationType,
} from 'hooks/hostedExtractors';
import { useState } from 'react';

type CreateMQTTJobProps = {
  formik: FormikProps<CreateMQTTJobFormValues>;
};

export type CreateMQTTJobFormValues = Partial<
  Pick<CreateMQTTJobType, 'externalId' | 'topicFilter'>
>;

export const MQTT_DESTINATION_TYPE_OPTIONS: {
  label: string;
  value: MQTTDestinationType;
}[] = [
  {
    label: 'Datapoints',
    value: 'datapoints',
  },
];

export const validateCreateMQTTJobForm = (
  values: CreateMQTTJobFormValues,
  t: (key: ExtendedTranslationKeys<TranslationKeys>) => string
): FormikErrors<CreateMQTTJobFormValues> => {
  const errors: FormikErrors<CreateMQTTJobFormValues> = {};

  if (!values.externalId) {
    errors.externalId = t('validation-error-field-required');
  }
  if (!values.topicFilter) {
    errors.topicFilter = t('validation-error-field-required');
  }

  return errors;
};

export const CreateMQTTJob = ({ formik }: CreateMQTTJobProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');

  const handleAddTopicFilter = (): void => {
    if (
      !values.topicFilter ||
      values.topicFilter.split(',').every((f) => f !== tempTopicFilterInput)
    ) {
      setFieldValue(
        'topicFilter',
        values.topicFilter?.split(',').concat(tempTopicFilterInput).join(',') ||
          tempTopicFilterInput ||
          undefined
      );
      setTempTopicFilterInput('');
    }
  };

  const handleDeleteTopicFilter = (filter: string): void => {
    setFieldValue(
      'topicFilter',
      values.topicFilter
        ?.split(',')
        .filter((f) => f !== filter)
        .join(',') || undefined
    );
  };

  return (
    <Flex direction="column" gap={16}>
      <InputExp
        clearable
        fullWidth
        label={{
          required: true,
          info: undefined,
          text: t('form-job-external-id'),
        }}
        onChange={(e) => setFieldValue('externalId', e.target.value)}
        placeholder={t('form-job-external-id-placeholder')}
        status={errors.externalId ? 'critical' : undefined}
        statusText={errors.externalId}
        value={values.externalId}
      />
      <Flex direction="column" gap={8}>
        <Flex gap={8} style={{ width: '100%' }}>
          <div style={{ flex: 1 }}>
            <InputExp
              label={{
                info: t('form-topic-filters-info'),
                required: true,
                text: t('topic-filters'),
              }}
              fullWidth
              onChange={(e) => setTempTopicFilterInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !!tempTopicFilterInput) {
                  handleAddTopicFilter();
                }
              }}
              status={errors.topicFilter ? 'critical' : undefined}
              statusText={errors.topicFilter}
              placeholder={t('form-topic-filters-placeholder')}
              value={tempTopicFilterInput}
            />
          </div>
          <div style={{ marginTop: 27 }}>
            <Button
              disabled={
                !tempTopicFilterInput ||
                values.topicFilter
                  ?.split(',')
                  .some((f) => f === tempTopicFilterInput)
              }
              onClick={handleAddTopicFilter}
              type="primary"
            >
              {t('add')}
            </Button>
          </div>
        </Flex>
        {values.topicFilter?.split(',').map((filter) => (
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
      </Flex>
    </Flex>
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
