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
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

export class ThreeLabel 
{
  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByPositionAndDirection(text: string, position: Vector3, tickDirection: Vector3, worldHeight: number, white = true): THREE.Sprite | null
  {
    const label = ThreeLabel.create(text, worldHeight, white);
    if (!label)
      return null;

    // Align the text
    label.position.x = position.x + tickDirection.x * label.scale.x / 2;
    label.position.y = position.y + tickDirection.y * label.scale.y / 2;
    label.position.z = position.z + tickDirection.z * label.scale.z / 2;
    return label;
  }

  public static createByPositionAndAlignment(text: string, position: Vector3, alignment: number, worldHeight: number, white = true): THREE.Sprite | null
  {
    const sprite = ThreeLabel.create(text, worldHeight, white);
    if (!sprite)
      return null;

    sprite.position.copy(ThreeConverter.toVector(position));
    ThreeLabel.align(sprite, alignment);
    return sprite;
  }

  public static create(text: string, worldHeight: number, white = true): THREE.Sprite | null
  {
    const borderSize = 2;
    const canvas = document.createElement("canvas");
    {
      const context = canvas.getContext("2d");
      if (!context)
        return null;

      const fontSize = 30;
      const font = `${fontSize}px Helvetica`;
      context.font = font;
      // measure how long the name will be
      const textWidth = context.measureText(text).width;

      const doubleBorderSize = borderSize * 2;
      const width = (textWidth + 2 * doubleBorderSize);
      const height = fontSize + doubleBorderSize;

      canvas.width = width;
      canvas.height = height;

      // need to set font again after resizing canvas
      context.font = font;
      context.textBaseline = "middle";
      context.textAlign = "center";

      //context.fillStyle = 'red';
      //context.fillRect(0, 0, width, height);

      // scale to fit but don't stretch
      context.translate(width / 2, height / 2);
      context.fillStyle = white ? "white" : "black";
      context.fillText(text, 0, 0);
    }
    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(worldHeight * canvas.width / canvas.height, worldHeight, 1);
    return sprite;
  }

  //==================================================
  // STATIC METHODS: Helpers
  //==================================================

  private static align(sprite: THREE.Sprite, alignment: number): void
  {
    //     alignment
    //   6     7     8
    //   3     4     5
    //   0     1     2 

    // If alignment == 0:
    //    Text Here
    //   +          <--- Point
    //
    // If alignment == 8
    //            + <--- Point
    //   Text Here

    switch (alignment)
    {
      case 0:
      case 3:
      case 6:
        sprite.position.x -= sprite.scale.x / 2;
        break;

      case 2:
      case 5:
      case 8:
        sprite.position.x += sprite.scale.x / 2;
        break;
    }
    switch (alignment)
    {
      case 0:
      case 1:
      case 2:
        sprite.position.z += sprite.scale.y / 2;
        break;

      case 6:
      case 7:
      case 8:
        sprite.position.z -= sprite.scale.y / 2;
        break;
    }
  }
}
