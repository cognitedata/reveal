import * as THREE from 'three';
import dat from 'dat.gui';
import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class LoadGltfUi {
  private readonly _gizmos: TransformControls[] = [];
  private readonly _objects: THREE.Object3D[] = [];
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _params = {
    url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
    transformGizmosVisible: true,
    scale: 1.0,
    scaleStr: '1.0'
  };

  constructor(uiFolder: dat.GUI, viewer: Cognite3DViewer<DataSourceType>) {
    this._viewer = viewer;
    this.createGui(uiFolder);
  }

  private createGui(ui: dat.GUI): void {
    const actions = {
      loadGltf: () => this.loadGltf(this._params.url),
      addHeadlight: () => this.addHeadlight()
    };
    ui.add(this._params, 'transformGizmosVisible', true)
      .name('Show gizmos?')
      .onChange(value => {
        this._gizmos.forEach(gizmo => {
          gizmo.visible = value;
        });
        this._viewer.requestRedraw();
      });
    ui.add(this._params, 'scaleStr')
      .name('Scale models')
      .onChange(scaleStr => {
        try {
          const scale = Number.parseFloat(scaleStr);
          console.log(scale);
          this._objects.forEach(object => object.scale.set(scale, scale, scale));
          this._viewer.requestRedraw();
          this._params.scale = scale;
        } catch {}
      });

    ui.add(this._params, 'url').name('URL');
    ui.add(actions, 'loadGltf').name('Load GLTF');
    ui.add(actions, 'addHeadlight').name('Add headlight');
  }

  private loadGltf(url: string): void {
    const loader = new GLTFLoader();
    loader.load(
      url,
      gltf => this.addGltfToViewer(gltf),
      event => console.log(`Loading GLTF: ${event.loaded}/${event.total}`)
    );
  }

  private addGltfToViewer(gltf: GLTF): void {
    console.log('Loaded GLTF', gltf);
    const { scale } = this._params;
    gltf.scene.scale.set(scale, scale, scale);
    this._viewer.addObject3D(gltf.scene);
    this._objects.push(gltf.scene);

    if (gltf.cameras.length > 0) {
      const camera = gltf.cameras[0];
      this._viewer.cameraManager.setCameraState({
        position: camera.getWorldPosition(new THREE.Vector3()),
        rotation: camera.getWorldQuaternion(new THREE.Quaternion())
      });
    }
    if (gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(animation => {
        mixer.clipAction(animation).play();
      });
      const clock = new THREE.Clock();
      this._viewer.on('beforeSceneRendered', () => {
        mixer.update(clock.getDelta());
      });
      this._viewer.on('sceneRendered', () => {
        this._viewer.requestRedraw(); // Render continuously
      });
      this._viewer.requestRedraw();
    }
    this.attachTransformControls(gltf.scene);
  }

  private attachTransformControls(object: THREE.Object3D): void {
    const gizmo = new TransformControls(this._viewer.cameraManager.getCamera(), this._viewer.canvas);
    gizmo.visible = this._params.transformGizmosVisible;
    gizmo.attach(object);
    this._viewer.addObject3D(gizmo);
    this._gizmos.push(gizmo);

    gizmo.addEventListener('change', () => {
      this._viewer.requestRedraw();
    });
    gizmo.addEventListener('dragging-changed', (event: any) => {
      const dragging: boolean = event.value;

      //Disable active camera controls when drag is detected on gizmo
      const cameraManager = this._viewer.cameraManager;
      if (dragging) {
        cameraManager.deactivate();
      } else {
        cameraManager.activate();
      }
    });
  }

  private addHeadlight(): void {
    const pointlight = new THREE.PointLight();
    pointlight.power *= 2.0;
    const updatePose = () => {
      const { position, rotation } = this._viewer.cameraManager.getCameraState();
      pointlight.position.copy(position);
      pointlight.setRotationFromQuaternion(rotation);
    };
    this._viewer.on('cameraChange', updatePose);

    this._viewer.addObject3D(pointlight);
  }
}
