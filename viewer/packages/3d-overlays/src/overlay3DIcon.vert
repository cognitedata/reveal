uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 renderSize;
uniform float renderDownScale;
uniform vec2 pixelSizeRange;
uniform float radius;

in vec3 position;
in vec3 color;
in float sizeScale;
in float isCluster;
in float clusterSize;
in float isHovered;

out vec3 vColor;
out float vIsCluster;
out float vClusterSize;
out float vIsHovered;

//adopted from https://stackoverflow.com/questions/25780145/gl-pointsize-corresponding-to-world-space-size
void main() {
  vColor = color;
  vIsCluster = isCluster;
  vClusterSize = clusterSize;
  vIsHovered = isHovered;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  float scaledRadius = radius * sizeScale;
  float pointSize = renderSize.y * projectionMatrix[1][1] * scaledRadius / gl_Position.w;

  // step(0.5, isCluster) returns 0.0 for non-clusters, 1.0 for clusters
  // Result: minSize * 1.0 for non-clusters, minSize * 3.0 for clusters
  float clusterMultiplier = 1.0 + step(0.5, isCluster) * 2.0;
  float minSize = pixelSizeRange.x * renderDownScale * clusterMultiplier;

  gl_PointSize = clamp(pointSize, minSize, pixelSizeRange.y * renderDownScale);
}
