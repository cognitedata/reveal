//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import * as THREE from "three";

import { Vector3 } from "@/Core/Geometry/Vector3";
import { ViewInfo, TextItem } from "@/Core/Views/ViewInfo";
import Color from "color";
import { Canvas } from "@/Three/Utilities/Canvas";
import { Util } from "@/Core/Primitives/Util";
import { Colors } from "@/Core/Primitives/Colors";
import { Appearance } from "@/Core/States/Appearance";

export class TreeOverlay
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private scene: THREE.Scene | null = null;

  private camera: THREE.Camera | null = null;

  // eslint-disable-next-line react/static-property-placement
  private context: CanvasRenderingContext2D | null = null;

  private texture: THREE.Texture | null = null;

  private delta = new Vector3(-1, -1);

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public render(renderer: THREE.WebGLRenderer, viewInfo: ViewInfo, delta: Vector3, fgColor: Color, bgColor: Color): void
  {
    if (viewInfo.isEmpty)
      return;

    if (!this.delta.equals(delta))
      this.initialize(delta);

    const {context} = this;
    if (!context)
      return;

    if (!this.texture)
      return;

    if (!this.scene)
      return;

    if (!this.camera)
      return;

    context.clearRect(0, 0, this.delta.x, this.delta.y);

    this.renderTextItems(context, viewInfo.items, delta, Appearance.viewerOverlayFontSize, Appearance.viewerOverlayFgColor, Appearance.viewerOverlayBgColor);
    this.renderFooter(context, viewInfo.footer, Appearance.viewerFooterFontSize, fgColor, bgColor);
    this.texture.needsUpdate = true;
    renderer.render(this.scene, this.camera);
  }

  //==================================================
  // INSTANCE METHODS: Helpers
  //==================================================

  private clear(): void
  {
    if (this.texture)
    {
      this.texture.dispose();
      this.texture = null;
    }
    if (this.context)
      this.context = null;
    if (this.camera)
      this.camera = null;
    if (this.scene)
    {
      while (this.scene.children.length)
      {
        const child = this.scene.children[0];
        this.scene.remove(child);
        if (child instanceof THREE.Mesh)
        {
          const material = child.material as THREE.Material;
          if (material)
            material.dispose();
          const {geometry} = child;
          if (geometry)
            geometry.dispose();
        }
      }
    }
  }

  private initialize(delta: Vector3): void
  {
    //  Very simple example rendering pure Three.js HUD on top of
    //  a 3D scene. 
    //  For more info, read the blog post about this experiment:
    //  http://www.evermade.fi/pure-three-js-hud/ 
    //  For more fanciness, follow me on Twitter @jalajoki
    this.clear();
    const canvas = document.createElement("canvas");

    this.delta = delta;

    canvas.width = this.delta.x;
    canvas.height = this.delta.y;

    this.context = canvas.getContext("2d");
    if (!this.context)
      return;

    // Create the camera and set the viewport to match the screen dimensions.
    this.camera = new THREE.OrthographicCamera(-this.delta.x / 2, this.delta.x / 2, this.delta.y / 2, -this.delta.y / 2, 0, 30);

    // Create texture from rendered graphics.
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.generateMipmaps = false;
    this.texture.minFilter = THREE.LinearFilter;

    // Create material.
    const material = new THREE.MeshBasicMaterial({ map: this.texture });
    material.transparent = true;

    // Create plane to render. This plane fill the whole screen.
    const planeGeometry = new THREE.PlaneGeometry(this.delta.x, this.delta.y);
    const plane = new THREE.Mesh(planeGeometry, material);

    if (!this.scene)
      this.scene = new THREE.Scene();
    this.scene.add(plane);
  }

  //==================================================
  // INSTANCE METHODS: Render
  //==================================================

  public renderTextItems(context: CanvasRenderingContext2D, items: TextItem[], delta: Vector3, fontSize: number, fgColor: Color, bgColor: Color): void
  {
    if (!items || !items.length)
      return;

    const margin = fontSize * 0.33;
    const spacing = fontSize;
    const lineDy = 1.5 * fontSize;

    context.textAlign = "left";
    context.textBaseline = "top";

    // Measure the keys
    context.font = Canvas.getBoldFont(fontSize);
    let keyDx = 0;
    for (const item of items)
    {
      const metric = context.measureText(item.key);
      keyDx = Math.max(keyDx, metric.width);
    }

    // Measure the values
    const maxDx = Math.max(200, keyDx);
    context.font = Canvas.getNormalFont(fontSize);
    let valueDx = 0;
    let textDy = 0;
    for (const item of items)
    {
      this.measureValue(context, item, maxDx, lineDy);
      valueDx = Math.max(valueDx, item.dx);
      textDy += item.dy;
    }
    textDy -= 0.4 * fontSize;

    // Calulate the size
    const dx = margin + keyDx + spacing + valueDx + margin;
    const dy = margin + textDy + margin;
    const xmin = margin;
    const ymin = delta.y - margin - dy;

    let x = xmin;
    let y = ymin;

    // Fill the rectangle with shadow
    context.shadowColor = Canvas.getColor(fgColor.alpha(0.5));
    context.shadowBlur = 3;
    context.shadowOffsetX = 6;
    context.shadowOffsetY = 6;
    context.fillStyle = Canvas.getColor(bgColor);
    context.fillRect(x, y, dx, dy);
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    // Draw a border around the rectangle
    context.strokeStyle = Canvas.getColor(fgColor);
    context.lineWidth = 1;
    context.strokeRect(x, y, dx, dy);

    context.fillStyle = Canvas.getColor(fgColor);

    // Draw the keys
    x += margin;
    y += margin;
    context.font = Canvas.getBoldFont(fontSize);
    for (const item of items)
    {
      context.fillText(item.key, x, y);
      y += item.dy;
    }

    // Draw the values
    x += keyDx + spacing;
    y = ymin + margin;
    context.font = Canvas.getNormalFont(fontSize);
    for (const item of items)
    {
      if (item.value)
      {
        if (item.isMultiLine)
          Canvas.fillText(context, item.value, x, y, maxDx + margin, lineDy);
        else
          context.fillText(item.value, x, y);
      }
      y += item.dy;
    }
  }

  public measureValue(context: CanvasRenderingContext2D, item: TextItem, maxWidth: number, lineHeight: number): void
  {
    if (item.dy > 0)
      return; // Already done

    item.isMultiLine = false;
    item.dy = lineHeight;
    item.dx = 0;

    if (!item.value)
      return;

    item.dx = context.measureText(item.value).width;
    if (item.dx > maxWidth)
    {
      item.isMultiLine = true;
      item.dx = maxWidth;
      item.dy = Canvas.measureTextHeight(context, item.value, 1.025 * maxWidth, lineHeight);
    }
  }

  public renderFooter(context: CanvasRenderingContext2D, text: string, fontSize: number, fgColor: Color, bgColor: Color): void
  {
    if (Util.isEmpty(text))
      return;

    context.fillStyle = Canvas.getColor(fgColor);
    context.shadowBlur = 2;
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;

    context.font = Canvas.getNormalFont(fontSize);
    context.textAlign = "right";
    context.textBaseline = "bottom";

    context.fillText(text, this.delta.x - 6, this.delta.y - 3);

    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
  }
}