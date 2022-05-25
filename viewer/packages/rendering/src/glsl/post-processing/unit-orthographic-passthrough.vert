uniform mat4 modelMatrix;

in vec3 position;
in vec2 uv;

out vec2 vUv;

const mat4 unitOrthographicProjection = mat4(1., 0., 0., 0., 0., 1., 0., 0., 0., 0., -1., 0., 0., 0., 0., 1.);

void main() {
    vUv = uv;
    gl_Position = unitOrthographicProjection * modelMatrix * vec4(position, 1.0);
}
