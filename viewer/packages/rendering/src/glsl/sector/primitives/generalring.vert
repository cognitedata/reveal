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
in float a_angle;
in float a_arcAngle;
in float a_thickness;
in vec3 a_normal;

flat out float v_treeIndex;
out float v_oneMinusThicknessSqr;
out vec2 v_xy;
out float v_angle;
out float v_arcAngle;
out vec3 v_color;
out vec3 v_normal;
out vec3 vViewPosition;

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
