uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 renderSize;
uniform float renderDownScale;
uniform vec2 pixelSizeRange;
uniform float radius;

in vec3 position;
in vec4 digits;
in vec3 clusterMeta;

out vec4 vDigits;
out vec3 vClusterMeta;

void main() {
  vDigits = digits;
  vClusterMeta = clusterMeta;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  float pointSize = renderSize.y * projectionMatrix[1][1] * radius / gl_Position.w;
  float hoverScale = mix(1.0, 1.08, clusterMeta.z);
  gl_PointSize = clamp(pointSize, pixelSizeRange.x * renderDownScale, pixelSizeRange.y * renderDownScale) * hoverScale;
}
