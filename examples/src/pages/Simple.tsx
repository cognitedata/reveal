/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import * as reveal from '@cognite/reveal/experimental';
import React, { useEffect, useRef, useState } from 'react';
import { CanvasWrapper, Loader } from '../components/styled';
import { resizeRendererToDisplaySize } from '../utils/sceneHelpers';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';

CameraControls.install({ THREE });

function packFloat(f: number) {
  const F = Math.abs(f);
  if (F === 0.0) {
    return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
  }
  const Sign = -f < 0.0 ? 0.0 : 1.0;

  let Exponent = Math.floor(Math.log2(F));

  const Mantissa = F / Math.pow(2, Exponent);
  //denormalized values if all exponent bits are zero
  if (Mantissa < 1.0) Exponent -= 1.0;

  Exponent += 127.0;

  const output = new THREE.Vector4(0.0, 0.0, 0.0, 0.0);

  output.x = Exponent;
  output.y = 128.0 * Sign + (Math.floor(Mantissa * 128.0) % 128.0);
  output.z = Math.floor(Math.floor(Mantissa * Math.pow(2.0, 23.0 - 8.0)) % Math.pow(2.0, 8.0));
  output.w = Math.floor(Math.pow(2.0, 23.0) * (Mantissa % Math.pow(2.0, -15.0)));
  return output;//.multiplyScalar(1.0 / 255.0);
}

function unpackFloat4(_packed: THREE.Vector4) {
  const rgba = _packed;//.multiplyScalar(255.0);
  const sign = (-rgba.y < -128.0 ? 0.0 : 1.0) * 2.0 - 1.0;
  const exponent = rgba.x - 127.0;
  if (Math.abs(exponent + 127.0) < 0.001) {
    return 0.0;
  }

  const mantissa = (rgba.y % 128.0) * 65536.0 + rgba.z * 256.0 + rgba.w + 8388608.0; //8388608.0 == 0x800000
  return sign * Math.pow(2.0, exponent - 23.0) * mantissa;
}

export function Simple() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let revealManager: reveal.RevealManager<unknown>;
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    async function main() {
      if (!canvas.current) {
        return;
      }
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const client = new CogniteClient({ appId: 'reveal.example.simple' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();
      let model: reveal.CadNode;
      if (modelRevision) {
        revealManager = reveal.createCdfRevealManager(client);
        model = await revealManager.addModel('cad', modelRevision);
      } else if (modelUrl) {
        revealManager = reveal.createLocalRevealManager();
        model = await revealManager.addModel('cad', modelUrl);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      revealManager.on('loadingStateChanged', setIsLoading);

      // const test = packFloat(2.5);
      // console.log(test);

      // const testUnpack = unpackFloat4(test);
      // console.log(testUnpack);

      scene.add(model);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });
      renderer.setClearColor('#444');
      renderer.setPixelRatio(window.devicePixelRatio);

      const { position, target, near, far } = model.suggestCameraConfig();
      const camera = new THREE.PerspectiveCamera(75, 2, near, far);
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
      camera.updateMatrixWorld();
      revealManager.update(camera);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime: number) => {
        let needsResize = resizeRendererToDisplaySize(renderer, camera);
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
          renderer.render(scene, camera);
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
    };
  }, []);
  return (
    <CanvasWrapper>
      <Loader isLoading={isLoading} style={{ position: 'absolute' }}>
        Loading...
      </Loader>
      <canvas ref={canvas} />
    </CanvasWrapper>
  );
}
