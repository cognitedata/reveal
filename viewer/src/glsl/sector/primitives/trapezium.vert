attribute float a_treeIndex;
attribute vec3 a_color;
attribute vec3 a_vertex1;
attribute vec3 a_vertex2;
attribute vec3 a_vertex3;
attribute vec3 a_vertex4;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_normal;

#if NUM_CLIPPING_PLANES > 0
    varying vec3 vViewPosition;
#endif

void main() {
    vec3 transformed;
    // reduce the avarage branchings
    if (position.x < 1.5) {
      transformed = position.x == 0.0 ? a_vertex1 : a_vertex2;
    } else {
      transformed = position.x == 2.0 ? a_vertex3 : a_vertex4;
    }

    vec3 objectNormal = cross(a_vertex1 - a_vertex2, a_vertex1 - a_vertex3);

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * objectNormal;

    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
#if NUM_CLIPPING_PLANES > 0
    vViewPosition = mvPosition.xyz;
#endif
    gl_Position = projectionMatrix * mvPosition;
}
