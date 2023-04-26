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
import { FormikErrors, useFormik } from 'formik';
import styled from 'styled-components';

import { useTranslation } from 'common';

type CreateJobsFormValues = {
  topicFilters?: string[];
  shouldUseExistingDestinationId: boolean;
  selectedDestinationExternalId?: string;
  destinationExternalIdToCreate?: string;
  clientId?: string;
  clientSecret?: string;
};

type CreateJobsModalProps = {
  onCancel: () => void;
  visible: ModalProps['visible'];
};

export const CreateJobsModal = ({
  onCancel,
  visible,
}: CreateJobsModalProps): JSX.Element => {
  const { t } = useTranslation();

  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');

  const handleValidate = (
    values: CreateJobsFormValues
  ): FormikErrors<CreateJobsFormValues> => {
    const errors: FormikErrors<CreateJobsFormValues> = {};

    if (!values.topicFilters || values.topicFilters.length === 0) {
      errors.topicFilters = t('validation-error-field-required');
    }

    if (values.shouldUseExistingDestinationId) {
      if (!values.selectedDestinationExternalId) {
        errors.selectedDestinationExternalId = t(
          'validation-error-field-required'
        );
      }
    } else {
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
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } =
    useFormik<CreateJobsFormValues>({
      initialValues: {
        shouldUseExistingDestinationId: false,
      },
      onSubmit: () => {
        // TODO
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

  return (
    <Modal
      onCancel={onCancel}
      okText={t('create')}
      onOk={handleSubmit}
      title={t('create-jobs')}
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
        </Flex>
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
