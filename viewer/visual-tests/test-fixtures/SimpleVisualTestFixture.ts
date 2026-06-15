/*!
 * Copyright 2022 Cognite AS
 */
import type { Box3 } from 'three';
import { Matrix4, PerspectiveCamera, Scene, Sphere, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import type { ModelMetadataProvider, ModelDataProvider, ModelIdentifier } from '../../packages/data-providers';
import { createDataProviders } from './utilities/createDataProviders';
import type { VisualTestFixture } from './VisualTestFixture';

export type SimpleTestFixtureComponents = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  cameraControls: OrbitControls;
  dataProviders: {
    modelMetadataProvider: ModelMetadataProvider;
    modelDataProvider: ModelDataProvider;
    modelIdentifier: ModelIdentifier;
  };
};

export abstract class SimpleVisualTestFixture implements VisualTestFixture {
  public readonly cadFromCdfToThreeMatrix: Matrix4 = new Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

  private readonly _perspectiveCamera: PerspectiveCamera;
  private readonly _scene: Scene;
  private readonly _renderer: WebGLRenderer;
  private readonly _controls: OrbitControls;

  constructor() {
    this._perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

    this._scene = new Scene();

    this._renderer = new WebGLRenderer();

    this._controls = new OrbitControls(this._perspectiveCamera, this._renderer.domElement);

    this._controls.addEventListener('change', () => {
      this.render();
    });
  }

  public async run(): Promise<void> {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);
    document.body.style.margin = '0px 0px 0px 0px';
    this._renderer.domElement.style.backgroundColor = '#000000';

    const components: SimpleTestFixtureComponents = {
      camera: this._perspectiveCamera,
      cameraControls: this._controls,
      renderer: this._renderer,
      scene: this._scene,
      dataProviders: await createDataProviders()
    };

    await this.setup(components);
    this.render();
  }

  public abstract setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void>;

  public render(): void {
    this._renderer.render(this._scene, this._perspectiveCamera);
  }

  public fitCameraToBoundingBox(box: Box3, radiusFactor: number = 2): void {
    const center = new Vector3().lerpVectors(box.min, box.max, 0.5);
    const radius = 0.5 * new Vector3().subVectors(box.max, box.min).length();
    const boundingSphere = new Sphere(center, radius);

    const target = boundingSphere.center;
    const distance = boundingSphere.radius * radiusFactor;
    const direction = new Vector3(0, 0, -1);
    direction.applyQuaternion(this._perspectiveCamera.quaternion);

    const position = new Vector3();
    position.copy(direction).multiplyScalar(-distance).add(target);

    this._perspectiveCamera.position.copy(position);
    this._controls.target.copy(target);
  }

  public dispose(): void {
    this._controls.dispose();
    this._renderer.dispose();
    this._renderer.forceContextLoss();
  }
}
