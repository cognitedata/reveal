/*!
 * Copyright 2021 Cognite AS
 */

import { HtmlOverlayHelper } from './HtmlOverlayHelper';
import * as THREE from 'three';

describe('HtmlOverlayHelper', () => {
  const canvasContainer = document.createElement('div');
  const renderer: THREE.Renderer = {
    domElement: document.createElement('canvas')
  } as any;
  const camera = new THREE.PerspectiveCamera();

  test('addOverlayElement() only accepts absolute position', () => {
    // Arrange
    const helper = new HtmlOverlayHelper(canvasContainer);
    const htmlElement = document.createElement('div');
    htmlElement.className = 'overlay';
    htmlElement.style.position = 'relative';
    const position = new THREE.Vector3();

    // Act & Assert
    expect(() => helper.addOverlayElement(htmlElement, position)).toThrowError();
  });

  test('updatePositions() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayHelper(canvasContainer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toBeEmpty();
    expect(htmlElement.style.left).toBeEmpty();
    const position = new THREE.Vector3(0.5, 0.5, 0.5);
    helper.addOverlayElement(htmlElement, position);

    // Act
    helper.updatePositions(renderer, camera);

    // Assert
    expect(htmlElement.style.top).not.toBeEmpty();
    expect(htmlElement.style.left).not.toBeEmpty();
  });
});
