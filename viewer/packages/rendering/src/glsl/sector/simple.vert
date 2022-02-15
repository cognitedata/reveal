#pragma glslify: determineMatrixOverride = require('../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

in vec3 color;
in float treeIndex;
in vec4 matrix0;
in vec4 matrix1;
in vec4 matrix2;
in vec4 matrix3;

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
    
    mat4 treeIndexWorldTransform = determineMatrixOverride(
      treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    #if NUM_CLIPPING_PLANES > 0
      v_clippingPlanes = clippingPlanes;
    #endif

    v_treeIndex = treeIndex;
    v_color = color;
    v_normal = normalize(normalMatrix * (inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(normalize(normal), 0.0)).xyz);
    mat4 instanceMatrix = mat4(matrix0, matrix1, matrix2, matrix3);
    vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4( transformed, 1.0 );
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
