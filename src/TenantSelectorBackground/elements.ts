import styled from 'styled-components';
import CLetterImage from 'assets/CLetter.svg';
import NLetterImage from 'assets/NLetter.svg';

export type BackgroundProps = {
  backgroundImage: string;
};

export const Background = styled.div<BackgroundProps>`
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: ${(props) => `url(${props.backgroundImage})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

export const CogniteLogo = styled.div`
  position: absolute;
  top: 3%;
  left: 3%;
`;

export const StyledIconWrapper = styled.div`
  width: 169px;
  height: 38px;
`;

export const CLetter = styled.div`
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

export const NLetter = styled(CLetter)`
  background-image: url(${NLetterImage});
  width: 268px;
  height: 246px;
  right: calc(50% - 240px - 20%);
  bottom: 9%;
  top: auto;
  left: auto;
`;

export const DimmingOverlay = styled.div`
  > div {
    background: rgba(0, 0, 0, 0.3);
    height: 100vh;
  }
`;
