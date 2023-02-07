uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 50.0;
  gl_Position = projectionMatrix * mvPosition;
}