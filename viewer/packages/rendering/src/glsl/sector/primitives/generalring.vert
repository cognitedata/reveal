#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

attribute mat4 a_instanceMatrix;

attribute float a_treeIndex;
attribute vec3 a_color;
attribute float a_angle;
attribute float a_arcAngle;
attribute float a_thickness;
attribute vec3 a_normal;

varying float v_treeIndex;
varying float v_oneMinusThicknessSqr;
varying vec2 v_xy;
varying float v_angle;
varying float v_arcAngle;

varying vec3 v_color;
varying vec3 v_normal;

varying vec3 vViewPosition;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

void main() {
    v_treeIndex = a_treeIndex;
    v_oneMinusThicknessSqr = (1.0 - a_thickness) * (1.0 - a_thickness);
    v_xy = vec2(position.x, position.y);
    v_angle = a_angle;
    v_arcAngle = a_arcAngle;

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    vec3 transformed = (a_instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    v_color = a_color;

    v_normal = normalMatrix * normalize(inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(normalize(a_normal), 0.0)).xyz;
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
