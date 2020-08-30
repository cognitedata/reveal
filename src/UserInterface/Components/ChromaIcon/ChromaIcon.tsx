import React from "react";
import styled from "styled-components";
import "./ChromaIcon.module.scss";
import { setCssVariable } from "@/UserInterface/Foundation/Utils/cssUtils";

export interface ImageProps {
  readonly background?: string;
  readonly picture?: string;
}
const ImageContainer = styled.div<ImageProps>`
  background: ${(props) => props.background};
  mask-image: ${(props) => (props.picture ? `url(${props.picture})` : "none")};
  -webkit-mask-image: ${(props) =>
    props.picture ? `url(${props.picture})` : "none"};
`;

const BlendImage = styled.img<ImageProps>`
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply;
  filter: ${(props) => (props.background ? "brightness(1.3)" : "")};
`;

export function ChromaIcon(props: {
  src?: string;
  alt?: string;
  color?: string;
  size?: number; // todo: add support for dynamic height adjustment
}) {
  if (props.size) setCssVariable("--node-viz-icon-size", `${props.size}px`);

  const background =
    props.color &&
    `linear-gradient(to right,${props.color} 0%,${props.color} 100%);`;

  return (
    <div className="chroma-icon-container">
      <ImageContainer
        className="chroma-icon chroma-icon-image-container center"
        background={background}
        picture={props.src}
        aria-label={props.alt}
      >
        <BlendImage
          className="chroma-icon-image"
          src={props.src}
          alt={props.alt}
          background={background}
        />
      </ImageContainer>
    </div>
  );
}
