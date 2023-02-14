uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 renderSize;
uniform float renderDownScale;
uniform vec2 pixelSizeRange;

in vec3 position;
in float alpha;

out float vertexAlpha;

const float radius = 0.5;

//adopted from https://stackoverflow.com/questions/25780145/gl-pointsize-corresponding-to-world-space-size
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  float pointSize = renderSize.y * projectionMatrix[1][1] * radius / gl_Position.w;
  gl_PointSize = clamp(pointSize, pixelSizeRange.x * renderDownScale, pixelSizeRange.y * renderDownScale);
  vertexAlpha = alpha;
}