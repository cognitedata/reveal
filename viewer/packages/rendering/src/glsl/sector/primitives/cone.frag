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

in vec4 v_centerB;
in vec4 v_W;
in vec4 v_U;
in float v_angle;
in float v_arcAngle;
in vec4 v_centerA;
in vec4 v_V;
in vec3 v_color;
in vec3 v_normal;

in highp vec2 v_treeIndexPacked;

void main()
{
  highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);

  // Redo appearance texture lookup from vertex shader due to limit in transferable attributes
  NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);

  vec3 normal = normalize( v_normal );
  vec4 color = determineColor(v_color, appearance);

  float R1 = v_centerB.w;
  vec4 U = v_U;
  vec4 W = v_W;
  vec4 V = v_V;
  float height = length(v_centerA.xyz - v_centerB.xyz);
  float R2 = v_centerA.w;
  float dR = R2 - R1;

  mat3 basis = mat3(U.xyz, V.xyz, W.xyz);
  vec3 surfacePoint = vec3(U.w, V.w, W.w);
  vec3 rayTarget = surfacePoint;
  float rayTargetDist = length(rayTarget);

  #if defined(COGNITE_ORTHOGRAPHIC_CAMERA)
    vec3 rayDirection = vec3(0.0, 0.0, -1.0);
  #else
    vec3 rayDirection = normalize(rayTarget); // rayOrigin is (0,0,0) in camera space
  #endif

  vec3 diff = rayTarget - v_centerB.xyz;
  vec3 E = diff * basis;
  vec3 D = rayDirection * basis;

  float a = dot(D.xy, D.xy);
  float b = dot(E.xy, D.xy);
  float c = dot(E.xy, E.xy) - R1*R1;

  if (R1 != R2) {
    // Additional terms if radii are different
    float dRLInv = dR / height;
    float dRdRL2Inv = dRLInv * dRLInv;
    a -= D.z * D.z * dRdRL2Inv;
    b -= dRLInv * (E.z * D.z * dRLInv + R1 * D.z);
    c -= dRLInv * (E.z * E.z * dRLInv + 2.0 * R1 * E.z);
  }

  // Calculate a dicriminant of the above quadratic equation
  float d = b*b - a*c;

  // d < 0.0 means the ray hits outside an infinitely long cone
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

  float dist = dist1;
  vec3 intersectionPoint = E + dist * D;
  float theta = atan(intersectionPoint.y, intersectionPoint.x);
  if (theta < v_angle) theta += 2.0 * PI;
  if (theta < v_angle) theta += 2.0 * PI;

  // Intersection point in camera space
  vec3 p = rayTarget + dist * rayDirection;

  bool isInner = false;

  if (intersectionPoint.z <= 0.0 ||
      intersectionPoint.z > height ||
      theta > v_angle + v_arcAngle ||
      isClipped(appearance, p) ||
      rayTargetDist + dist < 0.0
    ) {
      // Missed the first point, check the other point
      isInner = true;
      dist = dist2;
      intersectionPoint = E + dist * D;
      theta = atan(intersectionPoint.y, intersectionPoint.x);
      p = rayTarget + dist * rayDirection;

      if (theta < v_angle) theta += 2.0 * PI;
      if (theta < v_angle) theta += 2.0 * PI;

      if (intersectionPoint.z <= 0.0 ||
        intersectionPoint.z > height ||
        theta > v_angle + v_arcAngle ||
        isClipped(appearance, p) ||
        rayTargetDist + dist < 0.0
      ) {
        // Missed the other point too
        discard;
      }
    }

  #if !defined(COGNITE_RENDER_COLOR_ID) && !defined(COGNITE_RENDER_DEPTH)
      if (R1 != R2)
      {
        // Find normal vector
        vec3 n = -normalize(W.xyz);
        vec3 P1 = v_centerB.xyz;
        vec3 P2 = v_centerA.xyz;
        vec3 A = cross(P1 - p, P2 - p);

        vec3 t = normalize(cross(n, A));
        vec3 o1 = P1 + R1 * t;
        vec3 o2 = P2 + R2 * t;
        vec3 B = o2-o1;
        normal = normalize(cross(A, B));
      }
      else
      {
        // Regular cylinder has simpler normal vector in camera space
        vec3 p_local = p - v_centerB.xyz;
        normal = normalize(p_local - W.xyz * dot(p_local, W.xyz));
      }


      if (dot(normal, vec3(0.0, 0.0, 1.0)) < 0.0) {
        normal *= -1.0;
      }
  #endif

    float fragDepth = updateFragmentDepth(p, projectionMatrix);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, fragDepth, matCapTexture, GeometryType.Primitive);
}
