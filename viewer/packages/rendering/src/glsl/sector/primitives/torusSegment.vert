#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

in mat4 a_instanceMatrix;

in float a_treeIndex;
in vec3 a_color;
in float a_arcAngle;
in float a_radius;
in float a_tubeRadius;

out float v_treeIndex;
out vec3 v_color;
out vec3 v_normal;

out vec3 vViewPosition;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

void main() {
    // normalized theta and phi are packed into positions
    float theta = position.x * a_arcAngle;
    float phi = position.y;
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    vec3 pos3 = vec3(0);

    pos3.x = (a_radius + a_tubeRadius*cos(phi)) * cosTheta;
    pos3.y = (a_radius + a_tubeRadius*cos(phi)) * sinTheta;
    pos3.z = a_tubeRadius*sin(phi);

    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );
    
    vec3 transformed = (a_instanceMatrix * vec4(pos3, 1.0)).xyz;

    // Calculate normal vectors if we're not picking
    vec3 center = (a_instanceMatrix * vec4(a_radius * cosTheta, a_radius * sinTheta, 0.0, 1.0)).xyz;
    vec3 objectNormal = normalize(transformed.xyz - center);

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * normalize(inverseModelMatrix * treeIndexWorldTransform * modelMatrix * vec4(objectNormal, 0.0)).xyz;

    vec4 modelViewPosition = viewMatrix * treeIndexWorldTransform * modelMatrix * vec4(transformed, 1.0);

    vViewPosition = modelViewPosition.xyz;

    gl_Position = projectionMatrix * modelViewPosition;
}
