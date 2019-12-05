
float displaceScalar(vec3 point, float scalar, 
  float treeIndex, vec3 cameraPosition, mat4 inverseModelMatrix) {

  // Displaces a scalar based on distance to camera to avoid z-fighting
  vec3 cameraPositionModelSpace = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
  vec3 pointToCamera = cameraPositionModelSpace - point;

  // "Random" number in the range [0, 1], based on treeIndex
  float rnd = mod(treeIndex, 64.) / 64.;
  // Compute distance to camera, but cap it
  float maxDistanceToCamera = 50.;
  float distanceToCamera = min(length(pointToCamera), maxDistanceToCamera);

  float maxDisplacement = 0.01;
  float scaleFactor = 0.01;
  float displacement = min(maxDisplacement, scaleFactor * rnd * distanceToCamera / maxDistanceToCamera);
  return scalar + displacement;
}
#pragma glslify: export(displaceScalar)
