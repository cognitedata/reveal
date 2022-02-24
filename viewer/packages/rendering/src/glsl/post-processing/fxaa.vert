/*!
 *
 * Adapted from:
 * https://github.com/mattdesl/three-shader-fxaa
 * MIT License (MIT) Copyright (c) 2014 Matt DesLauriers
 *
 */
precision highp float;
precision highp int;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 resolution;
uniform vec2 inverseResolution;

in vec3 position;
in vec2 uv;

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

  mat4 modelViewMatrix = modelMatrix * viewMatrix;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
