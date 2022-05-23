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
        renderTarget.depthTexture = new THREE.DepthTexture(300, 300);
        renderTarget.depthTexture.format = THREE.DepthFormat;
        renderTarget.depthTexture.type = THREE.UnsignedIntType;

        // TODO christjt - 10-05-2022: The rendertarget should be added in the initialization options
        // for the revealManager, but that is not available to be here.
        (revealManager as any)._renderPipeline._outputRenderTarget = renderTarget;

        const orthographicCamera = new THREE.OrthographicCamera(
          -1,
          1,
          1,
          -1,
          0,
          1
        );

        const vShader = `
          uniform mat4 modelMatrix;

          in vec3 position;
          in vec2 uv;
          
          out vec2 vUv;
          
          const mat4 unitOrthographicProjection = mat4(1., 0., 0., 0., 0., 1., 0., 0., 0., 0., -1., 0., 0., 0., 0., 1.);
          
          void main() {
              vUv = uv;
              gl_Position = unitOrthographicProjection * modelMatrix * vec4(position, 1.0);
          }
        `;

        const fShader = `
          precision highp float;

          uniform sampler2D tDiffuse;
          uniform sampler2D tDepth;

          in vec2 vUv; 

          out vec4 color;

          void main() {
            if(vUv.x > 0.5){
              color = texture(tDiffuse, vUv);
            } else {
              float d = texture(tDepth, vUv).r;
              color = vec4(vec3(1.0 - pow(d, 20.0)), 1.0);
            }
          }
        `;

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
        const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        var shaderMaterial = new THREE.RawShaderMaterial({
          vertexShader: vShader,
          fragmentShader: fShader,
          uniforms: {
            tDiffuse: {value: renderTarget.texture},
            tDepth: {value: renderTarget.depthTexture},
          },
          glslVersion: THREE.GLSL3,
          depthTest: true
        });

        const mesh = new THREE.Mesh(geometry, shaderMaterial);

        const testScene = new THREE.Scene();
        testScene.add(mesh);

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
