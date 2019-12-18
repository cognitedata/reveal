attribute vec3 color;

varying vec3 v_color;
varying vec3 v_viewPosition;

void main() {
    v_color = color;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
