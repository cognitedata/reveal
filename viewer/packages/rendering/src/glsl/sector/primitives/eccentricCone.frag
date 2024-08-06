precision highp float;

#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl');
#pragma glslify: import('../../base/determineColor.glsl');
#pragma glslify: import('../../base/isClipped.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');
#pragma glslify: import('../../math/constants.glsl')

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform mat4 projectionMatrix;
uniform lowp int renderMode;

// Note! Must be placed after all uniforms in order for this to work on iOS (REV-287)
#pragma glslify: import('../../base/updateFragmentDepth.glsl')

in vec4 U;
in vec4 V;
in vec4 axis;
in vec4 v_centerA;
in vec4 v_centerB;
in float height;
in vec3 v_color;
in vec3 v_normal;

in highp vec2  v_treeIndexPacked;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);

    // Redo appearance texture lookup from vertex shader due to limit in transferable attributes
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);

    vec4 color = determineColor(v_color, appearance);
    vec3 normal = normalize( v_normal );
    mat3 basis = mat3(U.xyz, V.xyz, axis.xyz);
    vec3 surfacePoint = vec3(U.w, V.w, axis.w);
    vec3 rayTarget = surfacePoint;
    float rayTargetDist = length(rayTarget);

#if defined(COGNITE_ORTHOGRAPHIC_CAMERA)
      vec3 rayDirection = vec3(0.0, 0.0, -1.0);
#else
      vec3 rayDirection = normalize(rayTarget); // rayOrigin is (0,0,0) in camera space
#endif

    vec3 diff = rayTarget - v_centerA.xyz;
    vec3 E = diff * basis;
    float L = height;
    vec3 D = rayDirection * basis;

    float R1 = v_centerA.w;
    float R2 = v_centerB.w;
    float dR = R2 - R1;

    float a = dot(D.xy, D.xy);
    float b = dot(E.xy, D.xy);
    float c = dot(E.xy, E.xy) - R1 * R1;
    float L2Inv = 1.0 / (L * L);

    if (R1 != R2) {
      // Additional terms if radii are different
      float dRLInv = dR / L;
      float dRdRL2Inv = dRLInv * dRLInv;
      a -= D.z * D.z * dRdRL2Inv;
      b -= dRLInv * (E.z * D.z * dRLInv + R1 * D.z);
      c -= dRLInv * (E.z * E.z * dRLInv + 2.0 * R1 * E.z);
    }

    // Additional terms when one of the center points is displaced orthogonal to normal vector
    vec2 displacement = ((v_centerB.xyz - v_centerA.xyz) * basis).xy; // In the basis where displacement is in XY only
    float displacementLengthSquared = dot(displacement, displacement);
    a += D.z * (D.z * displacementLengthSquared - 2.0 * L * dot(D.xy, displacement)) * L2Inv;
    b += (D.z * E.z * displacementLengthSquared - L * (D.x * E.z * displacement.x + D.y * E.z * displacement.y + D.z * E.x * displacement.x + D.z * E.y * displacement.y)) * L2Inv;
    c += E.z * (E.z * displacementLengthSquared - 2.0 * L * dot(E.xy, displacement)) * L2Inv;

    // Calculate a dicriminant of the above quadratic equation (factor 2 removed from all b-terms above)
    float d = b*b - a*c;

    // d < 0.0 means the ray hits outside an infinitely long eccentric cone
    if (d < 0.0) {
      discard;
    }
    float sqrtd = sqrt(d);
    float dist1 = (-b - sqrtd) / a;
    float dist2 = (-b + sqrtd) / a;

    // Make sure dist1 is the smaller one
    if (dist2 < dist1) {
      float tmp = dist1;
      dist1 = dist2;
      dist2 = tmp;
    }

    // Check the smallest root, it is closest camera. Only test if the z-component is outside the truncated eccentric cone
    float dist = dist1;
    float intersectionPointZ = E.z + dist * D.z;
    // Intersection point in camera space
    vec3 p = rayTarget + dist * rayDirection;

    if (intersectionPointZ <= 0.0 ||
      intersectionPointZ >= L ||
      isClipped(p) ||
      rayTargetDist + dist < 0.0
      ) {
      // Either intersection point is behind starting point (happens inside the cone),
      // or the intersection point is outside the end caps. This is not a valid solution.
      dist = dist2;
      intersectionPointZ = E.z + dist * D.z;
      p = rayTarget + dist * rayDirection;

      if (intersectionPointZ <= 0.0 ||
        intersectionPointZ >= L ||
        isClipped(p) ||
        rayTargetDist + dist < 0.0
      ) {
        // Missed the other point too
        discard;
      }
    }

#if !defined(COGNITE_RENDER_COLOR_ID) && !defined(COGNITE_RENDER_DEPTH)
    // Find normal vector
    vec3 n = normalize(-axis.xyz);
    vec3 v_centerA = v_centerA.xyz;
    vec3 v_centerB = v_centerB.xyz;
    vec3 A = cross(v_centerA - p, v_centerB - p);

    vec3 t = normalize(cross(n, A));
    vec3 o1 = v_centerA + R1 * t;
    vec3 o2 = v_centerB + R2 * t;
    vec3 B = o2 - o1;
    normal = normalize(cross(A, B));
#endif

    if (dot(normal, vec3(0.0, 0.0, 1.0)) < 0.0) {
      normal *= -1.0;
    }

    float fragDepth = updateFragmentDepth(p, projectionMatrix);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, fragDepth, matCapTexture, GeometryType.Primitive);
}
