import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';

import styled from 'styled-components';

import { FormikErrors } from 'formik';

import { Body, Button, Colors, Flex, InputExp } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTSourceWithJobMetrics } from '../../hooks/hostedExtractors';

import { CreateJobsFormValues } from './types';

export const StepOne = ({
  source,
  values,
  errors,
  setFieldValue,
  onTopicFilterInputValueAvailabilityChange,
}: {
  source?: MQTTSourceWithJobMetrics;
  values: CreateJobsFormValues;
  errors: FormikErrors<CreateJobsFormValues>;
  setFieldValue: (field: string, value: any) => void;
  onTopicFilterInputValueAvailabilityChange: (valueAvailable: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');

  const handleAddTopicFilter = useCallback((): void => {
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
      onTopicFilterInputValueAvailabilityChange(false);
    }
  }, [
    values.topicFilters,
    tempTopicFilterInput,
    setFieldValue,
    onTopicFilterInputValueAvailabilityChange,
  ]);

  const onTopicFilterInputValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setTempTopicFilterInput(e.target.value);
      if (e.target.value) {
        onTopicFilterInputValueAvailabilityChange(true);
      } else {
        onTopicFilterInputValueAvailabilityChange(false);
      }
    },
    [onTopicFilterInputValueAvailabilityChange]
  );

  const onTopicFilterInputKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !!tempTopicFilterInput) {
        handleAddTopicFilter();
      }
    },
    [handleAddTopicFilter, tempTopicFilterInput]
  );

  const handleDeleteTopicFilter = useCallback(
    (filter: string): void => {
      setFieldValue(
        'topicFilters',
        values.topicFilters?.filter((f) => f !== filter) ?? []
      );
    },
    [setFieldValue, values.topicFilters]
  );

  const sourceTopicFilters = useMemo(() => {
    return source?.jobs.map((job) => {
      return job.config.topicFilter;
    });
  }, [source?.jobs]);

  return (
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
            onChange={onTopicFilterInputValueChange}
            onKeyDown={onTopicFilterInputKeyPress}
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
              aria-label="Delete"
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
