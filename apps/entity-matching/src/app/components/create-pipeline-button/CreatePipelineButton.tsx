import { useState } from 'react';
import { useTranslation } from 'common';
import CreatePipelineModal from 'components/create-pipeline-modal';
import NoWrapButton from 'components/no-wrap-button';

export const CreatePipelineButton = (): JSX.Element => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreatePipelineModal
        onCancel={() => setIsModalOpen(false)}
        visible={isModalOpen}
      />
      <NoWrapButton
        onClick={() => setIsModalOpen(true)}
        type="primary"
        icon="AddLarge"
      >
        {t('title-create-pipeline')}
      </NoWrapButton>
    </>
  );
};
