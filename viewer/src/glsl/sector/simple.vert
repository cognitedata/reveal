attribute vec3 color;
attribute vec4 matrix0;
attribute vec4 matrix1;
attribute vec4 matrix2;
attribute vec4 matrix3;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

void main() {
    // TODO 20200111 larsmoa: Implement treeIndex for quads.
    v_treeIndex = 255.0*255.0*255.0;

    v_color = color;
    v_normal = normalMatrix * normal;
    mat4 instanceMatrix = mat4(matrix0, matrix1, matrix2, matrix3);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}