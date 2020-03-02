#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../../base/determineColor.glsl');

varying float v_treeIndex;
varying vec3 v_normal;
varying vec3 v_color;

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;

uniform int renderMode;

void main() {
    if (!determineVisibility(overrideVisibilityPerTreeIndex, v_treeIndex)) {
        discard;
    }

    vec3 color = determineColor(v_color, colorDataTexture, v_treeIndex);
    vec3 normal = normalize(v_normal);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z);
}
