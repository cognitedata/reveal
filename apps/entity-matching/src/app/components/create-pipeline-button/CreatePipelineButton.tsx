import { useState } from 'react';

import { useTranslation } from '../../common';
import CreatePipelineModal from '../create-pipeline-modal';
import NoWrapButton from '../no-wrap-button';

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
