#pragma glslify: mul3 = require('../../math/mul3.glsl')
#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

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

out float v_treeIndex;
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

    vec3 surfacePoint = center + mat3(halfHeight*lDir, leftUpScale*left, leftUpScale*up) * newPosition;
    vec3 transformed = surfacePoint;
    surfacePoint = mul3(modelViewMatrix, surfacePoint);

    // out data
    v_treeIndex = a_treeIndex;
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
    v_ZW = gl_Position.zw;
}
