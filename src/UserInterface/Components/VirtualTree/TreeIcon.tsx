import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import * as Color from "color";
import { fabric } from "fabric";
import { readCssVariablePixelNumber } from "@/UserInterface/Foundation/Utils/cssUtils";

const DEF_ICON_SIZE = 18;
const USE_FABRIC = true; // todo: Mihil - remove once fabric.js evaluation is completed

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

export default function TreeIcon(props: {
  src?: string;
  alt?: string;
  size?: number;
  color?: Color;
}) {
  const DEFAULT_ICON_SIZE =
    readCssVariablePixelNumber("--v-tree-icon-size") || DEF_ICON_SIZE;

  const iconSize = props.size || DEFAULT_ICON_SIZE;

  // fabric js - start // todo: Mihil - remove once fabric.js evaluation is completed

  const containerRef = useRef<null | HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas>(null);
  const imageRef = useRef<fabric.Image>(null);

  const setImage = (
    fabricImage: fabric.Image,
    fabricCanvas: fabric.Canvas,
    size?: number,
    color?: Color
  ) => {
    if (fabricImage && fabricCanvas) {
      fabricImage.scaleToHeight(iconSize);
      if (color) {
        const filter = new fabric.Image.filters.BlendColor({
          color: color.hex(),
          mode: "multiply",
          alpha: 1.5,
        });
        fabricImage.applyFilters([filter]);
      }
      fabricImage.selectable = false;
      fabricCanvas.hoverCursor = "default";
      fabricCanvas.renderAll();
      fabricCanvas.add(fabricImage);
    }
  };

  // add image
  useEffect(() => {
    // only works when USE_FABRIC is true
    if (props.src && canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        selection: false,
        width: iconSize,
        height: iconSize,
      });
      // @ts-ignore
      fabricRef.current = canvas;

      fabric.Image.fromURL(props.src, (oImg) => {
        setImage(oImg, canvas, props.size, props.color);
        // @ts-ignore
        imageRef.current = oImg;
      });
    }
  }, [canvasRef.current, props.src, props.color, props.size]);

  // change Color

  useEffect(() => {
    const fabricCanvas = fabricRef.current;
    const fabricImage = imageRef.current;

    if (fabricImage && fabricCanvas) {
      setImage(fabricImage, fabricCanvas, props.size, props.color);
    }
  }, [props.color, props.size, imageRef, fabricRef]);
  // fabric.js - end

  // const paintImage = (container: HTMLElement) =>
  // {
  //   const canvas = container.getElementsByTagName("canvas")[0] || document.createElement("canvas");
  //   const image = container.getElementsByClassName("tree-img")[0] as HTMLImageElement;
  //
  //   const padding = 0;
  //   canvas.height = iconSize + padding * 2;
  //   canvas.width = iconSize + padding * 2;
  //   container.appendChild(canvas);
  //
  //   const ctx = canvas.getContext("2d");
  //   if (ctx)
  //   {
  //     ctx.imageSmoothingEnabled = true;
  //     ctx.imageSmoothingQuality = "high";
  //     ctx.drawImage(image, padding, padding, iconSize, iconSize);
  //
  //     image.style.display = "none";
  //     const color = props.color;
  //     if (color)
  //     {
  //       const imageData = ctx.getImageData(0, 0, iconSize + padding * 2, iconSize + padding * 2);
  //       const data = imageData.data;
  //
  //       const minFaction = 0.0;
  //       const maxFaction = 0.667;
  //
  //       for (let i = 0; i < data.length; i += 4)
  //       {
  //         let r = data[i];
  //         let g = data[i + 1];
  //         let b = data[i + 2];
  //
  //         if (r === g && g === b && r > 0)
  //         {
  //           const fraction = r / 255; // white is 1, black is 0
  //
  //           const newColorFrac = minFaction + fraction * (maxFaction - minFaction); // white is 0.75. black is 0.25
  //           const oldColorFrac = 1 - newColorFrac;
  //
  //           r = newColorFrac * color.red() + oldColorFrac * r;
  //           g = newColorFrac * color.green() + oldColorFrac * g;
  //           b = newColorFrac * color.blue() + oldColorFrac * b;
  //
  //           data[i] = r;
  //           data[i + 1] = g;
  //           data[i + 2] = b;
  //         }
  //       }
  //       ctx.putImageData(imageData, 0, 0);
  //     }
  //   }
  //   else
  //   {
  //     // tslint:disable-next-line: no-console
  //     console.log("canvas: CTX Not found!", props.src);
  //   }
  // };
  //
  // const handleImageLoad = () =>
  // {
  //   if (containerRef.current)
  //   {
  //     paintImage(containerRef.current as HTMLElement);
  //   }
  // };
  // return (
  //   <div className="tree-icon center" ref={containerRef}>
  //     <img
  //       className="tree-img"
  //       src={props.src}
  //       alt={props.alt}
  //       height={iconSize}
  //       width={iconSize}
  //       onLoad={handleImageLoad}
  //     />
  //   </div>
  // );

  if (USE_FABRIC) {
    // todo: Mihil - remove this check once fabric.js evaluation is completed
    return (
      <div className="tree-icon center" ref={containerRef}>
        <canvas ref={canvasRef} height={iconSize} width={iconSize} />
      </div>
    );
  }
  const background =
    props.color &&
    `linear-gradient(to right,${props.color.hex()} 0%,${props.color.hex()} 100%);`;

  return (
    <ImageContainer
      className="tree-icon tree-icon-image-container center"
      background={background}
      picture={props.src}
      aria-label={props.alt}
    >
      <img className="tree-icon-image" src={props.src} alt={props.alt} />
    </ImageContainer>
  );
}
