/*!
 * Copyright 2020 Cognite AS
 */

// TODO: j-bjorne 28-04-2020: Investigate why show bounding boxes doesn't work.

import React, { useEffect } from 'react';
import { Container } from '../components/styled';
import * as THREE from 'three';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import {
  createRendererDebugWidget,
  applyRenderingFilters,
  RenderMode,
  RenderOptions,
  applySectorOverride,
} from '../utils/renderer-debug-widget';
import { CogniteClient } from '@cognite/sdk';
import {
  CadNode,
  RevealManager,
  createCdfRevealManager,
  createLocalRevealManager,
} from '@cognite/reveal/experimental';
import { getParamsFromURL } from '../utils/example-helpers';
import { OverrideSectorCuller } from '../utils/OverrideSectorCuller';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { RevealOptions } from '@cognite/reveal/public/types';

CameraControls.install({ THREE });

function getModel2Params() {
  return getParamsFromURL({
    project: 'publicdata',
    modelUrl: 'primitives'
  }, {
    modelId: 'modelId2',
    revisionId: 'revisionId2',
    modelUrl: 'modelUrl2'
  });
}

function initializeModel(
  cadNode: CadNode,
  canvas: HTMLCanvasElement,
  gui: dat.GUI
): [THREE.WebGLRenderer, THREE.Scene, CadNode, RenderOptions] {
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor('#444');
  renderer.setSize(canvas.width, canvas.height);

  const sectorScene = cadNode.cadModelMetadata.scene;
  const scene = new THREE.Scene();
  scene.add(cadNode);
  const options = createRendererDebugWidget(
    sectorScene.root,
    renderer,
    cadNode,
    gui
  );
  return [renderer, scene, cadNode, options];
}

export function SideBySide() {
  useEffect(() => {
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager1: RevealManager<unknown>;
    let revealManager2: RevealManager<unknown>;
    async function main() {
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });
      const { modelUrl: modelUrl2, modelRevision: modelRevision2 } = getModel2Params();
      const client = new CogniteClient({
        appId: 'reveal.example.side-by-side',
      });
      client.loginWithOAuth({ project });

      const sectorCuller1 = new OverrideSectorCuller();
      const revealOptions1: RevealOptions = {
        internal: { sectorCuller: sectorCuller1 }
      }
      let model1: CadNode;
      if(modelRevision) {
        revealManager1 = createCdfRevealManager(client, revealOptions1);
        model1 = await revealManager1.addModel('cad', modelRevision);
      } else if(modelUrl) {
        revealManager1 = createLocalRevealManager(revealOptions1);
        model1 = await revealManager1.addModel('cad', modelUrl);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      const sectorCuller2 = new OverrideSectorCuller();
      const revealOptions2: RevealOptions = {
        internal: { sectorCuller: sectorCuller2 }
      };
      let model2: CadNode;
      if(modelRevision2) {
        revealManager2 = createCdfRevealManager(client, revealOptions2);
        model2 = await revealManager2.addModel('cad', modelRevision2);
      } else if(modelUrl2) {
        revealManager2 = createLocalRevealManager(revealOptions2);
        model2 = await revealManager2.addModel('cad', modelUrl2);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      const params = new URL(window.location.href).searchParams;
      const modelHeader1 =
        params.get('modelUrl') ||
        `${params.get('model')}@${params.get('project')}`;
      const modelHeader2 =
        params.get('modelUrl2') ||
        `${params.get('model2')}@${params.get('project')}`;

      // Page layout
      const gui1 = new dat.GUI({ autoPlace: false, width: 300 });
      const gui2 = new dat.GUI({ autoPlace: false, width: 300 });
      document.getElementById('gui1')!.appendChild(gui1.domElement);
      document.getElementById('gui2')!.appendChild(gui2.domElement);
      document
        .getElementById('header1')!
        .appendChild(document.createTextNode(modelHeader1));
      document
        .getElementById('header2')!
        .appendChild(document.createTextNode(modelHeader2));
      const leftCanvas = document.getElementById(
        'leftCanvas'
      )! as HTMLCanvasElement;
      const rightCanvas = document.getElementById(
        'rightCanvas'
      )! as HTMLCanvasElement;

      // Initialize models
      const [renderer1, scene1, modelNode1, options1] = initializeModel(
        model1,
        leftCanvas,
        gui1
      );
      const [renderer2, scene2, , options2] = initializeModel(
        model2,
        rightCanvas,
        gui2
      );

      const { position, target, near, far } = modelNode1.suggestCameraConfig();
      const camera = new THREE.PerspectiveCamera(
        75,
        leftCanvas.width / leftCanvas.height,
        near,
        far
      );
      const controls = new CameraControls(camera, leftCanvas);
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
      revealManager1.update(camera);
      revealManager2.update(camera);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime) => {
        const controlsNeedUpdate = controls.update(deltaTime);
        if (options1.loadingEnabled) {
          revealManager1.update(camera);
        }
        if (options2.loadingEnabled) {
          revealManager2.update(camera);
        }

        if (
          options1.renderMode === RenderMode.AlwaysRender ||
          (options1.renderMode === RenderMode.WhenNecessary &&
            (controlsNeedUpdate || revealManager1.needsRedraw))
        ) {
          applyRenderingFilters(scene1, options1.renderFilter);
          applySectorOverride(sectorCuller1, options1.overrideWantedSectors);
          renderer1.render(scene1, camera);
          revealManager1.resetRedraw();
        }
        if (
          options2.renderMode === RenderMode.AlwaysRender ||
          (options2.renderMode === RenderMode.WhenNecessary &&
            (controlsNeedUpdate || revealManager2.needsRedraw))
        ) {
          applyRenderingFilters(scene2, options2.renderFilter);
          applySectorOverride(sectorCuller2, options2.overrideWantedSectors);
          renderer2.render(scene2, camera);
          revealManager2.resetRedraw();
        }
      });
      animationLoopHandler.start();
    }

    main();
    return () => {
      animationLoopHandler.dispose();
      revealManager1?.dispose();
      revealManager2?.dispose();
    }
  });
  return (
    <Container>
      <table>
        <thead>
          <tr>
            <th id="header1" />
            <th id="header2" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <canvas id="leftCanvas" width="640" height="480" />
            </td>
            <td>
              <canvas id="rightCanvas" width="640" height="480" />
            </td>
          </tr>
          <tr style={{ verticalAlign: 'top', alignContent: 'center' }}>
            <td id="gui1" />
            <td id="gui2" />
          </tr>
        </tbody>
      </table>
    </Container>
  );
}
