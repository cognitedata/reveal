/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { Viewer } from '../Viewer';

export function UserRenderTargetTestPage() {
  return (
    <Viewer
      modifyTestEnv={({ renderer, revealManager }) => {
        const renderTarget = new THREE.WebGLRenderTarget(300, 300);
        renderTarget.depthTexture = new THREE.DepthTexture(0, 0);
        renderTarget.depthTexture.format = THREE.DepthFormat;
        renderTarget.depthTexture.type = THREE.UnsignedIntType;

        revealManager.setRenderTarget(renderTarget);

        const orthographicCamera = new THREE.OrthographicCamera(
          -1,
          1,
          1,
          -1,
          0,
          1
        );

        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
        geometry.vertices.push(new THREE.Vector3(3, -1, 0));
        geometry.vertices.push(new THREE.Vector3(-1, 3, 0));

        const face = new THREE.Face3(0, 1, 2);
        geometry.faces.push(face);

        geometry.faceVertexUvs[0].push([
          new THREE.Vector2(0, 0),
          new THREE.Vector2(2, 0),
          new THREE.Vector2(0, 2),
        ]);

        var material = new THREE.MeshBasicMaterial({
          map: renderTarget.texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 1.0;

        var material2 = new THREE.MeshBasicMaterial({
          map: renderTarget.depthTexture,
          side: THREE.DoubleSide,
        });
        const mesh2 = new THREE.Mesh(geometry, material2);
        mesh2.rotateY(Math.PI);
        mesh2.position.x = -1.0;

        const testScene = new THREE.Scene();
        testScene.add(mesh);
        testScene.add(mesh2);

        return {
          camera: new THREE.PerspectiveCamera(),
          cameraConfig: {
            position: new THREE.Vector3(10, -5, -26),
          },
          postRender() {
            renderer.setRenderTarget(null);
            renderer.render(testScene, orthographicCamera);
          },
        };
      }}
    />
  );
}
