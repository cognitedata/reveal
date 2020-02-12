#ifdef GL_EXT_frag_depth

void updateFragmentDepth(vec3 p,mat4 projectionMatrix){
  // Anders Hafreager comments:
  // Depth value can be calculated by transforming the z-component of the intersection point to projection space.
  // The w-component is also needed to scale projection space into clip space.
  // However, the 4th column of the projection matrix is (0, 0, const, 0), so we can exploit this when computing w-value.
  float projected_intersection_z=projectionMatrix[0][2]*p.x+projectionMatrix[1][2]*p.y+projectionMatrix[2][2]*p.z+projectionMatrix[3][2];

  // If we want to use orthographic camera, the full w-component is found as
  float projected_intersection_w=projectionMatrix[0][3]*p.x+projectionMatrix[1][3]*p.y+projectionMatrix[2][3]*p.z+projectionMatrix[3][3];
  // float projected_intersection_w = projectionMatrix[2][3]*newPoint.z; // Optimized for perspective camera
  gl_FragDepthEXT = ((gl_DepthRange.diff * (projected_intersection_z / projected_intersection_w)) + gl_DepthRange.near + gl_DepthRange.far) * .5;
}

#else

void updateFragmentDepth(vec3 p,mat4 projectionMatrix){
  // Extension not available - not much we can do.
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}

#endif

#pragma glslify:export(updateFragmentDepth)
