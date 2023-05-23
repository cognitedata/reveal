import styled from 'styled-components';

type BackgroundProps = {
  image: string;
  imageSmall: string;
};

export const BgImg = styled.div<BackgroundProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: ${(props) =>
    `url(${props.image}), url(${props.imageSmall});`};
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  background-size: cover, cover;
`;

export default BgImg;
