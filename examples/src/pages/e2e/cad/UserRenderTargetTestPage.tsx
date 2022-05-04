/*!
 * Copyright 2021 Cognite AS
 */

import { THREE } from '@cognite/reveal';
import React from 'react';
import { TestEnvCad, TestViewer } from '../TestViewer';
import { registerVisualTest } from '../../../visual_tests';

function UserRenderTargetTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({ renderer, revealManager }: TestEnvCad) => {
        const renderTarget = new THREE.WebGLRenderTarget(300, 300);
        renderTarget.depthTexture = new THREE.DepthTexture(1, 1);
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

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
        const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

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

registerVisualTest('cad', 'userRenderTarget', 'Custom render target', <UserRenderTargetTestPage />)
