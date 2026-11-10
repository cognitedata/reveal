/*!
 * Copyright 2026 Cognite AS
 */

import { Texture } from 'three';
import type { Image360Face, Image360Texture } from '../../packages/data-providers';

const faceNames: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];

export function createImage360StreamingFace(face: Image360Face['face'] = 'front'): Image360Face {
  return { face, mimeType: 'image/jpeg', data: new ArrayBuffer(0), downloadUrl: `https://example.com/${face}.jpg` };
}

export function createImage360BufferFace(face: Image360Face['face'] = 'front'): Image360Face {
  return { face, mimeType: 'image/jpeg', data: new ArrayBuffer(100) };
}

export function createImage360StreamingFaces(count = 6): Image360Face[] {
  return faceNames.slice(0, count).map(createImage360StreamingFace);
}

export function createImage360Textures(count = 6): Image360Texture[] {
  return faceNames.slice(0, count).map(face => ({ face, texture: new Texture() }));
}
