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

const VIEWER_FONT_TYPE = 'sans-serif'; // "Helvetica" Use brush instead here?

// ==================================================
// PUBLIC FUNCTIONS
// ==================================================

export function createSpriteWithText(
  text: string,
  worldHeight: number,
  color: Color,
  bgColor?: Color
): Sprite | undefined {
  const canvas = createCanvasWithText(text, color, bgColor);
  if (canvas === undefined) {
    return undefined;
  }
  return createSprite(canvas, worldHeight);
}

export function moveSpriteByPositionAndDirection(
  sprite: Sprite,
  position: Vector3,
  direction: Vector3
): void {
  // Align the text by sprite.position = position + (direction * sprite.scale) / 2;
  const newPosition = direction.clone();
  newPosition.multiply(sprite.scale);
  newPosition.divideScalar(2);
  newPosition.add(position);
  sprite.position.copy(newPosition);
}

export function moveSpriteByPositionAndAlignment(
  sprite: Sprite,
  position: Vector3,
  alignment: number
): void {
  sprite.position.copy(position);
  translateByAlignment(sprite, alignment);
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createSprite(canvas: HTMLCanvasElement, worldHeight: number): Sprite {
  const texture = createTexture(canvas);
  const spriteMaterial = new SpriteMaterial({ map: texture });
  const sprite = new Sprite(spriteMaterial);
  sprite.scale.set((worldHeight * canvas.width) / canvas.height, worldHeight, 1);
  return sprite;
}

function createTexture(canvas: HTMLCanvasElement): Texture {
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter; // Don't change this, https://stackoverflow.com/questions/55175351/remove-texture-has-been-resized-console-logs-in-three-js
  texture.magFilter = NearestFilter;

  // texture.generateMipmaps = true; // Default
  // texture.wrapS = THREE.ClampToEdgeWrapping;
  // texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createCanvasWithText(
  text: string,
  color: Color,
  bgColor?: Color
): HTMLCanvasElement | undefined {
  // https://www.javascripture.com/CanvasRenderingContext2D
  const borderSize = 2;
  const fontSize = 40;
  const font = getNormalFont(fontSize);

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

  // Draw optinal rounded rectangle
  if (bgColor !== undefined) {
    context.fillStyle = '#' + bgColor.getHexString();
    context.beginPath();
    context.roundRect(0, 0, width, height, 10);
    context.fill();
  }
  // Draw text
  context.font = font; // need to set font again after resizing canvas
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.translate(width / 2, height / 2);
  context.fillStyle = '#' + color.getHexString();
  context.fillText(text, 0, 2);
  return canvas;
}

function getFont(fontSize: number): string {
  return `${fontSize}px ${VIEWER_FONT_TYPE}`;
}

function getNormalFont(fontSize: number): string {
  return `Normal ${getFont(fontSize)}`;
}

function translateByAlignment(sprite: Sprite, alignment: number): void {
  //     alignment
  //   6     7     8
  //   3     4     5
  //   0     1     2

  // Examples:
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
