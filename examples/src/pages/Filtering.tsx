/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/experimental';
import dat from 'dat.gui';
import { getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { RevealOptions } from '@cognite/reveal/public/types';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';

CameraControls.install({ THREE });

export function Filtering() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const gui = new dat.GUI();
    let revealManager: reveal.RevealManager<unknown>;
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();

    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const client = new CogniteClient({ appId: 'reveal.example.filtering' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();
      let shadingNeedsUpdate = false;
      let visibleIndices = new Set([1, 2, 8, 12]);
      const settings = {
        treeIndices: '1, 2, 8, 12',
      };

      const nodeAppearanceProvider: reveal.NodeAppearanceProvider = {
        styleNode(treeIndex: number) {
          if (visibleIndices.has(treeIndex)) {
            return reveal.DefaultNodeAppearance.Hidden;
          }
          return reveal.DefaultNodeAppearance.NoOverrides;
        }
      };
      const revealOptions: RevealOptions = {
        nodeAppearanceProvider
      }

      let model: reveal.CadNode;
      if(modelRevision) {
        revealManager = reveal.createCdfRevealManager(client);
        model = await revealManager.addModel('cad', modelRevision);
      } else if(modelUrl) {
        revealManager = reveal.createLocalRevealManager();
        model = await revealManager.addModel('cad', modelUrl);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      scene.add(model);

      gui.add(settings, 'treeIndices').onChange(() => {
        const indices = settings.treeIndices
          .split(',')
          .map((s) => s.trim())
          .map((i) => parseInt(i, 10))
          .filter((x) => !isNaN(x));

        const oldIndices = visibleIndices;
        visibleIndices = new Set(indices);
        model.requestNodeUpdate([...oldIndices]);
        model.requestNodeUpdate([...visibleIndices]);
        shadingNeedsUpdate = true;
      });

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const { position, target, near, far } = model.suggestCameraConfig();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        near,
        far
      );
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
      animationLoopHandler.setOnAnimationFrameListener((deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (
          controlsNeedUpdate ||
          revealManager.needsRedraw ||
          shadingNeedsUpdate
        ) {
          renderer.render(scene, camera);
          shadingNeedsUpdate = false;
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
      gui.destroy();
      revealManager.dispose();
      animationLoopHandler.dispose();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
