import React, { useEffect, useRef, useState } from 'react';
import { AnimationLoopHandler } from '../../utils/AnimationLoopHandler';
import { getParamsFromURL } from '../../utils/example-helpers';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { resizeRendererToDisplaySize } from '../../utils/sceneHelpers';
import { CanvasWrapper } from '../../components/styled';
import * as reveal from '@cognite/reveal/experimental';

// fixme: export type from reveal
interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

type CadModelEnv = {
  modelType: 'cad';
  model: reveal.CadNode;
};
type PointCloudModelEnv = {
  modelType: 'pointcloud';
  model: reveal.internal.PointCloudNode;
};

export type TestEnv = {
  camera: THREE.PerspectiveCamera;
  revealManager: reveal.RevealManager<unknown>;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
};

export type TestEnvCad = TestEnv & CadModelEnv;

export type TestEnvPointCloud = TestEnv & PointCloudModelEnv;

type TestEnvModified<T> = Partial<Omit<T, 'cameraConfig'>> & {
  cameraConfig?: Partial<SuggestedCameraConfig>;
  postRender?: () => void;
};

type PropsCad<T = TestEnvCad> = {
  // when `?` is used ts forces to mark env arg explicitly in tsx components (see e.g. Clipping).
  // Otherwise it complains that arg is any (unless you pass modelType='cad').
  // TS doesn't infer correct type when prop is undefined here :(
  modelType?: 'cad';
  nodeAppearanceProvider?: reveal.NodeAppearanceProvider;
  modifyTestEnv?: (env: T) => TestEnvModified<T> | void;
};
type PropsPointCloud<T = TestEnvPointCloud> = {
  modelType: 'pointcloud';
  nodeAppearanceProvider?: never;
  modifyTestEnv?: (env: T) => TestEnvModified<T> | void;
};

type Props = {
  modelName?: string;
} & (PropsCad | PropsPointCloud);

CameraControls.install({ THREE });

export function TestViewer(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<
    reveal.utilities.LoadingState
  >({
    isLoading: true,
    itemsLoaded: 0,
    itemsRequested: 0,
  });

  useEffect(() => {
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager: reveal.RevealManager<unknown>;

    async function main() {
      if (!canvas.current) {
        return;
      }
      const { modelUrl } = getParamsFromURL({
        project: 'test',
        modelUrl: props.modelName || 'primitives',
      });

      let scene = new THREE.Scene();

      const defaultNodeAppearanceProvider: reveal.NodeAppearanceProvider = {
        styleNode() {
          return reveal.DefaultNodeAppearance.NoOverrides;
        },
      };

      revealManager = reveal.createLocalRevealManager({ logMetrics: false });

      let skipFirstLoadingState = true;
      revealManager.on('loadingStateChanged', (loadingState) => {
        if (skipFirstLoadingState) {
          skipFirstLoadingState = false;
          if (loadingState.isLoading) {
            setLoadingState(loadingState);
          }
        } else {
          setLoadingState(loadingState);
        }
      });

      let model: reveal.internal.PointCloudNode | reveal.CadNode;

      if (props.modelType === 'pointcloud') {
        model = await revealManager.addModel('pointcloud', modelUrl);
      } else {
        model = await revealManager.addModel(
          'cad',
          modelUrl,
          props.nodeAppearanceProvider || defaultNodeAppearanceProvider
        );
      }

      scene.add(model);

      let renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });
      renderer.setClearColor('#444');
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.localClippingEnabled = true;

      let cameraConfig: SuggestedCameraConfig;
      if (model instanceof reveal.CadNode) {
        cameraConfig = model.suggestCameraConfig();
      } else {
        const near = 0.1;
        const far = 10000;
        const bbox: THREE.Box3 = model.getBoundingBox();
        const target = bbox.getCenter(new THREE.Vector3());
        const minToCenter = new THREE.Vector3().subVectors(target, bbox.min);
        const position = target.clone().addScaledVector(minToCenter, -1.5);

        cameraConfig = {
          near,
          far,
          position,
          target,
        };
      }
      let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
        75,
        2,
        cameraConfig.near,
        cameraConfig.far
      );

      let testEnv: TestEnvModified<TestEnvCad | TestEnvPointCloud> = {};

      if (props.modifyTestEnv) {
        let defaultTestEnv: any = {
          camera,
          model,
          renderer,
          revealManager,
          scene,
        };
        testEnv = props.modifyTestEnv(defaultTestEnv) || testEnv;

        camera = testEnv.camera || camera;
        cameraConfig = {
          ...cameraConfig,
          ...testEnv.cameraConfig,
        };
        renderer = testEnv.renderer || renderer;
        revealManager = testEnv.revealManager || revealManager;
        scene = testEnv.scene || scene;
      }

      const controls = new CameraControls(camera, renderer.domElement);
      controls.setLookAt(
        cameraConfig.position.x,
        cameraConfig.position.y,
        cameraConfig.position.z,
        cameraConfig.target.x,
        cameraConfig.target.y,
        cameraConfig.target.z
      );
      controls.update(0.0);

      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      revealManager.update(camera);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime) => {
        let needsResize = resizeRendererToDisplaySize(renderer, camera);

        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
          revealManager.render(renderer, camera, scene);

          if (testEnv.postRender) {
            testEnv.postRender();
          }

          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();

      const w = window as any;
      w.scene = scene;
      w.THREE = THREE;
      w.camera = camera;
      w.controls = controls;
      w.renderer = renderer;
      w.revealManager = revealManager;
    }

    main();

    return () => {
      revealManager?.dispose();
      animationLoopHandler.dispose();
    };
  }, [props]);

  const readyForScreenshot = !loadingState.isLoading;

  return (
    <>
      <CanvasWrapper>
        <canvas ref={canvas} />
      </CanvasWrapper>
      {readyForScreenshot && <div id="ready">Ready</div>}
    </>
  );
}
