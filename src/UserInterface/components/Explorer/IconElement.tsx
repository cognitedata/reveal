import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const DEFAULT_CANVAS_SIZE = 18;
const DEGREE = 180;

export interface ImageProps {
  readonly degree?: number;
}
const Image = styled.img<ImageProps>`
  filter: ${props => (props.degree ? `hue-rotate(${props.degree}deg)` : "hue-rotate(0)")};
`;

export default function IconElement(props: {
  src?: string;
  alt?: string;
  size?: string;
  color?: string;
}) {
  const canvasElm = useRef(null);
  const imageElm = useRef(null);

  const drawCanvas = (image: HTMLImageElement, canvas: HTMLCanvasElement) => {
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0, image.width, image.height);
      image.style.display = "none";

      const imageData = ctx.getImageData(0, 0, DEFAULT_CANVAS_SIZE, DEFAULT_CANVAS_SIZE);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const colorR = data[i];
        const colorG = data[i + 1];
        const colorB = data[i + 2];

        if (colorR === colorG && colorG === colorB && colorR > 0) {
          data[i + 1] = 0; // Green color
          data[i + 2] = 0; // Blue color
        }
      }
      ctx.putImageData(imageData, 0, 0);
    } else {
      // tslint:disable-next-line: no-console
      console.log("canvas: CTX Not found!", props.src);
    }
  };

  const handleImageLoad = () => {
    const canvas = canvasElm.current;
    const image = imageElm.current;
    if (canvas && image) {
      // drawCanvas(image, canvas); // un Comment this to use image coloring using canvas
    }
  };
  return (
    <div className="tree-icon center">
      <Image
        ref={imageElm}
        className="tree-img"
        src={props.src}
        alt={props.alt}
        height={props.size}
        width={props.size}
        degree={DEGREE}
        onLoad={handleImageLoad}
      />
      <canvas
        ref={canvasElm}
        style={{ display: "none" }}
        className="tree-canvas"
        height={DEFAULT_CANVAS_SIZE}
        width={DEFAULT_CANVAS_SIZE}
      />
    </div>
  );
}
