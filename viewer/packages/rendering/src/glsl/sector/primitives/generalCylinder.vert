#pragma glslify: import('../../math/mul3.glsl')
#pragma glslify: import('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;

in vec3 position;
in vec3 normal;
in float a_treeIndex;
in vec3 a_centerA;
in vec3 a_centerB;
in float a_radius;
in vec3 a_color;
// slicing plane attributes
in vec4 a_planeA;
in vec4 a_planeB;
// segment attributes
in vec3 a_localXAxis;
in float a_angle;
in float a_arcAngle;

flat out float v_treeIndex;
// We pack the radii into w-components
out vec3 v_centerB;
out mat3 v_modelBasis;
out vec3 v_viewPos;
out vec4 v_planeA;
out vec4 v_planeB;
out vec2 v_angles;
out vec3 v_color;
out float v_radius;

void main() {
    vec3 centerA = a_centerA;
    vec3 centerB = a_centerB;

    vec3 center = 0.5 * (centerA + centerB);
    float halfHeight = 0.5 * length(centerA - centerB);
    vec3 dir = normalize(centerA - centerB);

    vec3 rayOrigin = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
    vec3 objectToCameraModelSpace = rayOrigin - center;

    vec3 lDir = dir;
    if (dot(objectToCameraModelSpace, dir) < 0.0) { // direction vector looks away, flip it
        lDir = -lDir;
    }

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

    vec3 localBillboardPosition = center + mat3(halfHeight * lDir, a_radius * left, a_radius * up) * position;
    vec3 viewBillboardPosition = mul3(modelViewMatrix, localBillboardPosition);

    gl_Position = projectionMatrix * vec4(viewBillboardPosition, 1.0 );

    // varying data
    v_treeIndex = a_treeIndex;
    v_angles[0] = a_angle;
    v_angles[1] = a_arcAngle;

    v_modelBasis[0] = normalize(normalMatrix * a_localXAxis);
    v_modelBasis[2] = normalize(normalMatrix * dir);
    v_modelBasis[1] = normalize(cross(v_modelBasis[2], v_modelBasis[0]));

    // We pack radii as w-components of v_centerB
    mat4 modelToTransformOffset = modelMatrix;
    float radius = length((modelMatrix * vec4(a_localXAxis * a_radius, 0.0)).xyz);

    centerB = centerB - dir;
    v_centerB = mul3(modelViewMatrix, centerB);
    v_radius = radius;

    vec4 planeA = a_planeA;
    planeA.w = length((modelMatrix * vec4(planeA.xyz * planeA.w, 0.0)).xyz);

    vec4 planeB = a_planeB;
    planeB.w = length((modelMatrix * vec4(planeB.xyz * planeB.w, 0.0)).xyz);

    v_planeA = planeA;
    v_planeB = planeB;
    v_viewPos = viewBillboardPosition;

    v_color = a_color;
}
