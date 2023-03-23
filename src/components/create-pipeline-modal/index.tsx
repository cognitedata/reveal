import { createLink } from '@cognite/cdf-utilities';
import { Modal, ModalProps } from '@cognite/cogs.js';
import { FormikErrors, useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from 'common';
import PipelineDetailsForm, {
  PipelineDetailsFormValues,
} from 'components/pipeline-details-form';
import { useCreatePipeline } from 'hooks/entity-matching-pipelines';

type CreatePipelineModalProps = Pick<ModalProps, 'onCancel' | 'visible'> & {};

const CreatePipelineModal = ({
  onCancel,
  visible,
}: CreatePipelineModalProps): JSX.Element => {
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { mutateAsync } = useCreatePipeline();

  const handleValidate = (
    values: PipelineDetailsFormValues
  ): FormikErrors<PipelineDetailsFormValues> => {
    const errors: FormikErrors<PipelineDetailsFormValues> = {};
    if (!values.name) {
      errors.name = t('validation-error-field-required');
    }
    return errors;
  };

  const detailsForm = useFormik<PipelineDetailsFormValues>({
    initialValues: {},
    onSubmit: (values) => {
      mutateAsync({
        name: values.name,
        description: values.description,
      }).then(({ id }) => {
        onCancel?.();
        navigate(createLink(`/${subAppPath}/pipeline/${id}/sources`));
      });
    },
    validate: handleValidate,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <Modal
      title={t('create-pipeline')}
      visible={visible}
      onCancel={onCancel}
      cancelText={t('cancel')}
      onOk={detailsForm.handleSubmit}
      okText={t('create')}
    >
      <PipelineDetailsForm formik={detailsForm} />
    </Modal>
  );
};

export default CreatePipelineModal;
