#pragma glslify: derivateNormal = require('../math/derivateNormal.glsl')
#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
#pragma glslify: determineColor = require('../base/determineColor.glsl');
#pragma glslify: determineVisibility = require('../base/determineVisibility.glsl');

uniform sampler2D colorDataTexture;
uniform sampler2D overrideVisibilityPerTreeIndex;
uniform sampler2D matCapTexture;

uniform vec2 dataTextureSize;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_viewPosition;

uniform int renderMode;

void main()
{
    if (!determineVisibility(overrideVisibilityPerTreeIndex, dataTextureSize, v_treeIndex)) {
        discard;
    }

    vec3 color = determineColor(v_color, colorDataTexture, dataTextureSize, v_treeIndex);
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture);
}
