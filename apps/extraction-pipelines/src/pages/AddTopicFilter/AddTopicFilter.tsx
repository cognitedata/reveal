import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { notification } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { Colors, Divider, Flex, Heading } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { BottomBar, TopBar } from '../../components/ToolBars';
import {
  ExtractorMapping,
  useCreateExtractorMapping,
  useFetchExtractorMappings,
} from '../../hooks';
import {
  useCreateMQTTDestination,
  useCreateMQTTJob,
  useMQTTSourceWithMetrics,
} from '../../hooks/hostedExtractors';

import { Section } from './Section';
import { StepOne } from './StepOne';
import { StepThree } from './StepThree';
import { StepTwo } from './StepTwo';
import { TopicFilterGuide } from './TopicFilterGuide';
import { CreateJobsFormValues, ExpandOptions } from './types';
import { isCustomFormat } from './utils';

export const AddTopicFilter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedOption, setExpandedOption] = useState(ExpandOptions.None);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const { externalId: sourceExternalId } = useParams();

  const { data: source } = useMQTTSourceWithMetrics(sourceExternalId);

  const { mutateAsync: createDestination } = useCreateMQTTDestination();
  const { mutateAsync: createJob } = useCreateMQTTJob({
    onSuccess: () => {
      notification.success({
        message: t('notification-success-job-create'),
        key: 'delete-source',
      });
      goBack();
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        description: e.message,
        key: 'delete-source',
      });
    },
  });
  const { mutateAsync: createMapping } = useCreateExtractorMapping({
    onSuccess: (data) => {
      notification.success({
        message: t('transformation-code-saved', {
          mappingId: data?.[0].externalId,
        }),
        key: 'add-mapping',
      });
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        description: e.message,
        key: 'add-mapping',
      });
    },
  });
  const { data: customExtractorMappings } = useFetchExtractorMappings();

  const handleValidate = (
    values: CreateJobsFormValues
  ): FormikErrors<CreateJobsFormValues> => {
    const errors: FormikErrors<CreateJobsFormValues> = {};

    if (!values.topicFilters || values.topicFilters.length === 0) {
      errors.topicFilters = t(
        isTopicFilterInputValueAvailable
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
    if (values.format === 'custom') {
      if (!values.mappingName) {
        errors.mappingName = t('validation-error-field-required');
      }
    }

    return errors;
  };

  const { errors, handleSubmit, setFieldValue, values } = useFormik<
    CreateJobsFormValues & { useSampleData?: boolean }
  >({
    initialValues: {
      destinationOption: 'use-existing',
    },
    onSubmit: async (val) => {
      let mappingId = '';
      let format = val.format;
      if (!val.topicFilters || val.topicFilters.length === 0) {
        return;
      }

      if (val.format === 'custom' && val.mapping && val.mappingName) {
        mappingId = await createMapping({
          externalId: val.mappingName,
          published: true,
          mapping: {
            expression: val.mapping,
          },
        }).then((data: ExtractorMapping[]) => {
          return data?.[0]?.externalId ?? '';
        });
      }

      if (val.format && isCustomFormat(customExtractorMappings, val.format)) {
        format = 'custom';
        mappingId = val.format;
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
                type: format ?? 'cognite',
                ...(mappingId && { mappingId }),
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

  const [
    isTopicFilterInputValueAvailable,
    setIsTopicFilterInputValueAvailable,
  ] = useState(false);

  const onClickExpand = useCallback(
    (expandOption: ExpandOptions) => {
      if (expandOption && setExpandedOption) {
        setExpandedOption(expandOption);
      }
    },
    [setExpandedOption]
  );

  return (
    <GridContainer>
      <StyledTopBar title={t('back')} onClick={goBack} />
      <TopicFilterContent>
        <Heading level={3}>{t('form-setup-stream')}</Heading>
        <SectionWrapper>
          <Section
            title={t('form-step-1-x', { step: t('add-topic-filter') })}
            subtitle={t('form-add-topic-filter-detail')}
            expandOption={ExpandOptions.TopicFilters}
            onClickExpand={onClickExpand}
          />
          <StepOne
            source={source}
            values={values}
            errors={errors}
            setFieldValue={setFieldValue}
            onTopicFilterInputValueAvailabilityChange={
              setIsTopicFilterInputValueAvailable
            }
          />
        </SectionWrapper>
        <Divider />
        <SectionWrapper>
          <Section
            title={t('form-step-2-x', { step: t('form-choose-format') })}
            subtitle={t('form-choose-format-detail')}
            expandOption={ExpandOptions.Format}
            onClickExpand={onClickExpand}
          />
          <StepTwo
            customExtractorMappings={customExtractorMappings}
            values={values}
            errors={errors}
            setFieldValue={setFieldValue}
            onClickExpand={onClickExpand}
          />
        </SectionWrapper>
        <Divider />
        <SectionWrapper>
          <Section
            title={t('form-step-3-x', {
              step: t('form-select-authenticate-sync'),
            })}
            subtitle={t('form-select-authenticate-detail')}
            expandOption={ExpandOptions.Sync}
            onClickExpand={onClickExpand}
          ></Section>
          <StepThree
            values={values}
            errors={errors}
            setFieldValue={setFieldValue}
          />
        </SectionWrapper>
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

const SectionWrapper = styled(Flex)`
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
