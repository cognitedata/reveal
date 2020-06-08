import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import * as Color from "color";
import { fabric } from "fabric";

const DEFAULT_ICON_SIZE = 18;

export interface ImageProps {
  readonly degree?: number;
}
const Image = styled.img<ImageProps>`
  filter: ${props => (props.degree ? `hue-rotate(${props.degree}deg)` : "hue-rotate(0)")};
`;

export default function TreeIcon(props: {
  src?: string;
  alt?: string;
  size?: number;
  color?: Color;
}) {
  const containerRef = useRef<null | HTMLDivElement>(null);
  const iconSize = props.size || DEFAULT_ICON_SIZE;

  // fabric js

  // const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // useEffect(() => {
  //   if (props.src && canvasRef.current) {
  //     const canvas = new fabric.Canvas(canvasRef.current);
  //     const imgInstance = fabric.Image.fromURL(props.src!, oImg => {
  //       //do nothing
  //       oImg.scaleToHeight(iconSize);
  //       oImg.scaleToWidth(iconSize);
  //       canvas.add(oImg);
  //     });
  //   }
  // }, [props.src, canvasRef.current]);

  const paintImage = (container: HTMLElement) => {
    const canvas = container.getElementsByTagName("canvas")[0] || document.createElement("canvas");
    const image = container.getElementsByClassName("tree-img")[0] as HTMLImageElement;
    canvas.height = iconSize + 2;
    canvas.width = iconSize + 2;
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, iconSize, iconSize);
      image.style.display = "none";

      const imageData = ctx.getImageData(0, 0, iconSize, iconSize);
      const data = imageData.data;

      const color = props.color;

      if (color) {
        const minFaction = 0.0;
        const maxFaction = 0.667;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          if (r === g && g === b && r > 0) {
            const fraction = r / 255; // white is 1, black is 0

            const newColorFrac = minFaction + fraction * (maxFaction - minFaction); // white is 0.75. black is 0.25
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
    } else {
      // tslint:disable-next-line: no-console
      console.log("canvas: CTX Not found!", props.src);
    }
  };

  const handleImageLoad = () => {
    if (containerRef.current) {
      paintImage(containerRef.current as HTMLElement);
    }
  };

  const degree = 200;

  return (
    <div className="tree-icon center" ref={containerRef}>
      <Image
        className="tree-img"
        src={props.src}
        alt={props.alt}
        degree={degree}
        onLoad={handleImageLoad}
      />
      {/* <canvas ref={canvasRef} height={iconSize} width={iconSize} /> */}
    </div>
  );
}
