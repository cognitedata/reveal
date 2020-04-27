attribute vec3 color;
attribute float treeIndex; 

varying vec3 v_color;
varying float v_treeIndex;
varying vec3 v_viewPosition;

void main() {
    v_color = color;
    v_treeIndex = treeIndex;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    v_viewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
