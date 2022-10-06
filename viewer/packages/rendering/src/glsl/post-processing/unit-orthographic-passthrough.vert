uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec2 uv;

out float near;
out float far;
out vec2 vUv;

const mat4 unitOrthographicProjection = mat4(1., 0., 0., 0., 0., 1., 0., 0., 0., 0., -1., 0., 0., 0., 0., 1.);

void main() {
    vUv = uv;
    near = projectionMatrix[3][2] / (projectionMatrix[2][2] - 1.0);
    far = projectionMatrix[3][2] / (projectionMatrix[2][2] + 1.0);
    gl_Position = unitOrthographicProjection * modelMatrix * vec4(position, 1.0);
}
