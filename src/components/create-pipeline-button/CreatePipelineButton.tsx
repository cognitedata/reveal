import { useState } from 'react';

import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import CreatePipelineModal from 'components/create-pipeline-modal';

export const CreatePipelineButton = (): JSX.Element => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreatePipelineModal
        onCancel={() => setIsModalOpen(false)}
        visible={isModalOpen}
      />
      <StyledButton
        onClick={() => setIsModalOpen(true)}
        type="primary"
        icon="AddLarge"
      >
        {t('title-create-pipeline')}
      </StyledButton>
    </>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
`;
