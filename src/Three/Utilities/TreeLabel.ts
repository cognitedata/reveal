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

import * as THREE from 'three';

export class TreeLabel 
{
  static create(text: string, worldHeight: number, white = true): THREE.Sprite | null
  {
    const borderSize = 2;
    const canvas = document.createElement('canvas');
    {
      const context = canvas.getContext('2d');
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
      context.textBaseline = 'middle';
      context.textAlign = 'center';

      //context.fillStyle = 'red';
      //context.fillRect(0, 0, width, height);

      // scale to fit but don't stretch
      context.translate(width / 2, height / 2);
      context.fillStyle = white ? 'white' : 'black';
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
}
