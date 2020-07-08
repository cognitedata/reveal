/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/experimental';
import { CogniteClient } from '@cognite/sdk';
import { getParamsFromURL } from '../utils/example-helpers';
import { RevealOptions } from '@cognite/reveal/public/types';

CameraControls.install({ THREE });

export function GpuSectorCuller() {
  let revealManager: reveal.RevealManager<unknown>;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const client = new CogniteClient({ appId: 'reveal.example.simple' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight
      );
      const coverageUtil = new reveal.internal.GpuOrderSectorsByVisibilityCoverage();
      const sectorCuller = new reveal.internal.ByVisibilityGpuSectorCuller({
        coverageUtil,
        costLimit: 70 * 1024 * 1024,
        logCallback: console.log,
      });
      const revealOptions: RevealOptions = { internal: { sectorCuller } };

      let model: reveal.CadNode;
      if(modelRevision) {
        revealManager = reveal.createCdfRevealManager(client);
        model = await revealManager.addModel('cad', modelRevision, revealOptions);
      } else {
        revealManager = reveal.createLocalRevealManager();
        model = await revealManager.addModel('cad', modelUrl, revealOptions);
      }
      scene.add(model);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const { position, target, near, far } = model.suggestCameraConfig();
      camera.near = near;
      camera.far = far;
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
      const clock = new THREE.Clock();

      // revealManager.renderHints = { showSectorBoundingBoxes: false }; Not yet supported.
      // Debug overlay for "determineSectors"

      const canvas = coverageUtil.createDebugCanvas({
        width: 160,
        height: 100,
      });
      canvas.style.position = 'absolute';
      canvasRef.current!.parentElement!.appendChild(canvas);

      // document.addEventListener('keypress', event => {
      //   if (event.key === 's') {
      //     const suspendLoading = !cadNode.loadingHints.suspendLoading;
      //     console.log(`Suspend loading: ${suspendLoading}`);
      //     cadNode.loadingHints = { ...cadNode.loadingHints, suspendLoading };
      //   } else if (event.key === 'b') {
      //     const showSectorBoundingBoxes = !cadNode.renderHints.showSectorBoundingBoxes;
      //     console.log(`Show sector bounds: ${showSectorBoundingBoxes}`);
      //     cadNode.renderHints = { ...cadNode.renderHints, showSectorBoundingBoxes };
      //   } else if (event.key === 'p') {
      //     const lastWanted = sectorCuller.lastWantedSectors
      //       .filter(x => x.levelOfDetail !== reveal.internal.LevelOfDetail.Discarded)
      //       .sort((l, r) => {
      //         if (l.scene.maxTreeIndex !== r.scene.maxTreeIndex) {
      //           return l.scene.maxTreeIndex - r.scene.maxTreeIndex;
      //         } else if (l.metadata.path !== r.metadata.path) {
      //           return l.metadata.path.localeCompare(r.metadata.path);
      //         } else if (l.priority !== r.priority) {
      //           return l.priority - r.priority;
      //         }
      //         return l.levelOfDetail - r.levelOfDetail;
      //       });

      //     console.log('Last list of wanted sectors:\n', lastWanted);
      //     const paths = lastWanted
      //       .map((x: PrioritizedWantedSector) => `${x.metadata.path} [lod=${x.levelOfDetail}, id=${x.metadata.id}]`)
      //       .sort();
      //     console.log('Paths:', paths);
      //   }
      // });

      revealManager.update(camera);
      const render = async () => {
        const delta = clock.getDelta();
        const controlsNeedUpdate = controls.update(delta);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw) {
          renderer.render(scene, camera);
          revealManager.resetRedraw();
        }

        requestAnimationFrame(render);
      };
      render();

      (window as any).scene = scene;
      (window as any).THREE = THREE;
      (window as any).camera = camera;
      (window as any).controls = controls;
      (window as any).renderer = renderer;
    }

    main();
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
