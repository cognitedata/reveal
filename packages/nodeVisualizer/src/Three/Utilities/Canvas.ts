//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import * as THREE from "three";
import * as Color from "color";

import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";
import { Appearance } from "@/Core/States/Appearance";
import { ColorMap } from "@/Core/Primitives/ColorMap";

export class Canvas {
  // A lot of tips here:
  // https://www.javascripture.com/CanvasRenderingContext2D

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private dx = 0;

  private dy = 0;

  // These 3 values af for beginFunction, fillFunction and addFunctionValue
  private firstX = Number.NaN;

  private lastX = Number.NaN;

  private fillFunction = false;

  private canvas: HTMLCanvasElement

  private gradient: CanvasGradient | null = null;

  // eslint-disable-next-line react/static-property-placement
  private context: CanvasRenderingContext2D;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(dx: number, dy: number) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      this.canvas = new HTMLCanvasElement();
      this.context = new CanvasRenderingContext2D();
      return;
    }
    canvas.width = dx;
    canvas.height = dy;
    this.dx = dx;
    this.dy = dy;
    this.canvas = canvas;
    this.context = context;
  }

  //= =================================================
  // INSTANCE METHODS: Misc
  //= =================================================

  public createTexture(): THREE.CanvasTexture | null {
    return SpriteCreator.createTexture(this.canvas);
  }

  //= =================================================
  // INSTANCE METHODS:
  //= =================================================

  public clear(color: Color): void {
    this.context.fillStyle = Canvas.getColor(color);
    this.context.fillRect(0, 0, this.dx, this.dy);
  }

  //= =================================================
  // INSTANCE METHODS: Path
  //= =================================================

  public beginPath() {
    this.context.beginPath();
  }

  public closePath() {
    this.context.closePath();
  }

  public drawPath(color: Color | null = null, lineWidth = 1) {
    this.context.lineCap = "round";
    this.context.lineWidth = lineWidth;
    this.context.strokeStyle = Canvas.getColor(color);
    this.context.stroke();
  }

  public addVerticalLine(xCoordinate: number) {
    const x = xCoordinate * this.dx;
    this.context.moveTo(x, 0);
    this.context.lineTo(x, this.dy);
  }

  //= =================================================
  // INSTANCE METHODS: Function path
  //= =================================================

  public beginFunction(fillPath: boolean) {
    this.fillFunction = fillPath;
    this.firstX = Number.NaN;
    this.gradient = null;
  }

  public closeFunction(reverse: boolean): boolean {
    if (Number.isNaN(this.firstX))
      return false;

    if (this.fillFunction)
      this.context.lineTo(this.lastX, reverse ? this.dy : 0);

    this.lastX = Number.NaN;
    this.firstX = Number.NaN;
    return true;
  }

  public addFunctionValue(xFraction: number, yFraction: number, reverse: boolean, colorMap: ColorMap | null = null) {
    // assume: xFraction and yFraction in [0,1]
    if (colorMap) {
      if (!this.gradient)
        this.gradient = this.context.createLinearGradient(0, 0, this.dx, 0);
      this.gradient.addColorStop(xFraction, Canvas.getColor(colorMap.getColor(yFraction)));
    }
    const x = this.dx * xFraction;
    const y = this.dy * (reverse ? 1 - yFraction : yFraction);

    if (Number.isNaN(this.firstX)) {
      this.beginPath();
      this.firstX = x;
      if (this.fillFunction)
        this.context.moveTo(x, reverse ? this.dy : 0);
    }
    this.context.lineTo(x, y);
    this.lastX = x;
  }

  //= =================================================
  // INSTANCE METHODS: Path
  //= =================================================

  public drawText(x: number, text: string, fontSize: number, color: Color | null, rightBand: boolean, outerMost: boolean = true) {
    // https://www.javascripture.com/CanvasRenderingContext2D
    const borderSize = fontSize * 0.1;
    const font = Canvas.getBolderFont(fontSize);

    this.context.font = font;
    this.context.textBaseline = "alphabetic";
    this.context.fillStyle = Canvas.getColor(color);

    this.context.save();
    this.context.translate(x * this.dx - borderSize, outerMost ? this.dy - borderSize : borderSize);

    this.context.rotate(-Math.PI / 2);
    if (!rightBand)
      this.context.scale(-1, 1);

    if (rightBand === outerMost)
      this.context.textAlign = "left";
    else
      this.context.textAlign = "right";

    this.context.fillText(text, 0, 0);
    this.context.restore();
  }

  //= =================================================
  // INSTANCE METHODS: Filling
  //= =================================================

  public fillPath(color: Color, alphaFraction = 1) {
    const colorWithAlpha = alphaFraction !== 1
      ? color.alpha(alphaFraction)
      : color;

    this.context.fillStyle = Canvas.getColor(colorWithAlpha);
    this.context.fill();
  }

  public fillRect(x0Unscaled: number, x1Unscaled: number, color: Color, alphaFraction = 1) {
    const colorWithAlpha = alphaFraction !== 1
      ? color.alpha(alphaFraction)
      : color;
    const x0 = this.dx * x0Unscaled;
    const x1 = this.dx * x1Unscaled;

    this.context.fillStyle = Canvas.getColor(colorWithAlpha);
    this.context.fillRect(x0, 0, x1 - x0, this.dy);
  }

  public fillPathBySemiTransparentGradient(color: Color, alphaFraction: number, reverse: boolean) {
    const operation = this.context.globalCompositeOperation;
    this.context.globalCompositeOperation = "darker";
    const colorWithAlpha = alphaFraction !== 1
      ? color.alpha(alphaFraction)
      : color;

    if (this.gradient) {
      this.context.fillStyle = this.gradient;
      this.gradient = null;
    } else {
      const gradient = this.context.createLinearGradient(0, reverse ? this.dy : 0, 0, reverse ? 0 : this.dy);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, Canvas.getColor(colorWithAlpha));
      this.context.fillStyle = gradient;
    }
    this.context.fill();
    this.context.globalCompositeOperation = operation;
  }

  //= =================================================
  // STATIC METHODS: Filling
  //= =================================================

  public static getColor(color: Color | null) { return color ? color.string() : "black"; };

  private static getFont(fontSize: number): string { return `${fontSize}px ${Appearance.viewerFontType}`; }

  public static getNormalFont(fontSize: number): string { return `Normal ${Canvas.getFont(fontSize)}`; }

  public static getBoldFont(fontSize: number): string { return `Bold ${Canvas.getFont(fontSize)}`; }

  public static getBolderFont(fontSize: number): string { return `Bolder ${Canvas.getFont(fontSize)}`; }

  public static measureTextHeight(context: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): number {
    return Canvas.fillOrTextHeightText(context, text, -1, -1, maxWidth, lineHeight);
  }

  public static fillText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    Canvas.fillOrTextHeightText(context, text, x, y, maxWidth, lineHeight);
  }

  private static fillOrTextHeightText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const words = text.split(" ");
    let line = "";
    let height = 0;
    const draw = x >= 0 && y >= 0;
    for (let index = 0; index < words.length; index++) {
      let testLine = line;
      if (line.length > 0)
        testLine += " ";
      testLine += words[index];
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && index > 0) {
        if (draw)
          context.fillText(line, x, y + height);
        line = words[index];
        height += lineHeight;
      } else
        line = testLine;
    }
    if (draw)
      context.fillText(line, x, y + height);
    height += lineHeight;
    return height;
  }

}
