import React, { ReactElement } from 'react';

import styled from 'styled-components';

import img1 from './bg_01.jpg';
import img1Small from './bg_01_small.jpg';
import img2 from './bg_02.jpg';
import img2Small from './bg_02_small.jpg';
import img3 from './bg_03.jpg';
import img3Small from './bg_03_small.jpg';
import img4 from './bg_04.jpg';
import img4Small from './bg_04_small.jpg';
import BgImg from './BgImg';
import LogoWithText from './LogoWithText';

export type BackgroundProps = {
  rotatePeriod?: number; // milliseconds
  breakpointWidth?: number;
  children?: React.ReactNode | null;
  action?: ReactElement;
};

// const images = ['ShipBg', 'ShippingPortBg', 'HydroPowerBg', 'RefineryBg'];
const images = [
  [img1, img1Small],
  [img2, img2Small],
  [img3, img3Small],
  [img4, img4Small],
];

const DEFAULT_ROTATE_PERIOD = 1000 * 60 * 30; // 30 minutes

export type ImageCarouselProps = Pick<
  BackgroundProps,
  'rotatePeriod' | 'children'
>;

const ImageCarousel = ({
  rotatePeriod = DEFAULT_ROTATE_PERIOD,
  children,
}: ImageCarouselProps) => {
  const i = Math.floor(
    (Date.now() % (rotatePeriod * images.length)) / rotatePeriod
  );
  const [bg, smallBg] = images[i];

  return (
    <BgImg image={bg} imageSmall={smallBg}>
      {children}
    </BgImg>
  );
};

const Background = ({
  rotatePeriod,
  breakpointWidth = 450,
  children,
  action,
}: BackgroundProps) => {
  return (
    <ImageCarousel rotatePeriod={rotatePeriod}>
      <CogniteLogo $breakpointWidth={breakpointWidth}>
        <StyledIconWrapper $breakpointWidth={breakpointWidth}>
          <LogoWithText />
        </StyledIconWrapper>
      </CogniteLogo>
      {action}
      <DimmingOverlay>{children}</DimmingOverlay>
    </ImageCarousel>
  );
};

export default Background;

const DimmingOverlay = styled.div`
  > div {
    background: rgba(0, 0, 0, 0.3);
    height: 100vh;
  }
`;

const CogniteLogo = styled.div<{ $breakpointWidth: number }>`
  position: absolute;
  top: 3%;
  left: 3%;
  @media (max-width: ${({ $breakpointWidth }) => `${$breakpointWidth}`}px) {
    width: 100%;
    background: black;
    left: 0;
    top: 0;
    padding: 20px;
  }
`;
const StyledIconWrapper = styled.div<{ $breakpointWidth: number }>`
  width: 169px;
  height: 38px;
  @media (max-width: ${({ $breakpointWidth }) => `${$breakpointWidth}`}px) {
    margin: auto;
  }
`;
