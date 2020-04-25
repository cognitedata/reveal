#pragma glslify: mul3 = require('../../math/mul3.glsl')
#pragma glslify: displaceScalar = require('../../math/displaceScalar.glsl')
#pragma glslify: updateFragmentDepth = require('../../base/updateFragmentDepth.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: isSliced = require('../../base/isSliced.glsl')
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

#define PI 3.14159265359
#define PI2 6.28318530718
#define PI_HALF 1.5707963267949

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform sampler2D matCapTexture;

uniform vec2 dataTextureSize;

uniform mat4 projectionMatrix;

varying vec4 v_centerB;

varying vec4 v_W;
varying vec4 v_U;

varying float v_angle;
varying float v_arcAngle;

varying vec4 v_centerA;
varying vec4 v_V;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

uniform int renderMode;

void main() {
  if (!determineVisibility(overrideVisibilityPerTreeIndex, dataTextureSize, v_treeIndex)) {
    discard;
  }

  vec3 normal = normalize( v_normal );
  vec3 color = determineColor(v_color, colorDataTexture, dataTextureSize, v_treeIndex);

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
  if (d < 0.0)
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
  vec3 intersectionPoint = E + dist * D;
  float theta = atan(intersectionPoint.y, intersectionPoint.x);
  if (theta < v_angle) theta += 2.0 * PI;

  // Intersection point in camera space
  vec3 p = rayTarget + dist*rayDirection;

  bool isInner = false;

  if (intersectionPoint.z <= 0.0 ||
      intersectionPoint.z > height ||
      theta > v_angle + v_arcAngle ||
      isSliced(p)
    ) {
      // Missed the first point, check the other point
      isInner = true;
      dist = dist2;
      intersectionPoint = E + dist * D;
      theta = atan(intersectionPoint.y, intersectionPoint.x);
      p = rayTarget + dist*rayDirection;
      if (theta < v_angle) theta += 2.0 * PI;
      if (intersectionPoint.z <= 0.0 ||
        intersectionPoint.z > height ||
        theta > v_angle + v_arcAngle ||
        isSliced(p)
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
  #endif


    float fragDepth = updateFragmentDepth(p, projectionMatrix);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, fragDepth, matCapTexture);
}
