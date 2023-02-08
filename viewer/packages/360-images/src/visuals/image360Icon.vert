uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 renderSize;
uniform float renderDownScale;

in vec3 position;
in float alpha;

out float vertexAlpha;

const float radius = 0.5;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec2 centre = (0.5 * gl_Position.xy/gl_Position.w + 0.5) * renderSize;
  float pointSize = renderSize.y * projectionMatrix[1][1] * radius / gl_Position.w;
  gl_PointSize = clamp(renderSize.y * projectionMatrix[1][1] * radius / gl_Position.w, 16.0 * renderDownScale, 64.0 * renderDownScale);
  vertexAlpha = alpha;
}