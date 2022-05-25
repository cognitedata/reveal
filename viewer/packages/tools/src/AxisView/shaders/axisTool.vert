uniform mat4 modelMatrix;
uniform vec2 scale;
uniform vec2 offset;

in vec3 position;
in vec2 uv;

out vec2 vUv;

const mat4 unitOrthographicProjection = mat4(1., 0., 0., 0., 0., 1., 0., 0., 0., 0., -1., 0., 0., 0., 0., 1.);

void main() {
    vUv = uv;

    vec4 clipSpace = unitOrthographicProjection * modelMatrix * vec4(position, 1.0);

    clipSpace.xy *= scale.xy;

    clipSpace.xy += vec2(-1., -1.) + offset;

    gl_Position = clipSpace;
}
