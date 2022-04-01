import React, { useState } from 'react';
// eslint-disable-next-line lodash/import-scope
import { shuffle } from 'lodash';
import styled, { keyframes } from 'styled-components';

import LogoWithText from '../../icons/LogoWithText';
import { CenteredOnDesktop } from '../../styles/elements';
// imported using relative paths to include them in the rollup bundle
import background01 from '../../assets/background-01.jpg';
import background02 from '../../assets/background-02.jpg';
import background03 from '../../assets/background-03.jpg';
import background04 from '../../assets/background-04.jpg';
import CLetterImage from '../../assets/CLetter.svg';
import NLetterImage from '../../assets/NLetter.svg';

interface Props {
  children: React.ReactNode | null;
  animated?: boolean;
}

const images = [background01, background02, background03, background04];
const numberOfImages = images.length;
const eachImageTime = 5;
const transitionTime = 1;
const totalDuration = numberOfImages * eachImageTime + transitionTime;
const zoomedScale = 1.2;
const initialScale =
  zoomedScale - (transitionTime / (eachImageTime + transitionTime)) * 0.2;

export default function TenantSelectorBackground({
  children,
  animated,
}: Props) {
  const [shuffledImages] = useState(shuffle(images));
  return (
    <BackgroundWrapper>
      {shuffledImages.map((image, i) =>
        animated ? (
          // eslint-disable-next-line react/no-array-index-key
          <AnimatedBackgroundImage image={image} key={i} index={i} />
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <BackgroundImage image={image} key={i} index={i} />
        )
      )}

      <ContentWrapper>
        <CogniteLogo>
          <StyledIconWrapper>
            <LogoWithText />
          </StyledIconWrapper>
        </CogniteLogo>

        <Hide below={936}>
          <CLetter />
          <NLetter />
        </Hide>

        <DimmingOverlay>
          <CenteredOnDesktop>{children}</CenteredOnDesktop>
        </DimmingOverlay>
      </ContentWrapper>
    </BackgroundWrapper>
  );
}

const Hide = styled.div<{
  below: number;
}>`
  @media (max-width: ${({ below }) => below}px) {
    display: none;
  }
  display: block;
`;

const BackgroundWrapper = styled.div`
  @media (min-width: 451px) {
    overflow: hidden;
    height: 100vh;
  }
  position: relative;
  width: 100vw;
`;

const ContentWrapper = styled.div`
  @media (max-width: 450px) {
    display: flex;
    flex-direction: column;
  }
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const fadeInOut = keyframes`
  0% {
    opacity: 1;
    transform: scale(${initialScale}, ${initialScale});
  }
  ${(eachImageTime / totalDuration) * 100}% {
    opacity: 1;
  }
  ${((eachImageTime + transitionTime) / totalDuration) * 100}% {
    opacity: 0;
    transform: scale(1, 1);
  }
  ${(1 - transitionTime / totalDuration) * 100}% {
    opacity: 0;
    transform: scale(${zoomedScale}, ${zoomedScale});
  }
  100% {
    opacity: 1;
    transform: scale(${initialScale}, ${initialScale});
  }
`;

type BackgroundProps = {
  image: string;
  index: number;
};

const BackgroundImage = styled.div<BackgroundProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: ${(props) => `url(${props.image})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;
const AnimatedBackgroundImage = styled(BackgroundImage)`
  transform: scale(${initialScale}, ${initialScale});
  animation-name: ${fadeInOut};
  animation-duration: ${totalDuration - transitionTime}s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-delay: ${(props) =>
    (numberOfImages - props.index - 1) * eachImageTime}s;
`;

const CogniteLogo = styled.div`
  @media (max-width: 450px) {
    background: black;
    padding: 20px;
  }
  @media (min-width: 451px) {
    position: absolute;
    top: 3%;
    left: 3%;
  }
`;

const StyledIconWrapper = styled.div`
  @media (max-width: 450px) {
    margin: auto;
  }
  width: 169px;
  height: 38px;
`;

const CLetter = styled.div`
  background-image: url(${CLetterImage});
  width: 180px;
  height: 165px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: absolute;
  left: calc(50% - 240px - 20%);
  top: 9%;
`;

const NLetter = styled(CLetter)`
  background-image: url(${NLetterImage});
  width: 268px;
  height: 246px;
  right: calc(50% - 240px - 20%);
  bottom: 9%;
  top: auto;
  left: auto;
`;

const DimmingOverlay = styled.div`
  @media (max-width: 450px) {
    flex-grow: 1;
  }
  > div {
    @media (min-width: 451px) {
      height: 100vh;
    }
    background: rgba(0, 0, 0, 0.3);
  }
`;
