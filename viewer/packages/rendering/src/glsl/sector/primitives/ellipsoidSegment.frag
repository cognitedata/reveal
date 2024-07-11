precision highp float;

#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl');
#pragma glslify: import('../../base/determineColor.glsl');
#pragma glslify: import('../../base/isClipped.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform mat4 projectionMatrix;
uniform lowp int renderMode;

// Note! Must be placed after all uniforms in order for this to work on iOS (REV-287)
#pragma glslify: import('../../base/updateFragmentDepth.glsl')

in vec4 center;
in float hRadius;
in float height;
in vec4 U;
in vec4 V;
in vec4 sphereNormal;
in vec3 v_color;
in vec3 v_normal;

in highp vec2 v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);

    // Redo appearance texture lookup from vertex shader due to limit in transferable attributes
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);

    vec4 color = determineColor(v_color, appearance);
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
    float c = dot(E, E) - vRadius * vRadius;

    // discriminant of sphere equation (factor 2 removed from b above)
    float d = b*b - a*c;
    if(d < 0.0)
        discard;

    float sqrtd = sqrt(d);
    float dist1 = (-b - sqrtd) / a;
    float dist2 = (-b + sqrtd) / a;

    // Make sure dist1 is the smaller one
    if (dist2 < dist1) {
        float tmp = dist1;
        dist1 = dist2;
        dist2 = tmp;
    }

    float dist = dist1;
    float intersectionPointZ = E.z + dist * D.z;
    // Intersection point in camera space
    vec3 p = rayTarget + dist * rayDirection;

    if (intersectionPointZ <= vRadius - height ||
        intersectionPointZ > vRadius ||
        isClipped(p)
       ) {
        // Missed the first point, check the other point

        dist = dist2;
        intersectionPointZ = E.z + dist * D.z;
        p = rayTarget + dist * rayDirection;
        if (intersectionPointZ <= vRadius - height ||
            intersectionPointZ > vRadius ||
            isClipped(p)
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

    float fragDepth = updateFragmentDepth(p, projectionMatrix);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, fragDepth, matCapTexture, GeometryType.Primitive);
}
