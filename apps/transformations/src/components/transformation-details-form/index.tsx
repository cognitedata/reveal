import { useMemo } from 'react';

import { useTranslation, TranslationKeys } from '@transformations/common';
import FormFieldInput from '@transformations/components/form-field-input';
import FormFieldSelect from '@transformations/components/form-field-select';
import { useDataSetList } from '@transformations/hooks';
import { collectPages } from '@transformations/utils';
import { FormikErrors, FormikProps } from 'formik';

import { ExtendedTranslationKeys } from '@cognite/cdf-i18n-utils';
import { Flex } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

type TransformationDetailsFormProps = {
  formik: FormikProps<TransformationDetailsFormValues>;
};

export type TransformationDetailsFormValues = {
  name?: string;
  externalId?: string;
  dataSetId?: number;
};

export const validateTransformationDetailsForm = (
  values: TransformationDetailsFormValues,
  t: (key: ExtendedTranslationKeys<TranslationKeys>) => string
): FormikErrors<TransformationDetailsFormValues> => {
  const errors: FormikErrors<TransformationDetailsFormValues> = {};

  if (!values.name) {
    errors.name = t('validation-error-field-required');
  }
  if (!values.externalId) {
    errors.externalId = t('validation-error-field-required');
  }

  return errors;
};

const getDataSetIdentifier = (dataSet: DataSet) => {
  return dataSet?.name ?? dataSet?.externalId ?? `${dataSet?.id}`;
};

const TransformationDetailsForm = ({
  formik,
}: TransformationDetailsFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, handleBlur, setFieldValue, touched, values } = formik;

  const { data: dataSetsPages, error: dataSetListError } = useDataSetList();

  const dataSetsAll = useMemo(
    () => collectPages(dataSetsPages),
    [dataSetsPages]
  );
  const dataSets = useMemo(() => {
    return dataSetsAll.filter((dataset) => {
      return (
        dataset.metadata?.archived === 'false' || !dataset.metadata?.archived
      );
    });
  }, [dataSetsAll]);

  const sortedDataSets = useMemo(() => {
    return dataSets?.sort((a, b) => {
      const identifierA = getDataSetIdentifier(a);
      const identifierB = getDataSetIdentifier(b);
      return identifierA.localeCompare(identifierB);
    });
  }, [dataSets]);

  const handleFilterDataSetOption = (
    input: string,
    option?: { value?: string | number | null }
  ): boolean => {
    const dataSet = dataSets?.find(({ id }) => id === option?.value);
    const inputLowerCase = input.toLowerCase();

    return (
      dataSet?.name?.toLowerCase()?.includes(inputLowerCase) ||
      dataSet?.externalId?.toLowerCase()?.includes(inputLowerCase) ||
      dataSet?.id?.toString()?.includes(inputLowerCase) ||
      false
    );
  };

  return (
    <Flex direction="column" gap={24}>
      <FormFieldInput
        error={errors.name}
        isRequired
        onChange={(value) => {
          setFieldValue('name', value);
          if (!touched.externalId) {
            setFieldValue('externalId', `tr-${value}`);
          }
        }}
        placeholder={t('transformation-details-form-name-field-placeholder')}
        title={t('transformation-name')}
        value={values.name}
      />
      <FormFieldInput
        error={errors.externalId}
        isRequired
        name="externalId"
        onBlur={handleBlur}
        onChange={(value) => setFieldValue('externalId', value)}
        placeholder={t(
          'transformation-details-form-external-id-field-placeholder'
        )}
        title={t('external-id')}
        value={values.externalId}
      />
      <FormFieldSelect<TransformationDetailsFormValues['dataSetId']>
        allowClear
        error={errors.dataSetId}
        filterOption={handleFilterDataSetOption}
        notFoundContent={
          dataSetListError?.status === 403
            ? t('no-access-to-data-sets')
            : t('no-data-sets')
        }
        optionFilterProp="label"
        options={sortedDataSets?.map((dataSet) => ({
          label: getDataSetIdentifier(dataSet),
          value: dataSet.id,
        }))}
        placeholder={t(
          'transformation-details-form-data-set-id-field-placeholder'
        )}
        onChange={(value) => setFieldValue('dataSetId', value)}
        showSearch
        title={t('restrict-access-with-data-set')}
        value={values.dataSetId}
      />
    </Flex>
  );
};

export default TransformationDetailsForm;
