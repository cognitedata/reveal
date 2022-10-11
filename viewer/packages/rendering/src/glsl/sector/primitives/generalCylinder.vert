#pragma glslify: import('../../math/mul3.glsl')
#pragma glslify: import('../../base/determineMatrixOverride.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');

uniform mat4 inverseModelMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
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
in vec4 a_planeA;
in vec4 a_planeB;
in vec3 a_localXAxis;
in float a_angle;
in float a_arcAngle;

<<<<<<< HEAD
flat out float v_treeIndex;
out vec3 v_centerB;
out mat3 v_modelBasis;
out vec3 v_viewPos;
=======
// We pack the radii into w-components
out vec4 v_centerB;
// U, V, axis represent the 3x3 cone basis.
// They are vec4 to pack extra data into the w-component
// since Safari on iOS only supports 8 varying vec4 registers.
out vec4 v_U;
out vec4 v_W;
>>>>>>> 9b6fc680e1ec483cfe8bf63b9d3b14be90e3c6c5
out vec4 v_planeA;
out vec4 v_planeB;
out vec2 v_angles;
out vec3 v_color;
out float v_radius;

out TreeIndexPacked v_treeIndexPacked;

void main() {
    v_treeIndexPacked = packTreeIndex(a_treeIndex);

    mat4 treeIndexWorldTransform = determineMatrixOverride(
        a_treeIndex,
        treeIndexTextureSize,
        transformOverrideIndexTexture,
        transformOverrideTextureSize,
        transformOverrideTexture
    );

    mat4 modelToTransformOffset = treeIndexWorldTransform * modelMatrix;
    mat4 modelToView = viewMatrix * modelToTransformOffset;

    vec3 centerA = a_centerA;
    vec3 centerB = a_centerB;

    vec3 center = 0.5 * (centerA + centerB);
    float halfHeight = 0.5 * length(centerA - centerB);
    vec3 dir = normalize(centerA - centerB);

    vec3 rayOrigin = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
    vec3 objectToCameraModelSpace = rayOrigin - center;

    vec3 lDir = faceforward(dir, -objectToCameraModelSpace, dir);

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

    vec3 localBillboardPosition = center + mat3(halfHeight * lDir, a_radius * left, a_radius * up) * position;
    vec3 viewBillboardPosition = mul3(modelToView, localBillboardPosition);

    gl_Position = projectionMatrix * vec4(viewBillboardPosition, 1.0 );

    // varying data
    v_treeIndex = a_treeIndex;
    v_angles[0] = a_angle;
    v_angles[1] = a_arcAngle;

    v_modelBasis[0] = normalize(normalMatrix * a_localXAxis);
    v_modelBasis[2] = normalize(normalMatrix * dir);
    v_modelBasis[1] = normalize(cross(v_modelBasis[2], v_modelBasis[0]));

    float radius = length((modelToTransformOffset * vec4(a_localXAxis * a_radius, 0.0)).xyz);

    v_centerB = mul3(modelToView, centerB);
    v_radius = radius;

    float planeAngleA = acos(dot(normalize(a_planeA.xyz), normalize(vec3(0.0, 0.0, 1.0))));
    float planeAngleB = acos(dot(normalize(a_planeB.xyz), normalize(vec3(0.0, 0.0, -1.0))));

    vec4 planeA = a_planeA;
    planeA.w = length((modelToTransformOffset * vec4(halfHeight * 2.0 * dir, 0.0)).xyz) - tan(planeAngleA) * radius;

    vec4 planeB = a_planeB;
    planeB.w = tan(planeAngleB) * radius;

    v_planeA = planeA;
    v_planeB = planeB;
    v_viewPos = viewBillboardPosition;

    v_color = a_color;
}
