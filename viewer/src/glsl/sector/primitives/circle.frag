#pragma glslify: updateFragmentColor = require('../../base/updateFragmentColor.glsl')
#pragma glslify: determineVisibility = require('../../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../../base/determineColor.glsl');
#pragma glslify: isSliced = require('../../base/isSliced.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)

varying float v_treeIndex;
varying vec2 v_xy;
varying vec3 v_color;
varying vec3 v_normal;

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform sampler2D matCapTexture;

uniform vec2 dataTextureSize;

uniform int renderMode;

varying vec3 vViewPosition;

void main() {
    if (!determineVisibility(colorDataTexture, dataTextureSize, v_treeIndex, renderMode)) {
        discard;
    }

    if (isSliced(vViewPosition)) {
        discard;
    }

    vec4 color = determineColor(v_color, colorDataTexture, dataTextureSize, v_treeIndex);
    float dist = dot(v_xy, v_xy);
    vec3 normal = normalize( v_normal );
    if (dist > 0.25)
      discard;

    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture);
}
