/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import { CadNode } from '@cognite/reveal/threejs';

const vertexShaderAntialias = `
varying vec2 vUv;

varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;
uniform vec2 resolution;

// https://github.com/mattdesl/three-shader-fxaa

void main() {
  vUv = uv;

  vec2 fragCoord = uv * resolution;
  vec2 inverseVP = 1.0 / resolution.xy;
  v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
  v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
  v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
  v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
  v_rgbM = vec2(fragCoord * inverseVP);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShaderAntialias = `
varying vec2 vUv;

varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

uniform vec2 resolution;
uniform sampler2D tDiffuse;

#ifndef FXAA_REDUCE_MIN
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
    #define FXAA_SPAN_MAX     8.0
#endif

vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
    vec2 v_rgbNW, vec2 v_rgbNE,
    vec2 v_rgbSW, vec2 v_rgbSE,
    vec2 v_rgbM) {
  vec4 color;
  mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
  vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
  vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
  vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
  vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
  vec4 texColor = texture2D(tex, v_rgbM);
  vec3 rgbM  = texColor.xyz;
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM  = dot(rgbM,  luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  mediump vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                  (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
      max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
      dir * rcpDirMin)) * inverseVP;

  vec4 rgbA = 0.5 * (
    texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)) +
    texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)));
  vec4 rgbB = rgbA * 0.5 + 0.25 * (
    texture2D(tex, fragCoord * inverseVP + dir * -0.5) +
    texture2D(tex, fragCoord * inverseVP + dir * 0.5));

  float lumaB = dot(rgbB.rgb, luma);
  if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
    color = rgbA;
  } else {
    color = rgbB;
  }
  return color;
}

void main() {
  vec2 fragCoord = vUv * resolution;
  gl_FragColor = fxaa(tDiffuse, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
`;

const passThroughVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ssaoShader = `
uniform float cameraNear;
uniform float cameraFar;
#ifdef USE_LOGDEPTHBUF
  uniform float logDepthBufFC;
#endif

uniform float radius;    // ao radius
uniform bool onlyAO;     // use only ambient occlusion pass?

uniform vec2 size;       // texture width, height
uniform float aoClamp;   // depth clamp - reduces haloing at screen edges

uniform float lumInfluence; // how much luminance affects occlusion

uniform sampler2D tDiffuse;
uniform highp sampler2D tDepth;

varying vec2 vUv;

#define DL 2.399963229728653 // PI * ( 3.0 - sqrt( 5.0 ) )
#define EULER 2.718281828459045

// user variables

const int samples = 12;   // ao sample count

const bool useNoise = true;     // use noise instead of pattern for sample dithering
const float noiseAmount = 0.0004;// dithering amount

const float diffArea = 0.4;  // self-shadowing reduction
const float gDisplace = 0.4; // gauss bell center


// RGBA depth

#include <packing>

// generating noise / pattern texture for dithering

vec2 rand( const vec2 coord ) {
  vec2 noise;
  if (useNoise) {
    float nx = dot(coord, vec2(12.9898, 78.233));
    float ny = dot(coord, vec2(12.9898, 78.233) * 2.0);
    noise = clamp(fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0);
  } else {
    float ff = fract( 1.0 - coord.s * ( size.x / 2.0 ) );
    float gg = fract( coord.t * ( size.y / 2.0 ) );
    noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;
  }
  return ( noise * 2.0  - 1.0 ) * noiseAmount;
}

float readDepth( vec2 coord ) {
  float fragCoordZ = texture2D( tDepth, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float compareDepths( const in float depth1, const in float depth2, inout int far ) {
  float garea = 8.0;                        // gauss bell width
  float diff = ( depth1 - depth2 ) * 100.0; // depth difference (0-100)

  // reduce left bell width to avoid self-shadowing
  if ( diff < gDisplace ) {
    garea = diffArea;
  } else {
    far = 1;
  }

  float dd = diff - gDisplace;
  float gauss = pow( EULER, -2.0 * ( dd * dd ) / ( garea * garea ) );
  return gauss;
}

float calcAO( float depth, float dw, float dh ) {
  vec2 vv = vec2( dw, dh );

  vec2 coord1 = vUv + radius * vv;
  vec2 coord2 = vUv - radius * vv;

  float temp1 = 0.0;
  float temp2 = 0.0;

  int far = 0;
  temp1 = compareDepths( depth, readDepth( coord1 ), far );

  // DEPTH EXTRAPOLATION

  if (far > 0) {
    temp2 = compareDepths( readDepth( coord2 ), depth, far );
    temp1 += ( 1.0 - temp1 ) * temp2;
  }
  return temp1;
}

void main() {
  vec2 noise = rand( vUv );
  float depth = readDepth( vUv );

  float tt = clamp( depth, aoClamp, 1.0 );

  float w = ( 1.0 / size.x ) / tt + ( noise.x * ( 1.0 - noise.x ) );
  float h = ( 1.0 / size.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );

  float ao = 0.0;

  float dz = 1.0 / float( samples );
  float l = 0.0;
  float z = 1.0 - dz / 2.0;

  for ( int i = 0; i <= samples; i ++ ) {
    float r = sqrt( 1.0 - z );
    float pw = cos( l ) * r;
    float ph = sin( l ) * r;
    ao += calcAO( depth, pw * w, ph * h );
    z = z - dz;
    l = l + DL;
  }

  ao /= float( samples );
  ao = 1.0 - ao;

  vec3 color = texture2D( tDiffuse, vUv ).rgb;

  vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );
  float lum = dot( color.rgb, lumcoeff );
  vec3 luminance = vec3( lum );

  vec3 final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) ); // ambient occlusion only
  if (!onlyAO) {
    final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) ); // mix( color * ao, white, luminance )
  }

  gl_FragColor = vec4( final, 1.0 );
}
`;

const ssaoFinalShader = `
// Copyright Cognite (C) 2019 Cognite
//
// Efficient Gaussian blur based on technique described by Daniel Rákos in
// http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D ssaoTexture;

uniform vec2 size;

const bool blur = true;

void main() {
  vec3 blurredAO;
  if (blur) {
    vec3 result = 0.5 * (
      2.0 * texture2D(ssaoTexture, vUv).rgb * 0.2270270270 +
      texture2D(ssaoTexture, vUv + vec2(1.3746153846, 0.0) / size.x).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv + vec2(3.2307692308, 0.0) / size.x).rgb * 0.0702702703 +
      texture2D(ssaoTexture, vUv - vec2(1.3746153846, 0.0) / size.x).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv - vec2(3.2307692308, 0.0) / size.x).rgb * 0.0702702703 +
      texture2D(ssaoTexture, vUv + vec2(0.0, 1.3746153846) / size.y).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv + vec2(0.0, 3.2307692308) / size.y).rgb * 0.0702702703 +
      texture2D(ssaoTexture, vUv - vec2(0.0, 1.3746153846) / size.y).rgb * 0.3162162162 +
      texture2D(ssaoTexture, vUv - vec2(0.0, 3.2307692308) / size.y).rgb * 0.0702702703
    );
    blurredAO = result;
  } else {
    blurredAO = texture2D(ssaoTexture, vUv).rgb;
  }
  vec4 color = texture2D(tDiffuse, vUv);
  gl_FragColor = vec4(vec3(color.rgb * blurredAO), color.a);
}
`;

CameraControls.install({ THREE });

function setupRenderingPass(options: { uniforms: any; vertexShader: string; fragmentShader: string }): THREE.Scene {
  const scene = new THREE.Scene();
  const material = new THREE.ShaderMaterial({
    uniforms: options.uniforms,
    vertexShader: options.vertexShader,
    fragmentShader: options.fragmentShader,
    depthWrite: false
  });
  const quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
  return scene;
}

interface SceneInfo {
  scene: THREE.Scene;
  uniforms: any;
}

function createSSAOScene(diffuseTexture: THREE.Texture, depthTexture: THREE.Texture): SceneInfo {
  const uniforms = {
    tDiffuse: { value: diffuseTexture },
    tDepth: { value: depthTexture },
    size: { value: new THREE.Vector2() },
    cameraNear: { value: 0 }, // set during rendering
    cameraFar: { value: 0 }, // set during rendering
    radius: { value: 6 },
    onlyAO: { value: true },
    aoClamp: { value: 0.25 },
    lumInfluence: { value: 0.7 }
  };
  const scene = setupRenderingPass({
    uniforms,
    vertexShader: passThroughVertexShader,
    fragmentShader: ssaoShader
  });
  return { scene, uniforms };
}

function createSSAOFinalScene(diffuseTexture: THREE.Texture, ssaoTexture: THREE.Texture): SceneInfo {
  const uniforms = {
    tDiffuse: { value: diffuseTexture },
    ssaoTexture: { value: ssaoTexture },
    size: { value: new THREE.Vector2() }
  };
  const scene = setupRenderingPass({
    uniforms,
    vertexShader: passThroughVertexShader,
    fragmentShader: ssaoFinalShader
  });
  return { scene, uniforms };
}

function createAntialiasScene(diffuseTexture: THREE.Texture): SceneInfo {
  const uniforms = {
    tDiffuse: { value: diffuseTexture },
    resolution: { value: new THREE.Vector2() }
  };
  const scene = setupRenderingPass({
    uniforms,
    vertexShader: vertexShaderAntialias,
    fragmentShader: fragmentShaderAntialias
  });
  return { scene, uniforms };
}

const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

async function main() {
  const modelTarget = new THREE.WebGLRenderTarget(0, 0); // adjust size later
  modelTarget.depthBuffer = true;
  modelTarget.depthTexture = new THREE.DepthTexture(0, 0); // size will be set by the first render
  modelTarget.depthTexture.type = THREE.UnsignedIntType;

  const ssaoTarget = new THREE.WebGLRenderTarget(0, 0); // adjust size later
  ssaoTarget.depthBuffer = false;
  ssaoTarget.stencilBuffer = false;

  const ssaoFinalTarget = new THREE.WebGLRenderTarget(0, 0); // adjust size later
  ssaoFinalTarget.depthBuffer = false;
  ssaoFinalTarget.stencilBuffer = false;

  const { scene: ssaoScene, uniforms: ssaoUniforms } = createSSAOScene(modelTarget.texture, modelTarget.depthTexture);

  const { scene: ssaoFinalScene, uniforms: ssaoFinalUniforms } = createSSAOFinalScene(
    modelTarget.texture,
    ssaoTarget.texture
  );

  const { scene: antiAliasScene, uniforms: antiAliasUniforms } = createAntialiasScene(ssaoFinalTarget.texture);

  /////////

  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const scene = new THREE.Scene();
  const cadModel = await reveal.createLocalCadModel(modelUrl);
  const cadNode = new CadNode(cadModel);

  scene.add(cadNode);

  const renderer = new THREE.WebGLRenderer();
  // renderer.setClearColor('#444');
  renderer.setClearColor('#000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  const clock = new THREE.Clock();

  const setSize = (width: number, height: number) => {
    renderer.setSize(width, height, false);

    modelTarget.setSize(width, height);

    antiAliasUniforms.resolution.value.set(width, height);

    const halfWidth = Math.floor(width * 0.5);
    const halfheight = Math.floor(height * 0.5);
    ssaoTarget.setSize(halfWidth, halfheight);
    ssaoUniforms.size.value.set(width, height);

    ssaoFinalTarget.setSize(width, height);
    ssaoFinalUniforms.size.value.set(width, height);
  };

  setSize(renderer.domElement.width, renderer.domElement.height);

  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate) {
      renderer.setRenderTarget(modelTarget);
      renderer.render(scene, camera);

      ssaoUniforms.cameraNear.value = camera.near;
      ssaoUniforms.cameraFar.value = camera.far;
      renderer.setRenderTarget(ssaoTarget);
      renderer.render(ssaoScene, quadCamera);

      renderer.setRenderTarget(ssaoFinalTarget);
      renderer.render(ssaoFinalScene, quadCamera);

      renderer.setRenderTarget(null);
      renderer.render(antiAliasScene, quadCamera);
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
