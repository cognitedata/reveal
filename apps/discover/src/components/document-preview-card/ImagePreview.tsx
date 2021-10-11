import React from 'react';
import { useTranslation } from 'react-i18next';

import styled, { keyframes } from 'styled-components/macro';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  background: white;
  width: 1024px;
  max-width: 70%;
  margin: 0 auto 32px;
  border-radius: 8px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  animation: ${fadeIn} 1s forwards;
`;

interface Props {
  name: string;
  imageSrc: string;
}

export const ImagePreview: React.FC<Props> = ({ name, imageSrc }) => {
  const { t } = useTranslation('cookies');

  return (
    <ImageContainer>
      <Image src={imageSrc} alt={`${t('Preview of')} ${name}.`} />
    </ImageContainer>
  );
};
