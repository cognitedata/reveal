/*!
 *
 * Adapted from:
 * https://github.com/mattdesl/three-shader-fxaa
 * MIT License (MIT) Copyright (c) 2014 Matt DesLauriers
 *
 */

uniform vec2 resolution;
uniform vec2 inverseResolution;

varying vec2 v_fragCoord;
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

void main() {
  v_fragCoord = uv * resolution;
  v_rgbNW = (v_fragCoord + vec2(-1.0, -1.0)) * inverseResolution;
  v_rgbNE = (v_fragCoord + vec2(1.0, -1.0)) * inverseResolution;
  v_rgbSW = (v_fragCoord + vec2(-1.0, 1.0)) * inverseResolution;
  v_rgbSE = (v_fragCoord + vec2(1.0, 1.0)) * inverseResolution;
  v_rgbM = vec2(v_fragCoord * inverseResolution);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
