#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')

in mat4 a_instanceMatrix;

in float a_treeIndex;
in vec3 a_color;

out float v_treeIndex;
out vec3 v_color;
out vec3 v_viewPosition;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

#if NUM_CLIPPING_PLANES > 0
  uniform vec4 clippingPlanes[NUM_CLIPPING_PLANES];
  out vec4 v_clippingPlanes[NUM_CLIPPING_PLANES];
#endif

void main()
{
    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    #if NUM_CLIPPING_PLANES > 0
      v_clippingPlanes = clippingPlanes;
    #endif

    v_color = a_color;

    vec3 transformed = (a_instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = viewMatrix * modelMatrix * vec4(transformed, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    v_treeIndex = a_treeIndex;
    gl_Position = projectionMatrix * modelViewPosition;
}
