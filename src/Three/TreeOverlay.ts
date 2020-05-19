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
import { ViewInfo } from '@/Core/Views/ViewInfo';
import { Vector3 } from '@/Core/Geometry/Vector3';

export class TreeOverlay
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private bitmap: CanvasRenderingContext2D | null = null;
  private texture: THREE.Texture | null = null;
  private delta: Vector3 = new Vector3(-1, -1);

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public render(renderer: THREE.WebGLRenderer, viewInfo: ViewInfo, delta: Vector3): void
  {
    if (viewInfo.isEmpty)
      return;

    if (!this.delta.equals(delta))
      this.initialize(delta);

    if (!this.bitmap)
      return;

    if (!this.texture)
      return;

    if (!this.scene)
      return;

    if (!this.camera)
      return;

    const text = viewInfo.text;

    if (text && text.length)
    {
      this.bitmap.font = "Normal 10px Arial";
      this.bitmap.textAlign = 'right';
      this.bitmap.textBaseline = 'bottom';
      this.bitmap.fillStyle = "rgba(255,255,255, 180)";

      this.bitmap.clearRect(0, 0, this.delta.x, this.delta.y);
      this.bitmap.fillText(text, this.delta.x, this.delta.y);
      this.texture.needsUpdate = true;
    }
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
    if (this.bitmap)
      this.bitmap = null;
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
          const geometry = child.geometry;
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
    const canvas = document.createElement('canvas');

    this.delta = delta;

    canvas.width = this.delta.x;
    canvas.height = this.delta.y;

    this.bitmap = canvas.getContext('2d');
    if (!this.bitmap)
      return;

    // Create the camera and set the viewport to match the screen dimensions.
    this.camera = new THREE.OrthographicCamera(-this.delta.x / 2, this.delta.x / 2, this.delta.y / 2, -this.delta.y / 2, 0, 30);

    // Create texture from rendered graphics.
    this.texture = new THREE.Texture(canvas);
    this.texture.needsUpdate = true;
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
}