import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import * as Color from "color";
import { fabric } from "fabric";

const DEFAULT_ICON_SIZE = 18;
const USE_FABRIC = true; // todo: Mihil - remove once fabric.js evaluation is completed

export interface ImageProps
{
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
})
{
  const containerRef = useRef<null | HTMLDivElement>(null);
  const iconSize = props.size || DEFAULT_ICON_SIZE;

  // fabric js - start // todo: Mihil - remove once fabric.js evaluation is completed

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() =>
  {
    // only works when USE_FABRIC is true
    if (props.src && canvasRef.current)
    {
      const canvas = new fabric.Canvas(canvasRef.current);
      const imgInstance = fabric.Image.fromURL(props.src!, oImg =>
      {
        if (oImg)
        {
          oImg.scaleToHeight(iconSize);
          if (props.color)
          {
            const filter = new fabric.Image.filters.BlendColor({
              color: props.color.hex(),
              mode: "multiply",
              alpha: 1.5
            });
            oImg.applyFilters([filter]);
          }
          canvas.renderAll();
          canvas.add(oImg);
        }
      });
    }
  }, [props.src, canvasRef.current]);

  // fabric.js - end

  const paintImage = (container: HTMLElement) =>
  {
    const canvas = container.getElementsByTagName("canvas")[0] || document.createElement("canvas");
    const image = container.getElementsByClassName("tree-img")[0] as HTMLImageElement;

    const padding = 1;
    canvas.height = iconSize + padding * 2;
    canvas.width = iconSize + padding * 2;
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (ctx)
    {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, padding, padding, iconSize, iconSize);

      image.style.display = "none";
      const color = props.color;
      if (color)
      {
        const imageData = ctx.getImageData(0, 0, iconSize + padding * 2, iconSize + padding * 2);
        const data = imageData.data;

        const minFaction = 0.0;
        const maxFaction = 0.667;

        for (let i = 0; i < data.length; i += 4)
        {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          if (r === g && g === b && r > 0)
          {
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
        ctx.putImageData(imageData, 0, 0);
      }
    }
    else
    {
      // tslint:disable-next-line: no-console
      console.log("canvas: CTX Not found!", props.src);
    }
  };

  const handleImageLoad = () =>
  {
    if (containerRef.current)
    {
      paintImage(containerRef.current as HTMLElement);
    }
  };

  if (USE_FABRIC)
  {
    // todo: Mihil - remove this check once fabric.js evaluation is completed
    return (
      <div className="tree-icon center" ref={containerRef}>
        <canvas ref={canvasRef} height={iconSize} width={iconSize} />
      </div>
    );
  } else
  {
    return (
      <div className="tree-icon center" ref={containerRef}>
        <img
          className="tree-img"
          src={props.src}
          alt={props.alt}
          height={iconSize}
          width={iconSize}
          onLoad={handleImageLoad}
        />
      </div>
    );
  }
}
