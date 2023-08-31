import React, { useEffect } from 'react';

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

import { ONBOARDING_MODAL_ACTIONS } from '../../metrics';
import { EMPTY_ARRAY } from '../../utils';

export interface OnboardingModalProps
  extends Omit<ModalDefaultProps, 'title' | 'children'> {
  title?: string;
  body?: React.ReactNode;
  logoType: ProductLogoProps['type'];
  images: CarouselImage[];
  /**

  * onTrackEvent
  * =======
  * The function to call when a step is tracked. The function should be used as callback.

   */
  onTrackEvent?: (eventName: string, metadata: Record<string, any>) => void;
}

export const OnboardingModal = ({
  title,
  body,
  logoType,
  images = EMPTY_ARRAY,
  onTrackEvent,
  visible,
  ...rest
}: OnboardingModalProps) => {
  useEffect(() => {
    if (onTrackEvent && visible) {
      onTrackEvent('Modal', {
        action: ONBOARDING_MODAL_ACTIONS.STARTED,
        step: `carousel-step-1`,
      });
    }
  }, [onTrackEvent, visible]);
  return (
    <StyledModal
      title=""
      okText="Start tour"
      size="large"
      visible={visible}
      {...rest}
    >
      <Wrapper direction="column" gap={8} alignItems="center">
        <ProductLogo type={logoType} />
        <Title level={4}>{title || 'Welcome to Cognite Data Fusion®'}</Title>
        {body}
        <CarouselWrapper>
          <Carousel
            onStepChange={(currentStep) =>
              onTrackEvent?.('Modal', {
                action: 'Carousel',
                step: `carousel-step-${currentStep + 1}`,
              })
            }
            images={images}
            enableStepper
            enableSwipe
          />
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
