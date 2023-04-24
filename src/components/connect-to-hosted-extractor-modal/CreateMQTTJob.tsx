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

export type CreateMQTTJobFormValues = {
  topicFilters?: CreateMQTTJobType['topicFilter'][];
};

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

  if (!values.topicFilters || !values.topicFilters.length) {
    errors.topicFilters = t('validation-error-field-required');
  }

  return errors;
};

export const CreateMQTTJob = ({ formik }: CreateMQTTJobProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');

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

  return (
    <Flex direction="column" gap={16}>
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
