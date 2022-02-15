#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

in float a_treeIndex;
in vec3 a_color;
in vec3 a_vertex1;
in vec3 a_vertex2;
in vec3 a_vertex3;
in vec3 a_vertex4;

out float v_treeIndex;
out vec3 v_color;
out vec3 v_normal;

out vec3 vViewPosition;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

#if NUM_CLIPPING_PLANES > 0
  uniform vec4 clippingPlanes[NUM_CLIPPING_PLANES];
  out vec4 v_clippingPlanes[NUM_CLIPPING_PLANES];
#endif

void main() {
  #if NUM_CLIPPING_PLANES > 0
    v_clippingPlanes = clippingPlanes;
  #endif
    vec3 transformed;
    // reduce the avarage branchings
    if (position.x < 1.5) {
      transformed = position.x == 0.0 ? a_vertex1 : a_vertex2;
    } else {
      transformed = position.x == 2.0 ? a_vertex3 : a_vertex4;
    }

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    vec3 objectNormal = cross(a_vertex1 - a_vertex2, a_vertex1 - a_vertex3);

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * normalize(inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(objectNormal, 0.0)).xyz;


    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
