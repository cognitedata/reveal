import { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import CreateTransformationModal from '@transformations/components/create-transformation-modal';

import { Button } from '@cognite/cogs.js';

export const CreateTransformationButton = (): JSX.Element => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation();

  const hasWriteAccess = true;
  const onStartCreateTransformation = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      {isModalVisible && (
        <CreateTransformationModal
          onCancel={() => setIsModalVisible(false)}
          visible
        />
      )}
      <StyledButton
        type="primary"
        icon="AddLarge"
        disabled={!hasWriteAccess}
        onClick={onStartCreateTransformation}
      >
        {t('create')}
      </StyledButton>
    </>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
`;
