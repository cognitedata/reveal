import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

type Props = {
  onClick: () => void;
  disabled: boolean;
};

export const UploadButton: React.FC<Props> = ({ onClick, disabled }: Props) => {
  const { t } = useTranslation();

  return (
    <Button onClick={onClick} icon="Upload" disabled={disabled}>
      <StyledDiv>{t('UPLOAD', 'Upload')}</StyledDiv>
    </Button>
  );
};

const StyledDiv = styled.div`
  width: max-content;
`;
