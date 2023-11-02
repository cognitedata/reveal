import React, { useCallback } from 'react';

import styled from 'styled-components';

import { FormikErrors } from 'formik';

import { Flex, InputExp, OptionType, Select } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { FormFieldRadioGroup, FormFieldWrapper } from '../../components';
import {
  ReadMQTTDestination,
  useMQTTDestinations,
} from '../../hooks/hostedExtractors';

import { CreateJobsFormValues } from './types';

export const StepThree = ({
  values,
  errors,
  setFieldValue,
}: {
  values: CreateJobsFormValues;
  errors: FormikErrors<CreateJobsFormValues>;
  setFieldValue: (field: string, value: any) => void;
}) => {
  const { t } = useTranslation();

  const { data: destinations } = useMQTTDestinations({
    select: React.useCallback((data?: ReadMQTTDestination[]) => {
      return (
        data?.map((value) => ({
          ...value,
          label: value.externalId,
          value: value.externalId,
        })) ?? []
      );
    }, []),
  });

  const onChangeDestinationType = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue('destinationExternalIdToCreate', e.target.value);
    },
    [setFieldValue]
  );
  return (
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
                  onChange={(value: OptionType<string>) => {
                    setFieldValue('selectedDestinationExternalId', value.value);
                  }}
                  options={destinations || []}
                  placeholder={t('form-existing-syncs-placeholder')}
                  value={destinations?.find(
                    (val) => val.value === values.selectedDestinationExternalId
                  )}
                ></Select>
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
                onChange={onChangeDestinationType}
                status={
                  errors.destinationExternalIdToCreate ? 'critical' : undefined
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
                onChange={onChangeDestinationType}
                status={
                  errors.destinationExternalIdToCreate ? 'critical' : undefined
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
                onChange={(e) => setFieldValue('clientId', e.target.value)}
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
                onChange={(e) => setFieldValue('clientSecret', e.target.value)}
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
  );
};

const RadioButtonContentContainer = styled(Flex)`
  align-self: stretch;
  padding-left: 28px;
  flex-direction: column;
`;
