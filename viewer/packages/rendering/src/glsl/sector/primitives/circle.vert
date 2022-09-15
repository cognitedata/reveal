#pragma glslify: import('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;

in vec3 position;
in mat4 a_instanceMatrix;
in float a_treeIndex;
in vec3 a_color;
in vec3 a_normal;

out vec2 v_xy;
out vec3 v_color;
out vec3 v_normal;
out vec3 vViewPosition;

out highp float v_treeIndexHundreds;
out mediump float v_treeIndexSubHundreds;

void main() {
    v_treeIndexHundreds = floor(a_treeIndex / 100.0);
    v_treeIndexSubHundreds = round(mod(a_treeIndex, 100.0));
    v_xy = vec2(position.x, position.y);

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
