/*!
 * Copyright 2024 Cognite AS
 */

import {
  SpriteMaterial,
  CanvasTexture,
  type Vector3,
  type Color,
  Sprite,
  LinearFilter,
  NearestFilter,
  type Texture
} from 'three';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SpriteCreator {
  //= =================================================
  // STATIC METHODS:
  //= =================================================

  public static createByPositionAndDirection(
    text: string,
    position: Vector3,
    tickDirection: Vector3,
    worldHeight: number,
    color: Color
  ): Sprite | undefined {
    const label = SpriteCreator.create(text, worldHeight, color);
    if (label === undefined) {
      return undefined;
    }
    // Align the text
    label.position.x = position.x + (tickDirection.x * label.scale.x) / 2;
    label.position.y = position.y + (tickDirection.y * label.scale.y) / 2;
    label.position.z = position.z + (tickDirection.z * label.scale.z) / 2;
    return label;
  }

  public static createByPositionAndAlignment(
    text: string,
    position: Vector3,
    alignment: number,
    worldHeight: number,
    color: Color
  ): Sprite | undefined {
    const sprite = SpriteCreator.create(text, worldHeight, color);
    if (sprite === undefined) {
      return undefined;
    }
    sprite.position.copy(position);
    SpriteCreator.align(sprite, alignment);
    return sprite;
  }

  private static create(text: string, worldHeight: number, color: Color): Sprite | undefined {
    const canvas = SpriteCreator.createCanvasWithText(text, color);
    if (canvas === undefined) {
      return undefined;
    }
    return SpriteCreator.createSprite(canvas, worldHeight);
  }

  private static createSprite(canvas: HTMLCanvasElement, worldHeight: number): Sprite {
    const texture = SpriteCreator.createTexture(canvas);
    const spriteMaterial = new SpriteMaterial({ map: texture });
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set((worldHeight * canvas.width) / canvas.height, worldHeight, 1);
    return sprite;
  }

  private static createTexture(canvas: HTMLCanvasElement): Texture {
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter; // Don't change this, https://stackoverflow.com/questions/55175351/remove-texture-has-been-resized-console-logs-in-three-js
    texture.magFilter = NearestFilter;

    // texture.generateMipmaps = true; // Default
    // texture.wrapS = THREE.ClampToEdgeWrapping;
    // texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  static viewerFontType = 'sans-serif'; // "Helvetica" Use brush instead here?
  private static getFont(fontSize: number): string {
    return `${fontSize}px ${this.viewerFontType}`;
  }

  public static getNormalFont(fontSize: number): string {
    return `Normal ${this.getFont(fontSize)}`;
  }

  private static createCanvasWithText(text: string, color: Color): HTMLCanvasElement | undefined {
    // https://www.javascripture.com/CanvasRenderingContext2D
    const borderSize = 2;
    const fontSize = 40;
    const font = this.getNormalFont(fontSize);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) {
      return undefined;
    }

    // measure how long the name will be
    context.font = font;
    const textWidth = context.measureText(text).width;

    const doubleBorderSize = borderSize * 2;
    const width = textWidth + 2 * doubleBorderSize;
    const height = fontSize + doubleBorderSize;

    canvas.width = width;
    canvas.height = height;

    // need to set font again after resizing canvas
    context.font = font;
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    // context.fillStyle = 'red';
    // context.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    context.translate(width / 2, height / 2);
    context.fillStyle = '#' + color.getHexString();
    context.fillText(text, 0, 0);
    return canvas;
  }

  //= =================================================
  // STATIC METHODS: Helpers
  //= =================================================

  private static align(sprite: Sprite, alignment: number): void {
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

    switch (alignment) {
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
    switch (alignment) {
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
