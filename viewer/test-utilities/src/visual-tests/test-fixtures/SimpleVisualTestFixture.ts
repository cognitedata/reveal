/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

export abstract class SimpleVisualTestFixture {
  private readonly _perspectiveCamera: THREE.PerspectiveCamera;
  private readonly _scene: THREE.Scene;
  private readonly _renderer: THREE.WebGLRenderer;

  constructor() {
    this._perspectiveCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

    this._scene = new THREE.Scene();

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);
    document.body.style.margin = '0px 0px 0px 0px';
    this._renderer.domElement.style.backgroundColor = '#000000';
  }

  public async run(): Promise<void> {
    (window as any).camera = this._perspectiveCamera;

    await this.setup(this._renderer, this._scene, this._perspectiveCamera);
    this.render();
  }

  abstract setup(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): Promise<void>;

  render(): void {
    this._renderer.render(this._scene, this._perspectiveCamera);
  }
}
