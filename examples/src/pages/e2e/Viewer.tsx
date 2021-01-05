import React, { useEffect, useRef, useState } from 'react';
import { AnimationLoopHandler } from '../../utils/AnimationLoopHandler';
import { getParamsFromURL } from '../../utils/example-helpers';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { resizeRendererToDisplaySize } from '../../utils/sceneHelpers';
import { CanvasWrapper } from '../../components/styled';
import * as reveal from '@cognite/reveal/experimental';

type Things = {
  camera: THREE.PerspectiveCamera;
  revealManger: reveal.RevealManager<unknown>;
  scene: THREE.Scene;
};

type Props = {
  modifyThings?: (things: {
    camera: THREE.PerspectiveCamera;
    revealManager: reveal.RevealManager<unknown>;
    scene: THREE.Scene;
  }) => Partial<Things> | void;
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
      let model = await revealManager.addModel(
        'cad',
        modelUrl,
        props.nodeAppearanceProvider || defaultNodeAppearanceProvider
      );

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

      scene.add(model);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });
      renderer.setClearColor('#444');
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.localClippingEnabled = true;

      let { position, target, near, far } = model.suggestCameraConfig();
      let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
        75,
        2,
        near,
        far
      );

      if (props.modifyThings) {
        const things =
          props.modifyThings({ camera, revealManager, scene }) || {};
        camera = things.camera || camera;
        revealManager = things.revealManger || revealManager;
        scene = things.scene || scene;
      }

      const controls = new CameraControls(camera, renderer.domElement);
      controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z
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

          // onRendered.forEach((element) => {
          //   element();
          // });

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
