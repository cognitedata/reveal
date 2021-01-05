import React, { useEffect, useRef, useState } from 'react';
import { AnimationLoopHandler } from '../../utils/AnimationLoopHandler';
import { getParamsFromURL } from '../../utils/example-helpers';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { resizeRendererToDisplaySize } from '../../utils/sceneHelpers';
import { CanvasWrapper } from '../../components/styled';
import * as reveal from '@cognite/reveal/experimental';

type Props = {
  nodeAppearanceProvider?: reveal.NodeAppearanceProvider;
  modifyCamera?: (
    defaultCamera: THREE.PerspectiveCamera
  ) => THREE.PerspectiveCamera;
};

CameraControls.install({ THREE });

// export function Viewer({ modifyCamera, nodeAppearanceProvider }: Props) {
//   const canvas = useRef<HTMLCanvasElement>(null);
//   const [loadingState, setLoadingState] = useState<
//     reveal.utilities.LoadingState
//     >({
//     isLoading: true,
//     itemsLoaded: 0,
//     itemsRequested: 0,
//   });
//   const [revealManager, setRevealManager] = useState<
//     reveal.RevealManager<unknown>
//     >();
//   const [model, setModel] = useState<reveal.CadNode>();
//   // when revealManager is used like that HMR works weird
//   // camera position changes and controls don't work - no idea why ;(
//   useEffect(() => {
//     const revealManager = reveal.createLocalRevealManager({
//       logMetrics: false,
//     });
//
//     let skipFirstLoadingState = true;
//     revealManager.on('loadingStateChanged', (loadingState) => {
//       if (skipFirstLoadingState) {
//         skipFirstLoadingState = false;
//         if (loadingState.isLoading) {
//           setLoadingState(loadingState);
//         }
//       } else {
//         setLoadingState(loadingState);
//       }
//     });
//     setRevealManager(revealManager);
//   }, []);
//
//   useEffect(() => {
//     if (!model || !canvas.current || !revealManager) {
//       return;
//     }
//     const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
//     const scene = new THREE.Scene();
//     scene.add(model);
//
//     const renderer = new THREE.WebGLRenderer({
//       canvas: canvas.current,
//     });
//     renderer.setClearColor('#444');
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.localClippingEnabled = true;
//
//     let { position, target, near, far } = model.suggestCameraConfig();
//     let camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
//       75,
//       2,
//       near,
//       far
//     );
//
//     if (modifyCamera) {
//       camera = modifyCamera(camera);
//     }
//     const controls = new CameraControls(camera, renderer.domElement);
//     controls.setLookAt(
//       position.x,
//       position.y,
//       position.z,
//       target.x,
//       target.y,
//       target.z
//     );
//     controls.update(0.0);
//     camera.near = near;
//     camera.far = far;
//     camera.updateProjectionMatrix();
//
//     camera.updateMatrixWorld();
//     revealManager.update(camera);
//
//     animationLoopHandler.setOnAnimationFrameListener(async (deltaTime) => {
//       let needsResize = resizeRendererToDisplaySize(renderer, camera);
//
//       const controlsNeedUpdate = controls.update(deltaTime);
//       if (controlsNeedUpdate) {
//         revealManager.update(camera);
//       }
//
//       if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
//         revealManager.render(renderer, camera, scene);
//
//         // onRendered.forEach((element) => {
//         //   element();
//         // });
//
//         revealManager.resetRedraw();
//       }
//     });
//     animationLoopHandler.start();
//
//     const w = window as any;
//     w.scene = scene;
//     w.THREE = THREE;
//     w.camera = camera;
//     w.controls = controls;
//     w.renderer = renderer;
//     w.revealManager = revealManager;
//
//     return () => {
//       animationLoopHandler.dispose();
//       revealManager.dispose();
//     };
//   }, [revealManager, model, modifyCamera]);
//
//   useEffect(() => {
//     (async function () {
//       if (!revealManager) {
//         return;
//       }
//       const { modelUrl } = getParamsFromURL({
//         project: 'test',
//         modelUrl: 'primitives',
//       });
//       const defaultNodeAppearanceProvider = {
//         styleNode() {
//           return reveal.DefaultNodeAppearance.NoOverrides;
//         },
//       };
//
//       let model = await revealManager.addModel(
//         'cad',
//         modelUrl,
//         nodeAppearanceProvider || defaultNodeAppearanceProvider
//       );
//       setModel(model);
//     })();
//   }, [revealManager, nodeAppearanceProvider]);
//
//   const readyForScreenshot = !loadingState.isLoading;
//
//   return (
//     <>
//       <CanvasWrapper>
//         <canvas ref={canvas} />
//       </CanvasWrapper>
//       {readyForScreenshot && <div id="ready">Ready</div>}
//     </>
//   );
// }

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

      const scene = new THREE.Scene();

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

      if (props.modifyCamera) {
        camera = props.modifyCamera(camera);
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
      camera.near = near;
      camera.far = far;
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

      (window as any).scene = scene;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
      (window as any).renderer = renderer;
    }

    main();

    return () => {
      revealManager?.dispose();
      animationLoopHandler.dispose();
      revealManager?.dispose();
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
