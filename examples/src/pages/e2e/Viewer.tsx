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

type TestEnv = {
  camera: THREE.PerspectiveCamera;
  revealManager: reveal.RevealManager<unknown>;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  cameraConfig: SuggestedCameraConfig;
  model: reveal.CadNode;
};

type TestEnvModified = Partial<Omit<TestEnv, 'cameraConfig'> & {
  cameraConfig: Partial<SuggestedCameraConfig>;
  postRender?: () => void
}>;

type Props = {
  modifyTestEnv?: (env: TestEnv) => TestEnvModified | void;
  nodeAppearanceProvider?: reveal.NodeAppearanceProvider;
};

CameraControls.install({ THREE });

export function Viewer(props: Props) {
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
        modelUrl: 'primitives',
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
      let model = await revealManager.addModel(
        'cad',
        modelUrl,
        props.nodeAppearanceProvider || defaultNodeAppearanceProvider
      );
      scene.add(model);

      let renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });
      renderer.setClearColor('#444');
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.localClippingEnabled = true;

      let cameraConfig = model.suggestCameraConfig();
      let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
        75,
        2,
        cameraConfig.near,
        cameraConfig.far
      );

      let testEnv: TestEnvModified = {}

      if (props.modifyTestEnv) {
        let defaultTestEnv: TestEnv = { camera, cameraConfig, model, renderer, revealManager, scene };
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
