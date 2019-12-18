vec3 derivateNormal(vec3 v_viewPosition) {
  vec3 fdx = vec3(dFdx(v_viewPosition.x), dFdx(v_viewPosition.y), dFdx(v_viewPosition.z));
  vec3 fdy = vec3(dFdy(v_viewPosition.x), dFdy(v_viewPosition.y), dFdy(v_viewPosition.z));
  vec3 normal = normalize(cross(fdx, fdy));
  return normal;
}

#pragma glslify: export(derivateNormal)
