#pragma glslify: mul3 = require('../../math/mul3.glsl')
#pragma glslify: determineMatrixOverride = require('../../base/determineMatrixOverride.glsl')

uniform mat4 inverseModelMatrix;

attribute float a_treeIndex;
attribute vec3 a_centerA;
attribute vec3 a_centerB;
attribute float a_radius;
attribute vec3 a_color;
// slicing plane attributes
attribute vec4 a_planeA;
attribute vec4 a_planeB;
// segment attributes
attribute vec3 a_localXAxis;
attribute float a_angle;
attribute float a_arcAngle;

varying float v_treeIndex;
// We pack the radii into w-components
varying vec4 v_centerB;

// U, V, axis represent the 3x3 cone basis.
// They are vec4 to pack extra data into the w-component
// since Safari on iOS only supports 8 varying vec4 registers.
varying vec4 v_U;
varying vec4 v_W;

varying vec4 v_planeA;
varying vec4 v_planeB;

varying float v_surfacePointY;

varying float v_angle;
varying float v_arcAngle;

varying vec3 v_color;
varying vec3 v_normal;

uniform vec2 treeIndexTextureSize;

uniform sampler2D transformOverrideIndexTexture;

uniform vec2 transformOverrideTextureSize; 
uniform sampler2D transformOverrideTexture;

void main() {

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

    float leftUpScale = a_radius;

    vec3 lDir = dir;
    if (dot(objectToCameraModelSpace, dir) < 0.0) { // direction vector looks away, flip it
        lDir = -lDir;
    }

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

#ifndef GL_EXT_frag_depth
    // make sure the billboard will not overlap with cap geometry (flickering effect), not important if we write to depth buffer
    newPosition.x *= 1.0 - (a_radius * (position.x + 1.0) * 0.0025 / halfHeight);
#endif

    vec3 surfacePoint = center + mat3(halfHeight*lDir, leftUpScale*left, leftUpScale*up) * newPosition;
    vec3 transformed = surfacePoint;
    surfacePoint = mul3(modelViewMatrix, surfacePoint);

    // varying data
    v_treeIndex = a_treeIndex;
    v_angle = a_angle;
    v_arcAngle = a_arcAngle;

    // compute basis for cone
    v_W.xyz = dir;
    v_U.xyz = (modelTransformOffset * vec4(a_localXAxis, 0)).xyz;
    v_W.xyz = normalize(normalMatrix * v_W.xyz);
    v_U.xyz = normalize(normalMatrix * v_U.xyz);
    // We pack surfacePoint as w-components of U and W
    v_W.w = surfacePoint.z;
    v_U.w = surfacePoint.x;

    // We pack radii as w-components of v_centerB
    mat4 modelToTransformOffset = modelMatrix * modelTransformOffset;
    float radius = length((modelToTransformOffset * vec4(a_localXAxis * a_radius, 0.0)).xyz);

    v_centerB.xyz = mul3(modelViewMatrix, centerB);
    v_centerB.w = radius;

    vec4 planeA = a_planeA;
    planeA.w = length((modelToTransformOffset * vec4(planeA.xyz * planeA.w, 0.0)).xyz);

    vec4 planeB = a_planeB;
    planeB.w = length((modelToTransformOffset * vec4(planeB.xyz * planeB.w, 0.0)).xyz);

    v_planeA = planeA;
    v_planeB = planeB;
    v_surfacePointY = surfacePoint.y;
    v_centerB.w = radius;

    v_color = a_color;
    v_normal = normalMatrix * normal;

    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
