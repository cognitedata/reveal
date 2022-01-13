/*!
 *
 * Adapted from:
 * https://github.com/mattdesl/three-shader-fxaa
 * MIT License (MIT) Copyright (c) 2014 Matt DesLauriers
 *
 */

uniform vec2 resolution;
uniform vec2 inverseResolution;

out vec2 v_uv;
out vec2 v_fragCoord;
out vec2 v_rgbNW;
out vec2 v_rgbNE;
out vec2 v_rgbSW;
out vec2 v_rgbSE;
out vec2 v_rgbM;

void main() {
  v_fragCoord = uv * resolution;
  v_rgbNW = (v_fragCoord + vec2(-1.0, -1.0)) * inverseResolution;
  v_rgbNE = (v_fragCoord + vec2(1.0, -1.0)) * inverseResolution;
  v_rgbSW = (v_fragCoord + vec2(-1.0, 1.0)) * inverseResolution;
  v_rgbSE = (v_fragCoord + vec2(1.0, 1.0)) * inverseResolution;
  v_rgbM = vec2(v_fragCoord * inverseResolution);
  v_uv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
