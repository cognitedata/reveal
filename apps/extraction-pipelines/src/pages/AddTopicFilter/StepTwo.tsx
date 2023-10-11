import React, { Suspense, useCallback, useMemo } from 'react';

import styled, { CSSObject } from 'styled-components';

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
    const builtInFormats = ADD_TOPIC_FILTER_BUILT_IN_FORMATS.map(
      ({ type: optionType }) => ({
        label: t(`form-format-option-${optionType}` as any),
        value: optionType as string,
      })
    );

    const customFormat = builtInFormats.find((item) => item.value === 'custom');

    const builtInOptions = [
      ...builtInFormats
        .filter((item) => item.value !== 'custom')
        .map((item, index, array) => {
          return index === array.length - 1 ? { ...item, divider: true } : item; // add divider to last item
        }),
    ];

    const customOptions =
      customExtractorMappings?.map((mapping) => ({
        label: mapping.externalId,
        value: mapping.externalId,
      })) || [];

    return [
      {
        label: t('form-cognite-default-formats'),
        options: builtInOptions,
        key: 'built-in',
      },
      {
        label: t('form-custom-message-formats'),
        options: [...customOptions, customFormat],
      },
    ];
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

  const valueSelect = useMemo(() => {
    return formatFieldOptionsWithCustomTypes
      .map((item) => item.options)
      .flat()
      .find((val) => val?.value === values.format);
  }, [formatFieldOptionsWithCustomTypes, values.format]);

  return (
    <>
      <FormFieldWrapper isRequired title={t('form-message-format')}>
        <CustomSelect
          onChange={(value: OptionType<string>) =>
            setFieldValue('format', value.value)
          }
          options={formatFieldOptionsWithCustomTypes as any}
          placeholder={t('select-format')}
          value={valueSelect}
          aria-placeholder={t('select-format')}
          styles={{
            groupHeading: (base: CSSObject) => ({
              ...base,
              padding: 8,
              paddingLeft: '8px!important',
              color: Colors['text-icon--muted'],
              fontWeight: 400,
            }),
          }}
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

const CustomSelect = styled(Select)`
  .cogs-select__menu {
    min-width: 300px;
    max-width: 600px;
  }
`;
