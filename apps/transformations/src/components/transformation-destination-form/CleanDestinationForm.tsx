import React, { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import FormFieldAutoComplete from '@transformations/components/form-field-auto-complete';
import FormFieldSelect from '@transformations/components/form-field-select';
import FormFieldSelectOption from '@transformations/components/form-field-select/FormFieldSelectOption';
import { DESTINATION_TYPE_OPTIONS } from '@transformations/components/target/Destination';
import { getResourceTypeDisplayName } from '@transformations/components/target/utils';
import { useSequences } from '@transformations/hooks';
import { WELL_DATA_TYPES } from '@transformations/types';
import { Select } from 'antd';
import { FormikProps } from 'formik';

import { TransformationDestinationFormValues } from '.';

const { OptGroup, Option } = Select;

type CleanDestinationFormProps = {
  formik: FormikProps<TransformationDestinationFormValues>;
};

const CleanDestinationForm = ({
  formik,
}: CleanDestinationFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  const { data: sequences } = useSequences({
    enabled: values.resourceType === 'sequence_rows',
  });

  const filteredSequenceOptions = useMemo(() => {
    const lowerCaseValue = values.sequenceExternalId?.toLowerCase() ?? '';

    return sequences
      ?.filter(
        ({ name, externalId, id }) =>
          name?.toLowerCase()?.includes(lowerCaseValue) ||
          externalId?.toLowerCase()?.includes(lowerCaseValue) ||
          id?.toString()?.includes(lowerCaseValue)
      )
      .map(({ name, externalId, id }) => ({
        label: name ?? externalId ?? id,
        value: externalId,
      }));
  }, [sequences, values.sequenceExternalId]);

  return (
    <>
      <FormFieldSelect<TransformationDestinationFormValues['resourceType']>
        allowClear
        error={errors.resourceType}
        isRequired
        onChange={(value) => {
          setFieldValue('resourceType', value);
          setFieldValue('action', undefined);
        }}
        optionFilterProp="label"
        placeholder={t('target-type-placeholder')}
        showSearch
        title={t('target-type')}
        value={values.resourceType}
      >
        {DESTINATION_TYPE_OPTIONS.map((optionGroup) => (
          <React.Fragment key={optionGroup.title}>
            <OptGroup label={optionGroup.title} />
            {optionGroup.items.map((item) => (
              <Option
                label={getResourceTypeDisplayName(item.value)}
                key={item.value}
                value={item.value}
              >
                <FormFieldSelectOption
                  icon={item.icon}
                  label={getResourceTypeDisplayName(item.value)}
                />
              </Option>
            ))}
          </React.Fragment>
        ))}
      </FormFieldSelect>
      {values.resourceType === 'sequence_rows' && (
        <FormFieldAutoComplete<
          TransformationDestinationFormValues['sequenceExternalId']
        >
          allowClear
          error={errors.sequenceExternalId}
          isRequired
          onChange={(value) => setFieldValue('sequenceExternalId', value)}
          options={filteredSequenceOptions}
          placeholder={t('sequence-external-id-placeholder')}
          title={t('sequence-external-id')}
          value={values.sequenceExternalId}
        />
      )}
      {values.resourceType === 'well_data_layer' && (
        <FormFieldSelect<TransformationDestinationFormValues['wdlDataType']>
          allowClear
          error={errors.wdlDataType}
          isRequired
          onChange={(value) => setFieldValue('wdlDataType', value)}
          options={Object.entries(WELL_DATA_TYPES).map(([value, label]) => ({
            label,
            value,
          }))}
          placeholder={t('select-wdl-data-type')}
          title={t('wdl-data-type')}
          value={values.wdlDataType}
        />
      )}
    </>
  );
};

export default CleanDestinationForm;
