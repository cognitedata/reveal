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
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader.js';
import dat from 'dat.gui';

CameraControls.install({ THREE });

export function Simple() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loadingState, setLoadingState] = useState<reveal.utilities.LoadingState>({ isLoading: false, itemsLoaded: 0, itemsRequested: 0 });

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
        revealManager = reveal.createCdfRevealManager(client, { logMetrics: false });
        model = await revealManager.addModel('cad', modelRevision);
      } else if (modelUrl) {
        revealManager = reveal.createLocalRevealManager({ logMetrics: false });
        model = await revealManager.addModel('cad', modelUrl);
      } else {
        throw new Error(
          'Need to provide either project & model OR modelUrl as query parameters'
        );
      }

      revealManager.on('loadingStateChanged', setLoadingState);

      scene.add(model);
      const context = canvas.current.getContext( 'webgl2', { antialias: false } )!;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
        context: context,
        alpha: true
      });

      var volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };
			const gui = new dat.GUI();
			gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
			gui.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );
			gui.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( updateUniforms );
			gui.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
			gui.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms );

      var material: THREE.ShaderMaterial;
      var cmtextures = {
        viridis: new THREE.TextureLoader().load( 'textures/cm_viridis.png', render ),
        gray: new THREE.TextureLoader().load( 'textures/cm_gray.png', render )
      };

      if ( renderer.capabilities.isWebGL2 ) {
        new NRRDLoader().load( "nrrd/stent.nrrd", function ( volume ) {

          // Texture to hold the volume. We have scalars, so we put our data in the red channel.
          // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
          // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
          // TODO: look the dtype up in the volume metadata

          const data = new Float32Array(volume.data);

          const texture = new THREE.DataTexture3D(data, volume.xLength, volume.yLength, volume.zLength );
          texture.format = THREE.RedFormat;
          texture.type = THREE.FloatType;
          texture.minFilter = texture.magFilter = THREE.LinearFilter;
          texture.unpackAlignment = 1;
  
          // Material
          const shader = VolumeRenderShader1;
  
          const uniforms = THREE.UniformsUtils.clone( shader.uniforms );
  
          uniforms[ "u_data" ].value = texture;
          uniforms[ "u_size" ].value.set( volume.xLength, volume.yLength, volume.zLength );
          uniforms[ "u_clim" ].value.set( volconfig.clim1, volconfig.clim2 );
          uniforms[ "u_renderstyle" ].value = volconfig.renderstyle === 'mip' ? 0 : 1; // 0: MIP, 1: ISO
          uniforms[ "u_renderthreshold" ].value = volconfig.isothreshold; // For ISO renderstyle
          uniforms[ "u_cmdata" ].value = volconfig.colormap === 'gray' ? cmtextures.gray : cmtextures.viridis;
  
          material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
          } );
  
          // THREE.Mesh
          const geometry = new THREE.BoxBufferGeometry( volume.xLength, volume.yLength, volume.zLength );
          geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 );
  
          const mesh = new THREE.Mesh( geometry, material );
          scene.add( mesh );
  
          render();
  
        } );
      }

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
          //revealManager.render(renderer, camera, scene);
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

      function render() {
        //revealManager.render(renderer, camera, scene);
        renderer.render(scene, camera);
      }

      function updateUniforms() {
        material.uniforms[ "u_clim" ].value.set( volconfig.clim1, volconfig.clim2 );
        material.uniforms[ "u_renderstyle" ].value = volconfig.renderstyle === 'mip' ? 0 : 1; // 0: MIP, 1: ISO
        material.uniforms[ "u_renderthreshold" ].value = volconfig.isothreshold; // For ISO renderstyle
        material.uniforms[ "u_cmdata" ].value = volconfig.colormap === 'gray' ? cmtextures.gray : cmtextures.viridis;
  
        render();
      }
    }

    main();

    return () => {
      revealManager?.dispose();
      animationLoopHandler.dispose();
    };
  }, []);
  const { isLoading, itemsLoaded, itemsRequested } = loadingState;
  return (
    <CanvasWrapper>
      <Loader isLoading={isLoading} style={{ position: 'absolute' }}>
        Downloading {itemsLoaded} / {itemsRequested} sectors.
      </Loader>
      <canvas ref={canvas} />
    </CanvasWrapper>
  );
}
