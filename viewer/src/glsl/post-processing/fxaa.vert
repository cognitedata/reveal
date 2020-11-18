/*!
 *
 * Adapted from:
 * https://github.com/mattdesl/three-shader-fxaa
 * MIT License (MIT) Copyright (c) 2014 Matt DesLauriers
 *
 */

uniform vec2 resolution;
uniform vec2 inverseResolution;

varying vec2 vUv;

varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

void main() {
  vUv = uv;

  vec2 fragCoord = uv * resolution;
  v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseResolution;
  v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseResolution;
  v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseResolution;
  v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseResolution;
  v_rgbM = vec2(fragCoord * inverseResolution);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
