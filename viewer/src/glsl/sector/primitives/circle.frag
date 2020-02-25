#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

varying float v_treeIndex;
varying vec2 v_xy;
varying vec3 v_color;
varying vec3 v_normal;

uniform sampler2D colorDataTexture;

uniform int renderMode;

void main() {
    vec3 color = determineColor(v_color, colorDataTexture, v_treeIndex);
    float dist = dot(v_xy, v_xy);
    vec3 normal = normalize( v_normal );
    if (dist > 0.25)
      discard;

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z);
}
