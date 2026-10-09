uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 cadCameraMatrixWorld;
uniform mat3 tReceiverTransform;

in vec3 position;
in vec3 normal;
in vec2 uv;

out vec2 vUv;
out vec3 vWorldPosition;
out vec3 vWorldNormal;

void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vWorldPosition = (cadCameraMatrixWorld * viewPosition).xyz;
    vWorldNormal = normalize(mat3(cadCameraMatrixWorld) * normalMatrix * normal);
    vUv = (tReceiverTransform * vec3(uv, 1.0)).xy;
    gl_Position = projectionMatrix * viewPosition;
}
