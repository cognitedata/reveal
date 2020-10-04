#pragma glslify: rand2d = require('./rand2d.glsl')

// Displace a point based on distance to camera to avoid z-fighting
vec3 displaceVertex(vec3 point, float treeIndex, 
  vec3 cameraPosition, mat4 inverseModelMatrix) {
  
  vec3 cameraPositionModelSpace = (inverseModelMatrix * vec4(cameraPosition, 1.0)).xyz;
  vec3 pointToCamera = cameraPositionModelSpace - point;
  
  // "Random" number in the range [0, 1], based on treeIndex
  float rnd = rand2d(vec2(treeIndex, treeIndex)); // mod(treeIndex, 256.) / 256.;
  
  // Compute distance to camera, but cap it
  float maxDistanceToCamera = 50.;
  float distanceToCamera = min(length(pointToCamera), maxDistanceToCamera);
  
  float maxDisplacement = 2.;
  float scaleFactor = 2.;
  float displacement = min(maxDisplacement,  scaleFactor * rnd * distanceToCamera / maxDistanceToCamera);
  return point + vec3(1,1,1) /*normalize(pointToCamera) */* displacement;
}

#pragma glslify: export(displaceVertex)
