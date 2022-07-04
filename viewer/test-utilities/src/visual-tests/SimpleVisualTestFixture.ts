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

    const grid = new THREE.GridHelper(30, 40);
    grid.position.set(14, -1, -14);
    this._scene.add(grid);
  }

  public async run(): Promise<void> {
    await this.setup();
    this.render();
  }

  abstract setup(): Promise<void>;

  render(): void {
    requestAnimationFrame(() => {
      this._renderer.render(this._scene, this._perspectiveCamera);
    });
  }
}
