import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Color from "color";

const DEFAULT_CANVAS_SIZE = 18; // NILS: What is this value?  How can I change icon size?  This value will not do it

export interface ImageProps
{
  readonly degree?: number;
}
const Image = styled.img<ImageProps>`
  filter: ${props => (props.degree ? `hue-rotate(${props.degree}deg)` : "hue-rotate(0)")};
`;

export default function IconElement(props: {
  src?: string;
  alt?: string;
  size?: string;
  color?: Color;
})
{
  const canvasElm = useRef(null);
  const imageElm = useRef(null);

  const drawCanvas = (image: HTMLImageElement, canvas: HTMLCanvasElement) =>
  {
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    if (ctx)
    {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0, image.width, image.height);  // NILS:  What is image.width, image.height??? Where do this come from, it's 18 all the time
      image.style.display = "none";

      const imageData = ctx.getImageData(0, 0, DEFAULT_CANVAS_SIZE, DEFAULT_CANVAS_SIZE);
      const data = imageData.data;

      let color = props.color;

      if (color)
      {
        for (let i = 0; i < data.length; i += 4)
        {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          if (r === g && g === b && r > 0) 
          {
            const fraction = r / 255; // white is 1, black is 0
            const newColorFrac = (0.5 + fraction) / 2; // white is 0.75. black is 0.25
            const oldColorFrac = 1 - newColorFrac;

            r = newColorFrac * color.red() + oldColorFrac * r;
            g = newColorFrac * color.green() + oldColorFrac * g;
            b = newColorFrac * color.blue() + oldColorFrac * b;

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    } else
    {
      // tslint:disable-next-line: no-console
      console.log("canvas: CTX Not found!", props.src);
    }
  };

  const handleImageLoad = () =>
  {
    const canvas = canvasElm.current;
    const image = imageElm.current;
    if (canvas && image)
    {
      drawCanvas(image, canvas); // un Comment this to use image coloring using canvas
    }
  };
  //const color = props.color;
  //const degree = color.hue;

  const degree = 200;

  return (
    <div className="tree-icon center">
      <Image
        ref={imageElm}
        className="tree-img"
        src={props.src}
        alt={props.alt}
        height={props.size}
        width={props.size}
        degree={degree}
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
