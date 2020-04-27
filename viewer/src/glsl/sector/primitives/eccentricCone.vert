#pragma glslify: mul3 = require('../../math/mul3.glsl')
#pragma glslify: displaceScalar = require('../../math/displaceScalar.glsl')

uniform mat4 inverseModelMatrix;

attribute float a_treeIndex;
attribute vec3 a_centerA;
attribute vec3 a_centerB;
attribute float a_radiusA;
attribute float a_radiusB;
attribute vec3 a_normal;
attribute vec3 a_color;

varying float v_treeIndex;
// We pack the radii into w-components
varying vec4 v_centerA;
varying vec4 v_centerB;

// U, V, axis represent the 3x3 cone basis.
// They are vec4 to pack extra data into the w-component
// since Safari on iOS only supports 8 varying vec4 registers.
varying vec4 U;
varying vec4 V;
varying vec4 axis;
varying float height;

varying vec3 v_color;
varying vec3 v_normal;

void main() {
    vec3 lDir;
    height = dot(a_centerA - a_centerB, a_normal);
    vec3 center = 0.5 * (a_centerA + a_centerB);
    vec3 newPosition = position;

#if defined(COGNITE_ORTHOGRAPHIC_CAMERA)
      vec3 objectToCameraModelSpace = inverseNormalMatrix*vec3(0.0, 0.0, 1.0);
#else
      vec3 rayOrigin = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
      vec3 objectToCameraModelSpace = rayOrigin - center;
#endif


    // Find the coordinates of centerA and centerB projected down to the end cap plane
    vec3 maxCenterProjected = a_centerA - dot(a_centerA, a_normal)*a_normal;
    vec3 minCenterProjected = a_centerB - dot(a_centerB, a_normal)*a_normal;
    float distanceBetweenProjectedCenters = length(maxCenterProjected - minCenterProjected);

    lDir = a_normal;
    float dirSign = 1.0;
    if (dot(objectToCameraModelSpace, lDir) < 0.0) { // direction vector looks away, flip it
      dirSign = -1.0;
      lDir *= -1.;
    }

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

    // compute basis for cone
    axis.xyz = -a_normal;
    U.xyz = cross(objectToCameraModelSpace, axis.xyz);
    V.xyz = cross(U.xyz, axis.xyz);
    // Transform to camera space
    axis.xyz = normalize(normalMatrix * axis.xyz);
    U.xyz = normalize(normalMatrix * U.xyz);
    V.xyz = normalize(normalMatrix * V.xyz);

#ifndef GL_EXT_frag_depth
    // make sure the billboard will not overlap with cap geometry (flickering effect), not important if we write to depth buffer
    newPosition.x *= 1.0 - (a_radiusA * (position.x + 1.0) * 0.0025 / height);
#endif

    v_centerA.xyz = mul3(modelViewMatrix, a_centerA);
    v_centerB.xyz = mul3(modelViewMatrix, a_centerB);
    // Pack radii as w components of v_centerA and v_centerB
    v_centerA.w = displaceScalar(a_centerA, a_radiusA, a_treeIndex, cameraPosition, inverseModelMatrix);
    v_centerB.w = displaceScalar(a_centerB, a_radiusB, a_treeIndex, cameraPosition, inverseModelMatrix);

    float radiusIncludedDisplacement = 0.5*(2.0*max(a_radiusA, a_radiusB) + distanceBetweenProjectedCenters);
    vec3 surfacePoint = center + mat3(0.5*height*lDir, radiusIncludedDisplacement*left, radiusIncludedDisplacement*up) * newPosition;
    vec3 transformed = surfacePoint;

    // We pack radii as w-components of coneTop and coneBase
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
}
