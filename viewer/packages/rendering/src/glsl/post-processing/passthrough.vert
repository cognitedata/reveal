#define texture2D texture

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
  vUv = uv;
  mat4 modelViewMatrix = modelMatrix * viewMatrix;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
