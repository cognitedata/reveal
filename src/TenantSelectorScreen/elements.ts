import styled from 'styled-components';

type Props = {
  backgroundImage: string;
};

export const StyledAuthenticationScreen = styled.div<Props>`
  height: 100%;

  > div {
    background: rgba(0, 0, 0, 0.3);
    background-image: ${(props) => `url(${props.backgroundImage})`};
    height: 100vh;

    > * {
      min-width: 480px;
      max-width: 480px;
    }
  }
`;
