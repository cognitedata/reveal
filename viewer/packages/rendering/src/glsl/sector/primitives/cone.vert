#pragma glslify: import('../../math/mul3.glsl')
#pragma glslify: import('../../base/determineMatrixOverride.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');
#pragma glslify: import('../../base/renderModes.glsl')
#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl')
#pragma glslify: import('../../base/determineVisibility.glsl')

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
uniform sampler2D colorDataTexture;
uniform lowp int renderMode;

in vec3 position;
in vec3 normal;
in float a_treeIndex;
in vec3 a_centerA;
in vec3 a_centerB;
in float a_radiusA;
in float a_radiusB;
in vec3 a_color;
// segment ins
in vec3 a_localXAxis;
in float a_angle;
in float a_arcAngle;

// We pack the radii into w-components
out vec4 v_centerB;
// U, V, axis represent the 3x3 cone basis.
// They are vec4 to pack extra data into the w-component
// since Safari on iOS only supports 8 out vec4 registers.
out vec4 v_U;
out vec4 v_W;
out vec4 v_centerA;
out vec4 v_V;
out float v_angle;
out float v_arcAngle;
out vec3 v_color;
out vec3 v_normal;

out highp vec2 v_treeIndexPacked;

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, a_treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Will be clipped
        return;
    }

    v_treeIndexPacked = packTreeIndex(a_treeIndex);
    mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex,
      treeIndexTextureSize,
      transformOverrideIndexTexture,
      transformOverrideTextureSize,
      transformOverrideTexture
    );

    mat4 modelViewMatrix = viewMatrix * modelMatrix;

    mat4 modelTransformOffset = inverseModelMatrix * treeIndexWorldTransform * modelMatrix;

    vec3 centerA = mul3(modelTransformOffset, a_centerA);
    vec3 centerB = mul3(modelTransformOffset, a_centerB);

    vec3 center = 0.5 * (centerA + centerB);
    float halfHeight = 0.5 * length(centerA - centerB);
    vec3 dir = normalize(centerA - centerB);
    vec3 newPosition = position;

    vec3 rayOrigin = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
    vec3 objectToCameraModelSpace = rayOrigin - center;

    float maxRadius = max(a_radiusA, a_radiusB);
    float leftUpScale = maxRadius;

    vec3 lDir = dir;
    if (dot(objectToCameraModelSpace, dir) < 0.0) { // direction vector looks away, flip it
        lDir = -lDir;
    }

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

    // make sure the billboard will not overlap with cap geometry (flickering effect), not important if we write to depth buffer
    newPosition.x *= 1.0 - (maxRadius * (position.x + 1.0) * 0.0025 / halfHeight);

    vec3 surfacePoint = center + mat3(halfHeight * lDir, leftUpScale * left, leftUpScale * up) * newPosition;
    vec3 transformed = surfacePoint;
    surfacePoint = mul3(modelViewMatrix, surfacePoint);

    // out data
    v_angle = a_angle;
    v_arcAngle = a_arcAngle;

    // compute basis for cone
    v_W.xyz = dir;
    v_U.xyz = (modelTransformOffset * vec4(a_localXAxis, 0.0)).xyz;
    v_W.xyz = normalize(normalMatrix * v_W.xyz);
    v_U.xyz = normalize(normalMatrix * v_U.xyz);
    // We pack surfacePoint as w-components of U and W
    v_W.w = surfacePoint.z;
    v_U.w = surfacePoint.x;

    mat4 modelToTransformOffset = modelMatrix * modelTransformOffset;

    float radiusB = length((modelToTransformOffset * vec4(a_localXAxis * a_radiusB, 0.0)).xyz);
    float radiusA = length((modelToTransformOffset * vec4(a_localXAxis * a_radiusA, 0.0)).xyz);

    // We pack radii as w-components of v_centerB
    v_centerB.xyz = mul3(modelViewMatrix, centerB);
    v_centerB.w = radiusB;

    v_V.xyz = -cross(v_U.xyz, v_W.xyz);
    v_V.w = surfacePoint.y;

    v_centerA.xyz = mul3(modelViewMatrix, centerA);
    v_centerA.w = radiusA;

    v_color = a_color;
    v_normal = normalMatrix * normal;

    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

    gl_Position = projectionMatrix * mvPosition;
}
