#pragma glslify: mul3 = require('../../math/mul3.glsl')
#pragma glslify: displaceScalar = require('../../math/displaceScalar.glsl')

uniform mat4 inverseModelMatrix;
uniform mat4 inverseNormalMatrix;

attribute vec3 a_color;
attribute vec3 a_center;
attribute vec3 a_normal;
attribute float a_horizontalRadius;
attribute float a_verticalRadius;
attribute float a_height;

// We pack vRadius as w-component of center
varying vec4 center;
varying float hRadius;
varying float height;

// U, V, axis represent the 3x3 sphere basis.
// They are vec4 to pack extra data into the w-component
// since Safari on iOS only supports 8 varying vec4 registers.
varying vec4 U;
varying vec4 V;
varying vec4 sphereNormal;

varying vec3 v_color;
varying vec3 v_normal;

void main() {
    v_color = a_color;

    vec3 lDir;
    float distanceToCenterOfSegment = a_verticalRadius - a_height*0.5;
    vec3 centerOfSegment = a_center + a_normal*distanceToCenterOfSegment;

#if defined(COGNITE_ORTHOGRAPHIC_CAMERA)
      vec3 objectToCameraModelSpace = inverseNormalMatrix*vec3(0.0, 0.0, 1.0);
#else
      vec3 rayOrigin = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
      vec3 objectToCameraModelSpace = rayOrigin - centerOfSegment;
#endif

    vec3 newPosition = position;

    float bb = dot(objectToCameraModelSpace, a_normal);
    if (bb < 0.0) { // direction vector looks away, flip it
      lDir = -a_normal;
    } else { // direction vector already looks in my direction
      lDir = a_normal;
    }

    vec3 left = normalize(cross(objectToCameraModelSpace, lDir));
    vec3 up = normalize(cross(left, lDir));

#ifndef GL_EXT_frag_depth
    // make sure the billboard will not overlap with cap geometry (flickering effect), not important if we write to depth buffer
    newPosition.x *= 1.0 - (a_verticalRadius * (position.x + 1.0) * 0.0025 / a_height);
#endif

    // Negative angle means height larger than radius,
    // so we should have full size so we can render the largest part of the ellipsoid segment
    float ratio = max(0.0, 1.0 - a_height / a_verticalRadius);
    // maxRadiusOfSegment is the radius of the circle (projected ellipsoid) when ellipsoid segment is seen from above
    float maxRadiusOfSegment = a_horizontalRadius * sqrt(1.0 - ratio * ratio);

    vec3 displacement = vec3(newPosition.x*a_height*0.5, maxRadiusOfSegment*newPosition.y, maxRadiusOfSegment*newPosition.z);
    vec3 surfacePoint = centerOfSegment + mat3(lDir, left, up) * displacement;
    vec3 transformed = surfacePoint;

    surfacePoint = mul3(modelViewMatrix, surfacePoint);
    center.xyz = mul3(modelViewMatrix, a_center);
    center.w = a_verticalRadius; // Pack radius into w-component
    hRadius = a_horizontalRadius;
    height = a_height;

    // compute basis
    sphereNormal.xyz = normalMatrix * a_normal;
    U.xyz = normalMatrix * up;
    V.xyz = normalMatrix * left;

    // We pack surfacePoint as w-components of U, V and axis
    U.w = surfacePoint.x;
    V.w = surfacePoint.y;
    sphereNormal.w = surfacePoint.z;

    // START NEW CODE
    // TODO should perhaps be a different normal?
    //v_normal = normalMatrix * normal;
    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}
