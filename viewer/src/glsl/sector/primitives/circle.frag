#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

varying float v_treeIndex;
varying vec2 v_xy;
varying vec3 v_color;
varying vec3 v_normal;

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;

uniform int renderMode;

void main() {
    if (!determineVisibility(overrideVisibilityPerTreeIndex, v_treeIndex)) {
        discard;
    }

    vec3 color = determineColor(v_color, colorDataTexture, v_treeIndex);
    float dist = dot(v_xy, v_xy);
    vec3 normal = normalize( v_normal );
    if (dist > 0.25)
      discard;

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z);
}
