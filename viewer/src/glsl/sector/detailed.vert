attribute vec3 color;

varying vec3 v_color;
varying vec3 v_normal;

void main() {
    v_color = color;
    v_normal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
