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

import { TargetNode } from "../Nodes/TargetNode";
import * as THREE from 'three';

export class ThreeTargetNode extends TargetNode
{
  readonly domElement: HTMLElement;
  readonly scene: THREE.Scene;
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() {
    super();
    const scene = new THREE.Scene();
    // TODO move camera out?
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor("#000000");
    // TODO do not refer to window here?
    renderer.setSize(window.innerWidth, window.innerHeight);

    const render = function ()
    {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    };

    render();

    this.domElement = renderer.domElement;
    this.scene = scene;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return ThreeTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeTargetNode.name || super.isA(className); }
}
