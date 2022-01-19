import React from 'react';
import styled from 'styled-components';
import { setCssVariable } from '@/UserInterface/Foundation/Utils/cssUtils';
import { iconSize } from '@/UserInterface/styles/styled.props';

export interface ImageProps {
  readonly background?: string;
  readonly picture?: string;
}
const ImageContainer = styled.div<ImageProps>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.background};
  mask-image: ${(props) => (props.picture ? `url(${props.picture})` : 'none')};
  background-size: ${iconSize} ${iconSize};
  mask-size: ${iconSize} ${iconSize};
  mask-repeat: no-repeat;
  mask-position: center;
  mask-mode: alpha;
`;

const BlendImage = styled.img<ImageProps>`
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply;
  filter: ${(props) => (props.background ? 'brightness(1.3)' : '')};
`;

interface ChromaIconProps {
  src?: string;
  alt?: string;
  color?: string;
  size?: number;
}

export const ChromaIcon = (props: ChromaIconProps) => {
  if (props.size) setCssVariable('--node-viz-icon-size', `${props.size}px`);

  const background =
    props.color &&
    `linear-gradient(to right,${props.color} 0%,${props.color} 100%);`;

  return (
    <IconContainer>
      <ImageContainer
        background={background}
        picture={props.src}
        aria-label={props.alt}
      >
        <BlendImage src={props.src} alt={props.alt} background={background} />
      </ImageContainer>
    </IconContainer>
  );
};

const IconContainer = styled.div`
  width: ${iconSize};
  height: ${iconSize};
`;
