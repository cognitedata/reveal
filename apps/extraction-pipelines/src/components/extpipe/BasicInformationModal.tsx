import React, { useMemo } from 'react';

import { Select } from 'antd';
import { FormikErrors, useFormik } from 'formik';

import { Button, Flex, InputExp, OptionType } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { useDetailsUpdate } from '../../hooks/details/useDetailsUpdate';
import { useDataSetsList } from '../../hooks/useDataSetsList';
import { Extpipe } from '../../model/Extpipe';
import { DATASET_LIST_LIMIT } from '../../pages/create/DataSetIdInput';
import { SupportedScheduleStrings } from '../extpipes/cols/Schedule';
import { EditModal } from '../modals/EditModal';

import { convertScheduleValue, Schedule } from './edit/Schedule';
import Field from './fields/Field';

type BasicInformationModalProps = {
  extpipe: Extpipe;
  isOpen: boolean;
  onClose: () => void;
};

export type BasicInformationFormFields = Pick<
  Extpipe,
  'dataSetId' | 'description' | 'externalId' | 'name' | 'source'
> & {
  schedule?: SupportedScheduleStrings;
  cron?: string;
};

const BasicInformationModal = ({
  extpipe,
  isOpen,
  onClose,
}: BasicInformationModalProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate: updateExtpipeDetails } = useDetailsUpdate();

  const { data: dataSets, status } = useDataSetsList(DATASET_LIST_LIMIT);

  const updateBasicInformation = () => {
    updateExtpipeDetails({
      id: extpipe.id,
      items: [
        {
          id: `${extpipe.id}`,
          update: {
            name: {
              set: values.name,
            },
            dataSetId: {
              set: values.dataSetId,
            },
            description: {
              set: values.description,
            },
            externalId: {
              set: values.externalId,
            },
            schedule: {
              set:
                values.schedule === SupportedScheduleStrings.SCHEDULED
                  ? values.cron
                  : values.schedule,
            },
            source: {
              set: values.source,
            },
          },
        },
      ],
    });
    onClose();
  };

  const handleValidation = (
    values: BasicInformationFormFields
  ): FormikErrors<BasicInformationFormFields> => {
    const errors: FormikErrors<BasicInformationFormFields> = {};

    if (!values.name) {
      errors.name = t('required-field-is-missing');
    }

    if (!values.dataSetId) {
      errors.dataSetId = t('required-field-is-missing');
    }

    if (!values.externalId) {
      errors.externalId = t('required-field-is-missing');
    }

    if (
      values.schedule === SupportedScheduleStrings.SCHEDULED &&
      !values.cron
    ) {
      errors.cron = t('required-field-is-missing');
    }

    return errors;
  };

  const formik = useFormik<BasicInformationFormFields>({
    initialValues: {
      cron:
        extpipe.schedule &&
        convertScheduleValue(extpipe.schedule) ===
          SupportedScheduleStrings.SCHEDULED
          ? extpipe.schedule
          : undefined,
      dataSetId: extpipe.dataSetId,
      description: extpipe.description,
      externalId: extpipe.externalId,
      name: extpipe.name,
      schedule: extpipe.schedule
        ? convertScheduleValue(extpipe.schedule)
        : undefined,
      source: extpipe.source,
    },
    onSubmit: updateBasicInformation,
    validate: handleValidation,
    validateOnChange: false,
    validateOnBlur: false,
  });

  const { setFieldValue, errors, handleSubmit, values } = formik;

  const dataSetOptions = useMemo(() => {
    return (
      dataSets
        ?.map(({ externalId, id, name }) => ({
          value: id,
          label: name ?? externalId ?? `${id}`,
          externalId,
        }))
        .sort((dsA, dsB) => {
          return dsA.label.localeCompare(dsB.label);
        }) ?? []
    );
  }, [dataSets]);

  const selectedOption = useMemo(() => {
    return values.dataSetId
      ? dataSetOptions.find(({ value }) => value === values.dataSetId) ?? {
          label: `${values.dataSetId}`,
          value: values.dataSetId,
        }
      : undefined;
  }, [dataSetOptions, values.dataSetId]);

  return (
    <EditModal
      title={t('ext-pipeline-info-title')}
      visible={isOpen}
      close={onClose}
    >
      <Flex direction="column" gap={16}>
        <InputExp
          label={{
            required: false,
            info: undefined,
            text: t('name'),
          }}
          status={errors.name ? 'critical' : undefined}
          statusText={errors.name}
          fullWidth
          name="name"
          onChange={(e) => setFieldValue('name', e.target.value)}
          placeholder={t('name-placeholder')}
          value={values.name}
        />
        <InputExp
          label={{
            info: t('description-hint'),
            required: false,
            text: t('description'),
          }}
          fullWidth
          name="description"
          onChange={(e) => setFieldValue('description', e.target.value)}
          placeholder={t('description-placeholder')}
          value={values.description}
        />
        <Field info={t('data-set-id-hint')} title={t('data-set')}>
          <Select
            disabled={status !== 'success'}
            onChange={(option: OptionType<number>) =>
              setFieldValue('dataSetId', option.value)
            }
            options={dataSetOptions}
            optionFilterProp="label"
            showSearch
            value={selectedOption}
          />
        </Field>
        <InputExp
          label={{
            info: t('source-hint'),
            required: false,
            text: t('source'),
          }}
          fullWidth
          name="source"
          onChange={(e) => setFieldValue('source', e.target.value)}
          placeholder={t('source-placeholder')}
          value={values.source}
        />
        <InputExp
          label={{
            info: t('external-id-hint'),
            required: true,
            text: t('external-id'),
          }}
          status={errors.externalId ? 'critical' : undefined}
          statusText={errors.externalId}
          fullWidth
          name="externalId"
          onChange={(e) => setFieldValue('externalId', e.target.value)}
          placeholder={t('external-id-placeholder')}
          value={values.externalId}
        />
        <Field info={t('schedule-hint')} title={t('schedule')}>
          <Schedule
            errors={errors}
            setFieldValue={setFieldValue}
            values={values}
          />
        </Field>
        <Flex gap={8} justifyContent="flex-end">
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            disabled={!!Object.keys(errors).length}
            onClick={() => handleSubmit()}
            type="primary"
          >
            {t('confirm')}
          </Button>
        </Flex>
      </Flex>
    </EditModal>
  );
};

export default BasicInformationModal;
