#pragma glslify: derivateNormal = require('../math/derivateNormal.glsl')
#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
#pragma glslify: determineColor = require('../base/determineColor.glsl');

uniform sampler2D colorDataTexture;

varying float v_treeIndex;
varying vec3 v_color;
varying vec3 v_viewPosition;

uniform int renderMode;

void main()
{
    vec3 color = determineColor(v_color, colorDataTexture, v_treeIndex);
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z);
}
