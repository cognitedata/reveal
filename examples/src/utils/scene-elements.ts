/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export function createPathNode(path: THREE.Vector3[], indicatorSphereCount: number = 30): THREE.Group {
  const pathGroup = new THREE.Group();
  pathGroup.add(new THREE.HemisphereLight(new THREE.Color('white'), new THREE.Color('black')));
  pathGroup.name = 'Path with line and indicator spheres';

  // Create a spline line from the path
  const curve = new THREE.CatmullRomCurve3(path);
  const positions = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions.map(p => [p.x, p.y, p.z]).flat(), 3));
  const lineMaterial = new THREE.LineDashedMaterial({ scale: 2, gapSize: 1, dashSize: 1, color: 'red' });
  const line = new THREE.Line(geometry, lineMaterial);
  line.name = 'Path';
  pathGroup.add(line);

  // Create animated indictators that follow the direction of the path
  const sphereGeometry = new THREE.SphereBufferGeometry(0.1);
  const sphereMaterial = new THREE.MeshPhongMaterial({ color: 'red' });
  const eqiSpacedPoinst = curve.getSpacedPoints(indicatorSphereCount);
  for (let i = 0; i < indicatorSphereCount; i++) {
    const offset = i;
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const spherePosIdx = { idx: 0 };
    new TWEEN.Tween(spherePosIdx)
      .to({ idx: eqiSpacedPoinst.length - 1 }, 20000)
      .repeat(Infinity)
      .onUpdate(() => {
        const prev = eqiSpacedPoinst[Math.floor((spherePosIdx.idx + offset) % indicatorSphereCount)];
        const next = eqiSpacedPoinst[Math.ceil((spherePosIdx.idx + offset) % indicatorSphereCount)];
        const s = spherePosIdx.idx - Math.trunc(spherePosIdx.idx);
        mesh.position.set(0, 0, 0);
        mesh.position.addScaledVector(prev, 1.0 - s);
        mesh.position.addScaledVector(next, s);
      })
      .start();
    pathGroup.add(mesh);
  }

  return pathGroup;
}

export interface TextSpriteParameters {
  fontface?: string;
  fontsize?: number;
  borderThickness?: number;
  textColor?: THREE.Color;
  borderColor?: THREE.Color;
  backgroundColor?: THREE.Color;
  spriteCenter?: THREE.Vector2;
}

export interface TextSpriteDefinition {
  text: string;
  pos: THREE.Vector3;
  paramters?: TextSpriteParameters;
}

export function createTextSpriteNode(textSpriteDefinitions: TextSpriteDefinition[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Text sprites';
  for (const spriteDef of textSpriteDefinitions) {
    const sprite = createTextSprite(spriteDef.text, { fontsize: 44, borderColor: new THREE.Color('#A9A9A9') });
    sprite.position.copy(spriteDef.pos);
    group.add(sprite);
  }
  return group;
}

function colorToStyle(color: THREE.Color): string {
  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);
  return `rgba(${r},${g},${b},1)`;
}

export function createTextSprite(message: string, parameters?: TextSpriteParameters) {
  if (parameters === undefined) {
    parameters = {};
  }

  const textColor = parameters.textColor || new THREE.Color('black');
  const fontFace = parameters.fontface || 'Arial';
  const fontSize = parameters.fontsize || 44;
  const borderThickness = parameters.borderThickness || 4;
  const borderColor = parameters.borderColor || new THREE.Color('#A9A9A9');
  const backgroundColor = parameters.backgroundColor || new THREE.Color('white');
  const spriteCenter = parameters.spriteCenter || new THREE.Vector2(0.5, 0.5);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = 'Bold ' + fontSize + 'px ' + fontFace;

  // Determine size
  const metrics = context.measureText(message);
  const textWidth = metrics.width;
  canvas.width = textWidth + 2 * borderThickness;
  // 1.4 is extra height factor for text below baseline: g,j,p,q.
  canvas.height = fontSize * 1.4 + 2 * borderThickness;
  // Font is reset after setting size for some reason
  context.font = 'Bold ' + fontSize + 'px ' + fontFace;

  // Draw border
  context.fillStyle = colorToStyle(backgroundColor);
  context.strokeStyle = colorToStyle(borderColor);
  context.lineWidth = borderThickness;
  drawRoundedRectangle(
    context,
    borderThickness / 2,
    borderThickness / 2,
    textWidth + borderThickness,
    fontSize * 1.4 + borderThickness,
    6
  );

  // Draw text
  context.fillStyle = colorToStyle(textColor);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(message, canvas.width / 2, canvas.height / 2);

  // Render to texture and create a sprite
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture
  });
  const sprite = new THREE.Sprite(spriteMaterial);

  // Size - pixels doesn't make sense in 3D so we consider 1 px -> 0.01 (1 cm)
  const spriteWidth = (textWidth + borderThickness) / 100;
  const spriteHeight = (fontSize * 1.4 + borderThickness) / 100;
  sprite.scale.set(spriteWidth, spriteHeight, 1.0);
  sprite.center.set(spriteCenter.x, spriteCenter.y);
  return sprite;
}

function drawRoundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + w - radius, y);
  context.quadraticCurveTo(x + w, y, x + w, y + radius);
  context.lineTo(x + w, y + h - radius);
  context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  context.lineTo(x + radius, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fill();
  context.stroke();
}
