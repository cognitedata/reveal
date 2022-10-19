import React from 'react';

import { EditModal } from 'components/modals/EditModal';
import { Extpipe } from 'model/Extpipe';
import { useTranslation } from 'common';
import Field from './fields/Field';
import { Flex, Input } from '@cognite/cogs.js';
import { FormikErrors, useFormik } from 'formik';

type BasicInformationModalProps = {
  extpipe: Extpipe;
  isOpen: boolean;
  onClose: () => void;
};

type BasicInformationFormFields = Pick<
  Extpipe,
  'description' | 'externalId' | 'source'
>;

const BasicInformationModal = ({
  extpipe,
  isOpen,
  onClose,
}: BasicInformationModalProps): JSX.Element => {
  const { t } = useTranslation();

  const handleSubmit = () => {};

  const handleValidation = (
    values: BasicInformationFormFields
  ): FormikErrors<BasicInformationFormFields> => {
    const errors: FormikErrors<BasicInformationFormFields> = {};

    if (!values.externalId) {
      errors.externalId = t('required-field-is-missing');
    }

    return errors;
  };

  const formik = useFormik<BasicInformationFormFields>({
    initialValues: {
      description: extpipe.description,
      externalId: extpipe.externalId,
      source: extpipe.source,
    },
    onSubmit: handleSubmit,
    validate: handleValidation,
  });

  const { setFieldValue, errors, values } = formik;

  return (
    <EditModal
      title={t('ext-pipeline-info-title')}
      visible={isOpen}
      close={onClose}
    >
      <Flex direction="column" gap={16}>
        <Field info={t('description-hint')} title={t('description')}>
          <Input
            name="description"
            onChange={(e) => setFieldValue('description', e.target.value)}
            placeholder={t('description-placeholder')}
            value={values.description}
          />
        </Field>
        <Field info={t('source-hint')} title={t('source')}>
          <Input
            name="source"
            onChange={(e) => setFieldValue('source', e.target.value)}
            placeholder={t('source-placeholder')}
            value={values.source}
          />
        </Field>
        <Field info={t('external-id-hint')} isRequired title={t('external-id')}>
          <Input
            error={errors.externalId}
            fullWidth
            name="externalId"
            onChange={(e) => setFieldValue('externalId', e.target.value)}
            placeholder={t('external-id-placeholder')}
            value={values.externalId}
          />
        </Field>
      </Flex>
    </EditModal>
  );
};

export default BasicInformationModal;
