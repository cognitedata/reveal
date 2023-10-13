import { FormikProps } from 'formik';

import { Flex, InputExp } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

export type PipelineDetailsFormValues = {
  description?: string;
  name?: string;
};

type PipelineDetailsFormProps = {
  formik: FormikProps<PipelineDetailsFormValues>;
};

const PipelineDetailsForm = ({
  formik,
}: PipelineDetailsFormProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors, setFieldValue, values } = formik;

  return (
    <Flex direction="column" gap={12} data-testid="create-pipeline-modal">
      <InputExp
        status={errors.name ? 'critical' : undefined}
        statusText={errors.name}
        fullWidth
        label={{
          info: '',
          required: true,
          text: t('name'),
        }}
        name="name"
        onChange={(e) => setFieldValue('name', e.target.value)}
        value={values.name}
        data-testid="create-pipeline-name"
      />
      <InputExp
        fullWidth
        label={{
          info: '',
          required: false,
          text: t('description'),
        }}
        name="description"
        onChange={(e) => setFieldValue('description', e.target.value)}
        value={values.description}
        data-testid="create-pipeline-description"
      />
    </Flex>
  );
};

export default PipelineDetailsForm;
