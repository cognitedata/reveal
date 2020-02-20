#pragma glslify: updateFragmentDepth = require('../../base/updateFragmentDepth.glsl')
#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: isSliced = require('../../base/isSliced.glsl')
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

uniform sampler2D colorDataTexture;

uniform mat4 projectionMatrix;
varying vec4 center;
varying float hRadius;
varying float height;

varying vec4 U;
varying vec4 V;
varying vec4 sphereNormal;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform int renderMode;

void main() {
    vec3 color = determineColor(v_color, colorDataTexture, v_treeIndex);
    vec3 normal = normalize(sphereNormal.xyz);

    float vRadius = center.w;
    float ratio = vRadius / hRadius;
    mat3 basis = mat3(U.xyz, V.xyz, sphereNormal.xyz);
    mat3 scaledBasis = mat3(ratio * U.xyz, ratio * V.xyz, sphereNormal.xyz);
    vec3 surfacePoint = vec3(U.w, V.w, sphereNormal.w);
    vec3 rayTarget = surfacePoint;

#if defined(COGNITE_ORTHOGRAPHIC_CAMERA)
    vec3 rayDirection = vec3(0.0, 0.0, -1.0);
#else
    vec3 rayDirection = normalize(rayTarget); // rayOrigin is (0,0,0) in camera space
#endif

    vec3 diff = rayTarget - center.xyz;
    vec3 E = diff * scaledBasis;
    vec3 D = rayDirection * scaledBasis;

    float a = dot(D, D);
    float b = dot(E, D);
    float c = dot(E, E) - vRadius*vRadius;

    // discriminant of sphere equation (factor 2 removed from b above)
    float d = b*b - a*c;
    if(d < 0.0)
        discard;

    float sqrtd = sqrt(d);
    float dist1 = (-b - sqrtd)/a;
    float dist2 = (-b + sqrtd)/a;

    // Make sure dist1 is the smaller one
    if (dist2 < dist1) {
        float tmp = dist1;
        dist1 = dist2;
        dist2 = tmp;
    }

    float dist = dist1;
    float intersectionPointZ = E.z + dist*D.z;
    // Intersection point in camera space
    vec3 p = rayTarget + dist*rayDirection;

    if (intersectionPointZ <= vRadius - height ||
        intersectionPointZ > vRadius || isSliced(p)
       ) {
        // Missed the first point, check the other point

        dist = dist2;
        intersectionPointZ = E.z + dist*D.z;
        p = rayTarget + dist*rayDirection;
        if (intersectionPointZ <= vRadius - height ||
            intersectionPointZ > vRadius || isSliced(p)
           ) {
            // Missed the other point too
            discard;
        }
    }

#if !defined(COGNITE_RENDER_COLOR_ID) && !defined(COGNITE_RENDER_DEPTH)
    // Find normal vector in local space
    normal = vec3(p - center.xyz) * basis;
    normal.z = normal.z * (hRadius / vRadius) * (hRadius / vRadius);
    // Transform into camera space
    normal = normalize(basis * normal);
    if (dot(normal, rayDirection) >  0.) {
        normal = -normal;
    }
#endif

  updateFragmentColor(renderMode, color, v_treeIndex, normal);
  updateFragmentDepth(p, projectionMatrix);
}
