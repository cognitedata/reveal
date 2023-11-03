#pragma glslify: import('../../math/mul3.glsl')
#pragma glslify: import('../../math/quadToViewSpace.glsl')
#pragma glslify: import('../../base/determineMatrixOverride.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');
#pragma glslify: import('../../base/renderModes.glsl')
#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl')
#pragma glslify: import('../../base/determineVisibility.glsl')

uniform mat4 inverseModelMatrix;
uniform mat4 modelViewMatrix;
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
in vec3 a_normal;
in vec3 a_color;

// We pack the radii into w-components
out vec4 v_centerA;
out vec4 v_centerB;
// U, V, axis represent the 3x3 cone basis.
// They are vec4 to pack extra data into the w-component
// since Safari on iOS only supports 8 out vec4 registers.
out vec4 U;
out vec4 V;
out vec4 axis;
out float height;
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

    mat4 modelToTransformOffset = modelViewMatrix * treeIndexWorldTransform;

    vec3 centerA = mul3(treeIndexWorldTransform, a_centerA);
    vec3 centerB = mul3(treeIndexWorldTransform, a_centerB);

    vec3 normalWithOffset = normalize((treeIndexWorldTransform * vec4(a_normal, 0)).xyz);

    vec3 centerAInCameraSpace = (modelViewMatrix * vec4(centerA, 1.0)).xyz;
    vec3 centerBInCameraSpace = (modelViewMatrix * vec4(centerB, 1.0)).xyz;

    height = dot(normalize(centerA - centerB), normalWithOffset) * length(centerAInCameraSpace - centerBInCameraSpace);

    vec3 lDir;
    vec3 center = 0.5 * (centerA + centerB);
    vec3 newPosition = position;

    vec3 rayOrigin = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
    vec3 objectToCameraModelSpace = rayOrigin - center;


    // Find the coordinates of centerA and centerB projected down to the end cap plane
    vec3 maxCenterProjected = centerA - dot(centerA, normalWithOffset) * normalWithOffset;
    vec3 minCenterProjected = centerB - dot(centerB, normalWithOffset) * normalWithOffset;
    float distanceBetweenProjectedCenters = length(maxCenterProjected - minCenterProjected);

    lDir = normalWithOffset;
    float dirSign = 1.0;
    if (dot(objectToCameraModelSpace, lDir) < 0.0) { // direction vector looks away, flip it
      dirSign = -1.0;
      lDir *= -1.;
    }

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

    // compute basis for cone
    axis.xyz = -normalWithOffset;
    U.xyz = cross(objectToCameraModelSpace, axis.xyz);
    V.xyz = cross(U.xyz, axis.xyz);
    // Transform to camera space
    axis.xyz = normalize(normalMatrix * axis.xyz);
    U.xyz = normalize(normalMatrix * U.xyz);
    V.xyz = normalize(normalMatrix * V.xyz);

    // make sure the billboard will not overlap with cap geometry (flickering effect), not important if we write to depth buffer
    newPosition.x *= 1.0 - (a_radiusA * (position.x + 1.0) * 0.0025 / height);

    v_centerA.xyz = mul3(modelViewMatrix, centerA);
    v_centerB.xyz = mul3(modelViewMatrix, centerB);

    float radiusA = length((modelToTransformOffset * vec4(normalize(vec3(1.0)) * a_radiusA, 0.0)).xyz);
    float radiusB = length((modelToTransformOffset * vec4(normalize(vec3(1.0)) * a_radiusB, 0.0)).xyz);

    // Pack radii as w components of v_centerA and v_centerB
    v_centerA.w = radiusA;
    v_centerB.w = radiusB;

    float radiusIncludedDisplacement = 0.5 * (2.0 * max(a_radiusA, a_radiusB) + distanceBetweenProjectedCenters);
    mat3 billboardWorldRotation = mat3(lDir, left, up);
    vec3 cylinderAxisScales = vec3(height, radiusIncludedDisplacement, radiusIncludedDisplacement);
    mat3 inverseBillboardWorldRotation = transpose(billboardWorldRotation);
    vec3 cameraPosInCylinderSpace = inverseBillboardWorldRotation * (rayOrigin - center);

    mat3 billboardWorldScaleRotation = mat3(0.5 * height * lDir, radiusIncludedDisplacement * left, radiusIncludedDisplacement * up);
    vec3 localBillboardPosition = center + billboardWorldScaleRotation * newPosition;
    vec3 surfacePoint = mul3(modelViewMatrix, localBillboardPosition);

    // Due to numeric instability when near and far planes are relatively close to each other,
    // we just clamp near to a relatively low constant when checking whether we're inside the cylinder
    float near = min(1.0, projectionMatrix[3][2] / (projectionMatrix[2][2] - 1.0));

    // Check whether we are inside the primitive, in which case the quad must cover the entire screen
    if (isWithinSpan(cameraPosInCylinderSpace, cylinderAxisScales + vec3(near))) {
        surfacePoint = transformQuadToCoverScreenInViewSpace(newPosition, projectionMatrix, near);
    }

    // We pack surfacePoint as w-components of U, V and axis
    U.w = surfacePoint.x;
    V.w = surfacePoint.y;
    axis.w = surfacePoint.z;

    v_color = a_color;
    v_normal = normalMatrix * normal;

    gl_Position = projectionMatrix * vec4( surfacePoint, 1.0 );
}