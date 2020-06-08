/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect, useRef, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import * as THREE from 'three';
import {
  CadNode,
  intersectCadNodes,
  LocalHostRevealManager,
  RevealManager,
  utilities,
} from '@cognite/reveal/experimental';
import CameraControls from 'camera-controls';
import { Scene, WebGLRenderer } from 'three';
import { addWASDHandling } from '../utils/cameraControls';
import {
  createRenderManager,
  getParamsFromURL,
} from '../utils/example-helpers';
import dat from 'dat.gui';
import { CanvasWrapper, Container } from '../components/styled';
import { resizeRendererToDisplaySize } from '../utils/sceneHelpers';

CameraControls.install({ THREE });

function getNormalizedCoords(
  event: MouseEvent | TouchEvent,
  domElement: HTMLCanvasElement
): { x: number; y: number } {
  const e = 'clientX' in event ? event : event.touches[0];
  const rect = domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / domElement.clientWidth) * 2 - 1;
  const y = ((e.clientY - rect.top) / domElement.clientHeight) * -2 + 1;
  return { x, y };
}

function createSphere(point: THREE.Vector3, color: string): THREE.Mesh {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshPhongMaterial({ color })
  );
  sphere.position.copy(point);
  return sphere;
}

function getMiddlePoint(p1: THREE.Vector3, p2: THREE.Vector3) {
  const x = (p2.x + p1.x) / 2;
  const y = (p2.y + p1.y) / 2;
  const z = (p2.z + p1.z) / 2;
  return new THREE.Vector3(x, y, z);
}

export function DistanceMeasurement() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const distanceLabel = useRef<HTMLDivElement>(null);
  const [measuredDistance, setMeasuredDistance] = useState<any>();

  useEffect(() => {
    let scene: Scene | undefined;
    let renderer: WebGLRenderer | undefined;
    const gui = new dat.GUI();

    (async () => {
      if (!canvas.current || !distanceLabel.current) {
        return;
      }
      const { project, modelUrl, modelRevision } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });

      const client = new CogniteClient({ appId: 'reveal.example.measurement' });
      client.loginWithOAuth({ project });

      const scene = new THREE.Scene();
      let isRenderRequired = true;

      const revealManager = createRenderManager(
        modelRevision !== undefined ? 'cdf' : 'local',
        client
      );

      let model: CadNode;
      if (
        revealManager instanceof LocalHostRevealManager &&
        modelUrl !== undefined
      ) {
        model = await revealManager.addModel('cad', modelUrl);
      } else if (
        revealManager instanceof RevealManager &&
        modelRevision !== undefined
      ) {
        model = await revealManager.addModel('cad', modelRevision);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      scene.add(model);

      // without light there is no colors for custom geometry (like our spheres)
      var light = new THREE.AmbientLight(0xffffff);
      scene.add(light);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
      });

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor('#444');

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

      addWASDHandling(controls);

      const htmlOverlayHelper = new utilities.HtmlOverlayHelper();

      const clock = new THREE.Clock();

      const render = () => {
        if (resizeRendererToDisplaySize(renderer, camera)) {
          isRenderRequired = true;
        }

        const delta = clock.getDelta();
        const controlsNeedUpdate = controls.update(delta);

        if (controlsNeedUpdate) {
          isRenderRequired = true;
          revealManager.update(camera);
        }
        if (isRenderRequired || revealManager.needsRedraw) {
          renderer.render(scene, camera);
          htmlOverlayHelper.updatePositions(renderer, camera);
          revealManager.resetRedraw();
          isRenderRequired = false;
        }
        requestAnimationFrame(render);
      };
      revealManager.update(camera);
      render();

      let points: Array<THREE.Mesh> = [];
      let line: THREE.Line | null = null;

      const removeMeasures = () => {
        if (line) {
          scene.remove(line);
          line = null;
        }
        scene.remove(...points);
        points = [];
        htmlOverlayHelper.removeOverlayElement(distanceLabel.current!);
        setMeasuredDistance(0);
        isRenderRequired = true;
      };

      let measureMode = false;
      const guiState = {
        measure() {
          if (!measureMode) {
            renderer.domElement.style.cursor = 'pointer';
          } else {
            removeMeasures();
            renderer.domElement.style.cursor = 'default';
          }
          measureMode = !measureMode;
        },
        removeMeasures,
      };

      gui.add(guiState, 'measure');
      gui.add(guiState, 'removeMeasures');

      const addMeasurePoint = (event: MouseEvent | TouchEvent) => {
        if (
          !measureMode ||
          ('button' in event && event.button !== THREE.MOUSE.LEFT)
        ) {
          return;
        }
        const coords = getNormalizedCoords(event, renderer.domElement);

        // Pick in Reveal
        const revealPickResult = (() => {
          const intersections = intersectCadNodes([model], {
            renderer,
            camera,
            coords,
          });
          return intersections[0];
        })();

        if (revealPickResult) {
          const pointMesh = createSphere(revealPickResult.point, '#f5f500');
          scene.add(pointMesh);
          model.requestNodeUpdate([revealPickResult.treeIndex]);
          isRenderRequired = true;

          if (line) {
            removeMeasures();
          }

          points.push(pointMesh);

          if (points.length === 2) {
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const geometry = new THREE.BufferGeometry().setFromPoints(
              points.map((p) => p.position)
            );
            line = new THREE.Line(geometry, material);
            scene.add(line);

            htmlOverlayHelper.addOverlayElement(
              distanceLabel.current!,
              getMiddlePoint(points[0].position, points[1].position)
            );
            setMeasuredDistance(
              points[0].position.distanceTo(points[1].position).toFixed(4)
            );

            measureMode = false;
            renderer.domElement.style.cursor = 'default';
            isRenderRequired = true;
          }
        }
      };
      renderer.domElement.addEventListener('mousedown', addMeasurePoint);
      renderer.domElement.addEventListener('touchstart', addMeasurePoint);
    })();

    return () => {
      scene?.dispose();
      renderer?.dispose();
      gui.destroy();
    };
  }, []);

  return (
    <Container>
      <h4>Click "Measure" then click any 2 points</h4>
      <CanvasWrapper>
        <canvas ref={canvas} />
        <div
          ref={distanceLabel}
          style={{
            padding: '3px',
            position: 'absolute',
            pointerEvents: 'none',
            color: 'rgb(255, 255, 255)',
            background: 'rgba(35, 35, 35, 0.855)',
            borderRadius: '15%',
            display: measuredDistance ? 'block' : 'none',
          }}
        >
          {measuredDistance} m
        </div>
      </CanvasWrapper>
    </Container>
  );
}
