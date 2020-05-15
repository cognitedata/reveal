/*!
 * Copyright 2020 Cognite AS
 */

import { HtmlOverlayHelper } from '@/utilities/HtmlOverlayHelper';
import * as THREE from 'three';

describe('HtmlOverlayHelper', () => {
  const renderer: THREE.Renderer = {
    domElement: document.createElement('canvas')
  } as any;
  const camera = new THREE.PerspectiveCamera();

  test('addOverlayElement() only accepts absolute position', () => {
    // Arrange
    const helper = new HtmlOverlayHelper();
    const htmlElement = document.createElement('div');
    htmlElement.className = 'overlay';
    htmlElement.style.position = 'relative';
    const position = new THREE.Vector3();

    // Act & Assert
    expect(() => helper.addOverlayElement(htmlElement, position)).toThrowError();
  });

  test('updatePositions() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayHelper();
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toBeEmpty();
    expect(htmlElement.style.left).toBeEmpty();
    const position = new THREE.Vector3(1, 1, 1);
    helper.addOverlayElement(htmlElement, position);

    // Act
    helper.updatePositions(renderer, camera);

    // Assert
    expect(htmlElement.style.top).not.toBeEmpty();
    expect(htmlElement.style.left).not.toBeEmpty();
  });
});
