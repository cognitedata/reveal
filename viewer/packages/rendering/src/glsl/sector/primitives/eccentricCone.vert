#pragma glslify: mul3 = require('../../math/mul3.glsl')
#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl');

uniform mat4 inverseModelMatrix;

in float a_treeIndex;
in vec3 a_centerA;
in vec3 a_centerB;
in float a_radiusA;
in float a_radiusB;
in vec3 a_normal;
in vec3 a_color;

out float v_treeIndex;
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

out vec2 v_ZW;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

uniform int renderMode;
out float v_renderMode;

void main() {
  v_renderMode = float(renderMode); // REV-287
  mat4 treeIndexWorldTransform = determineMatrixOverride(
      a_treeIndex, 
      treeIndexTextureSize, 
      transformOverrideIndexTexture, 
      transformOverrideTextureSize, 
      transformOverrideTexture
    );

    mat4 modelTransformOffset = inverseModelMatrix * treeIndexWorldTransform * modelMatrix;
    mat4 modelToTransformOffset = modelMatrix * modelTransformOffset;

    vec3 centerA = mul3(modelTransformOffset, a_centerA);
    vec3 centerB = mul3(modelTransformOffset, a_centerB);

    vec3 normalWithOffset = normalize((modelTransformOffset * vec4(a_normal, 0)).xyz);

    float uniformScaleFactor = length(mul3(modelMatrix, normalize(vec3(1.0))));

    height = dot(centerA - centerB, normalWithOffset) * uniformScaleFactor;

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

    v_centerA.xyz = mul3(viewMatrix, mul3(modelMatrix, centerA));
    v_centerB.xyz = mul3(viewMatrix, mul3(modelMatrix, centerB));

    float radiusA = length((modelToTransformOffset * vec4(normalize(vec3(1.0)) * a_radiusA, 0.0)).xyz);
    float radiusB = length((modelToTransformOffset * vec4(normalize(vec3(1.0)) * a_radiusB, 0.0)).xyz);

    // Pack radii as w components of v_centerA and v_centerB
    v_centerA.w = radiusA;
    v_centerB.w = radiusB;

    float radiusIncludedDisplacement = 0.5*(2.0*max(a_radiusA, a_radiusB) + distanceBetweenProjectedCenters);
    vec3 surfacePoint = center + mat3(0.5 * height * lDir * (1.0 / uniformScaleFactor), radiusIncludedDisplacement*left, radiusIncludedDisplacement*up) * newPosition;
    vec3 transformed = surfacePoint;

    surfacePoint = mul3(modelViewMatrix, surfacePoint);

    // We pack surfacePoint as w-components of U, V and axis
    U.w = surfacePoint.x;
    V.w = surfacePoint.y;
    axis.w = surfacePoint.z;

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * normal;

    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    v_ZW = gl_Position.zw;
}
