import React, { useEffect, useRef, useState } from 'react';
import { AnimationLoopHandler } from '../../utils/AnimationLoopHandler';
import { getParamsFromURL } from '../../utils/example-helpers';
import { THREE } from '@cognite/reveal';
import CameraControls from 'camera-controls';
import { resizeRendererToDisplaySize } from '../../utils/sceneHelpers';
import { CanvasWrapper } from '../../components/styled';
import * as reveal from '@cognite/reveal/internals';
import { SuggestedCameraConfig, suggestCameraConfig } from '../../utils/cameraConfig';

import { defaultRenderOptions, RenderOptions, SceneHandler } from '@cognite/reveal/internals';

type CadModelEnv = {
  modelType: 'cad';
  model: reveal.CadNode;
};
type PointCloudModelEnv = {
  modelType: 'pointcloud';
  model: reveal.PointCloudNode;
};

export type TestEnv = {
  camera: THREE.PerspectiveCamera;
  revealManager: reveal.RevealManager;
  sceneHandler: SceneHandler;
  renderer: THREE.WebGLRenderer;
};

export type TestEnvCad = TestEnv & CadModelEnv;

export type TestEnvPointCloud = TestEnv & PointCloudModelEnv;

type TestEnvModified<T> = Partial<Omit<T, 'cameraConfig'>> & {
  cameraConfig?: Partial<SuggestedCameraConfig>;
  postRender?: () => void;
};

type PropsCad<T = TestEnvCad> = {
  // when `?` is used TS forces to mark env arg explicitly in tsx components (see e.g. Clipping).
  // Otherwise it complains that arg is any (unless you pass modelType='cad').
  // TS doesn't infer correct type when prop is undefined here :(
  modelType?: 'cad';
  modifyTestEnv?: (env: T) => TestEnvModified<T> | void;
};
type PropsPointCloud<T = TestEnvPointCloud> = {
  modelType: 'pointcloud';
  pointColorType?: reveal.PotreePointColorType;
  nodeAppearanceProvider?: never;
  modifyTestEnv?: (env: T) => TestEnvModified<T> | void;
};

type Props = {
  modelName?: string;
  backgroundColor?: string;
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
    itemsCulled: 0
  });

  const setupLoadingStateHandler = (
    revealManager: reveal.RevealManager
  ) => {
    let skipFirstLoadingState = true;
    revealManager.on('loadingStateChanged', (loadingState) => {
      // Ignore isLoading updates untill we see that we are starting to download data
      if (skipFirstLoadingState) {
        if (loadingState.isLoading) {
          skipFirstLoadingState = false;
          setLoadingState(loadingState);
        }
      } else {
        setLoadingState(loadingState);
      }
    });
  };

  const getCameraConfig = (
    model: reveal.CadNode | reveal.PointCloudNode
  ): SuggestedCameraConfig => {

    if ( model instanceof reveal.CadNode) {
      return suggestCameraConfig(model.cadModelMetadata.scene.root,
                                 model.getModelTransformation());
    }

    const near = 0.1;
    const far = 10000;
    const bbox: THREE.Box3 = model.getBoundingBox();
    const target = bbox.getCenter(new THREE.Vector3());
    const minToCenter = new THREE.Vector3().subVectors(target, bbox.min);
    const position = target.clone().addScaledVector(minToCenter, -1.5);

    return {
      near,
      far,
      position,
      target,
    };
  };

  useEffect(() => {
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager: reveal.RevealManager;

    async function main() {
      if (!canvas.current) {
        return;
      }
      const { modelUrl } = getParamsFromURL({
        project: 'test',
        modelUrl: props.modelName || 'primitives',
      });

      let sceneHandler = new SceneHandler();

      const renderOptions: RenderOptions = {
        ...defaultRenderOptions,
        ssaoRenderParameters: {
          depthCheckBias: 0.0,
          sampleRadius: 0.0,
          sampleSize: 0
        }
      };

      let renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });
      renderer.setClearColor(props.backgroundColor ? props.backgroundColor : '#444');
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.localClippingEnabled = true;

      revealManager = reveal.createLocalRevealManager(renderer, sceneHandler, { logMetrics: false, renderOptions: renderOptions });
      setupLoadingStateHandler(revealManager);

      let model: reveal.PointCloudNode | reveal.CadNode;

      if (props.modelType === 'pointcloud') {
        const modelIdentifier = new reveal.LocalModelIdentifier(modelUrl.fileName!);
        model = await revealManager.addModel('pointcloud', modelIdentifier);
        model.pointColorType = props.pointColorType ? props.pointColorType : reveal.PotreePointColorType.Rgb;
        sceneHandler.addCustomObject(model);
      } else {
        const modelIdentifier = new reveal.LocalModelIdentifier(modelUrl.fileName!);
        model = await revealManager.addModel(
          'cad',
          modelIdentifier
        );
        
        sceneHandler.addCadModel(model, model.cadModelIdentifier);
      }
      
      let cameraConfig = getCameraConfig(model);

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
          sceneHandler
        };
        testEnv = props.modifyTestEnv(defaultTestEnv) || testEnv;

        camera = testEnv.camera || camera;
        cameraConfig = {
          ...cameraConfig,
          ...testEnv.cameraConfig,
        };
        renderer = testEnv.renderer || renderer;
        revealManager = testEnv.revealManager || revealManager;
        sceneHandler = testEnv.sceneHandler || sceneHandler;
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

      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        let needsResize = resizeRendererToDisplaySize(renderer, camera);

        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
          revealManager.render(camera);

          if (testEnv.postRender) {
            testEnv.postRender();
          }

          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();

      const w = window as any;
      w.sceneHandler = sceneHandler;
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
