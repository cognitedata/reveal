#if NUM_CLIPPING_PLANES > 0
uniform vec4 clippingPlanes[NUM_CLIPPING_PLANES];
#endif

bool isSliced(vec3 point) {
#if NUM_CLIPPING_PLANES > 0
  vec3 pointFlipped = -point;
  vec4 plane;

  for (int i = 0; i < UNION_CLIPPING_PLANES; i++) {
    plane = clippingPlanes[i];
    if (dot(pointFlipped, plane.xyz) > plane.w) return true;
  }
#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
  bool clipped = true;
  for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      clipped = (dot(pointFlipped, plane.xyz) > plane.w) && clipped;
  }
  if ( clipped ) return true;
#endif
#endif
  return false;
}

#pragma glslify: export(isSliced)
