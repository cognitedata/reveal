import React from 'react';

import styled from 'styled-components';

import {
  Carousel,
  Flex,
  Modal,
  ModalDefaultProps,
  ProductLogo,
  ProductLogoProps,
  Title,
} from '@cognite/cogs.js';
import { CarouselImage } from '@cognite/cogs.js/dist/esm/Components/Carousel/types';

import { EMPTY_ARRAY } from '../../utils';

export interface OnboardingModalProps extends Omit<ModalDefaultProps, 'title'> {
  title?: string;
  body?: React.ReactNode;
  logoType: ProductLogoProps['type'];
  images: CarouselImage[];
}

export const OnboardingModal = ({
  title,
  body,
  logoType,
  images = EMPTY_ARRAY,
  ...rest
}: OnboardingModalProps) => {
  return (
    <StyledModal title="" visible okText="Start tour" size="large" {...rest}>
      <Wrapper direction="column" gap={8} alignItems="center">
        <ProductLogo type={logoType} />
        <Title level={4}>{title || 'Welcome to Cognite Data Fusion®'}</Title>
        {body}
        <CarouselWrapper>
          <Carousel images={images} enableStepper enableSwipe />
        </CarouselWrapper>
      </Wrapper>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .cogs-modal-header,
  .cogs-modal__content {
    background-color: var(
      --cogs-surface--status-neutral--muted--default
    ) !important;
  }

  .cogs-modal-close-button {
    top: 24px;
    right: 16px;
    margin: 0;
  }
`;

const Wrapper = styled(Flex)`
  padding-bottom: 20px;
  flex: 1;
`;

const CarouselWrapper = styled.div`
  width: 100%;
  margin-top: 32px;
  margin-bottom: 16px;
`;
