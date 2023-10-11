import React, { Suspense, useCallback, useMemo } from 'react';

import { FormikErrors } from 'formik';

import {
  Body,
  Checkbox,
  Colors,
  Flex,
  InputExp,
  Loader,
  OptionType,
  Select,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { FormFieldWrapper, CodeEditorWithStatus } from '../../components';
import { ExtractorMapping } from '../../hooks';
import { ADD_TOPIC_FILTER_BUILT_IN_FORMATS } from '../../utils/constants';

import {
  SectionContainer,
  SectionLink,
  SectionSubTitle,
  SectionTitle,
} from './Section';
import { CreateJobsFormValues, ExpandOptions } from './types';
import { isCustomFormat } from './utils';

// Lazy load editor component due to asyncWebAssembly support in webpack
const TopicFilterCodeEditor = React.lazy(() =>
  import('../../containers/TopicFilterCodeEditor').then((module) => ({
    default: module.TopicFilterCodeEditor,
  }))
);

export const StepTwo = ({
  customExtractorMappings,
  values,
  errors,
  setFieldValue,
  onClickExpand,
}: {
  customExtractorMappings?: ExtractorMapping[];
  values: CreateJobsFormValues & { useSampleData?: boolean };
  errors: FormikErrors<CreateJobsFormValues>;
  setFieldValue: (field: string, value: any) => void;
  onClickExpand: (expandOption: ExpandOptions) => void;
}) => {
  const { t } = useTranslation();
  const formatFieldOptionsWithCustomTypes = useMemo(() => {
    const formatFiledOptions = ADD_TOPIC_FILTER_BUILT_IN_FORMATS.map(
      ({ type: optionType }) => ({
        label: t(`form-format-option-${optionType}` as any),
        value: optionType as string,
      })
    );

    return [
      ...formatFiledOptions.slice(0, formatFiledOptions.length - 2),
      ...(customExtractorMappings?.map((mapping) => ({
        label: mapping.externalId,
        value: mapping.externalId,
      })) || []),
      formatFiledOptions.pop(),
    ] as OptionType<string>[];
  }, [t, customExtractorMappings]);

  const onChangeFormat = useCallback(
    (format: any) => {
      setFieldValue('mapping', format);
    },
    [setFieldValue]
  );

  const selectedMapping = useMemo(() => {
    if (isCustomFormat(customExtractorMappings, values.format)) {
      const customFormat = customExtractorMappings?.find(
        (mapping) => mapping.externalId === values.format
      );
      return customFormat ?? null;
    }
    return null;
  }, [values.format, customExtractorMappings]);
  return (
    <>
      <FormFieldWrapper isRequired title={t('form-message-format')}>
        <Select
          onChange={(value: OptionType<string>) =>
            setFieldValue('format', value.value)
          }
          options={formatFieldOptionsWithCustomTypes}
          placeholder={t('select-format')}
          value={formatFieldOptionsWithCustomTypes.find(
            (val) => val?.value === values.format
          )}
          aria-placeholder={t('select-format')}
        />
      </FormFieldWrapper>
      {values.format === 'custom' && (
        <>
          <div style={{ flex: 1 }}>
            <InputExp
              label={{
                required: true,
                text: t('form-format-name'),
              }}
              fullWidth
              onChange={(e) => setFieldValue('mappingName', e.target.value)}
              status={errors.mappingName ? 'critical' : undefined}
              statusText={errors.mappingName}
              placeholder={t('form-format-name-placeholder')}
              value={values.mappingName}
              helpText={t('form-format-name-tip')}
            />
          </div>
          <SectionContainer style={{ marginTop: 16 }}>
            <SectionTitle level={6}>
              {t('create-your-own-custom-format')}
            </SectionTitle>
            <Flex style={{ flexGrow: 1 }}>
              <SectionSubTitle size="small">
                {t('use-kuiper-to-write-code')}&nbsp;
              </SectionSubTitle>
              <SectionLink onClick={() => onClickExpand(ExpandOptions.Format)}>
                <Body
                  style={{
                    color: Colors['text-icon--interactive--default'],
                  }}
                  size="small"
                >{`Learn more ->`}</Body>
              </SectionLink>
            </Flex>
            <div style={{ marginTop: 8 }}>
              <FormFieldWrapper>
                <Checkbox
                  onChange={(e) =>
                    setFieldValue('useSampleData', e.target.checked)
                  }
                >
                  {t('try-with-sample-data')}
                </Checkbox>
              </FormFieldWrapper>
            </div>
          </SectionContainer>
          <Suspense fallback={<Loader />}>
            <TopicFilterCodeEditor
              onChangeFormat={onChangeFormat}
              showSampleData={values.useSampleData}
            />
          </Suspense>
        </>
      )}
      {isCustomFormat(customExtractorMappings, values.format) && (
        <Flex direction="column" gap={8}>
          <Body size="medium" strong>
            {t('transformation-code')}
          </Body>
          <CodeEditorWithStatus
            disabled
            placeholder={t('transformation-code-placeholder')}
            value={selectedMapping?.mapping.expression || ''}
          />
        </Flex>
      )}
    </>
  );
};
