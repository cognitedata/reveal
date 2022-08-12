/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
  ModelMetadataProvider,
  ModelDataProvider,
  ModelIdentifier,
  LocalModelMetadataProvider,
  LocalModelDataProvider,
  CdfModelMetadataProvider,
  CdfModelDataProvider,
  LocalModelIdentifier,
  CdfModelIdentifier
} from '../../packages/modeldata-api';
import { createApplicationSDK } from '../../test-utilities/src/appUtils';

export type SimpleTestFixtureComponents = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraControls: OrbitControls;
  dataProviders: {
    modelMetadataProvider: ModelMetadataProvider;
    modelDataProvider: ModelDataProvider;
    modelIdentifier: ModelIdentifier;
  };
};

export abstract class SimpleVisualTestFixture {
  public readonly cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

  private readonly _perspectiveCamera: THREE.PerspectiveCamera;
  private readonly _scene: THREE.Scene;
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _controls: OrbitControls;

  constructor() {
    this._perspectiveCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);

    this._scene = new THREE.Scene();

    this._renderer = new THREE.WebGLRenderer();

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
      dataProviders: await this.createDataProviders()
    };

    await this.setup(components);
    this.render();
  }

  public abstract setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void>;

  public render(): void {
    this._renderer.render(this._scene, this._perspectiveCamera);
  }

  public fitCameraToBoundingBox(box: THREE.Box3, radiusFactor: number = 2): void {
    const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
    const radius = 0.5 * new THREE.Vector3().subVectors(box.max, box.min).length();
    const boundingSphere = new THREE.Sphere(center, radius);

    const target = boundingSphere.center;
    const distance = boundingSphere.radius * radiusFactor;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this._perspectiveCamera.quaternion);

    const position = new THREE.Vector3();
    position.copy(direction).multiplyScalar(-distance).add(target);

    this._perspectiveCamera.position.copy(position);
    this._controls.target.copy(target);
  }

  private async createDataProviders(): Promise<{
    modelMetadataProvider: ModelMetadataProvider;
    modelDataProvider: ModelDataProvider;
    modelIdentifier: ModelIdentifier;
  }> {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('modelId') && urlParams.has('revisionId')) {
      return this.createCdfDataProviders(urlParams);
    }

    return this.createLocalDataProviders(urlParams);
  }

  private createLocalDataProviders(urlParams: URLSearchParams) {
    const modelUrl = urlParams.get('modelUrl') ?? 'primitives';
    const modelIdentifier = new LocalModelIdentifier(modelUrl);
    const modelMetadataProvider = new LocalModelMetadataProvider();
    const modelDataProvider = new LocalModelDataProvider();
    return { modelMetadataProvider, modelDataProvider, modelIdentifier };
  }

  private async createCdfDataProviders(urlParams: URLSearchParams) {
    const client = await createApplicationSDK('reveal.example.simple', {
      project: '3d-test',
      cluster: 'greenfield',
      clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
      tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
    });

    const modelId = parseInt(urlParams.get('modelId')!);
    const revisionId = parseInt(urlParams.get('revisionId')!);

    const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
    const modelMetadataProvider = new CdfModelMetadataProvider(client);
    const modelDataProvider = new CdfModelDataProvider(client);
    return { modelMetadataProvider, modelDataProvider, modelIdentifier };
  }
}
