#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')
#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

in vec4 a_instanceMatrix_column_0;
in vec4 a_instanceMatrix_column_1;
in vec4 a_instanceMatrix_column_2;
in vec4 a_instanceMatrix_column_3;

in float a_treeIndex;
in vec3 a_color;
in vec3 a_normal;

out vec2 v_xy;
out vec3 v_color;
out vec3 v_normal;
out float v_treeIndex;

out vec3 vViewPosition;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

void main() {
    v_xy = vec2(position.x, position.y);
    v_treeIndex = a_treeIndex;

    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    v_color = a_color;

    v_normal = normalMatrix * normalize(inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(normalize(a_normal), 0.0)).xyz;
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
