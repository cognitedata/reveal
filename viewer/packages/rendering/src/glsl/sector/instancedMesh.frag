#pragma glslify: derivateNormal = require('../math/derivateNormal.glsl')
#pragma glslify: updateFragmentColor = require('../base/updateFragmentColor.glsl')
#pragma glslify: NodeAppearance = require('../base/nodeAppearance.glsl')
#pragma glslify: determineNodeAppearance = require('../base/determineNodeAppearance.glsl');
#pragma glslify: determineVisibility = require('../base/determineVisibility.glsl');
#pragma glslify: determineColor = require('../base/determineColor.glsl');
#pragma glslify: isClipped = require('../base/isClipped.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: GeometryType = require('../base/geometryTypes.glsl');

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform int renderMode;

in float v_treeIndex;
in vec3 v_color;
in vec3 v_viewPosition;
#if NUM_CLIPPING_PLANES > 0
  flat in vec4 v_clippingPlanes[NUM_CLIPPING_PLANES];
#endif

void main() {
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);
    if (!determineVisibility(appearance, renderMode)) {
        discard;
    }

    #if NUM_CLIPPING_PLANES > 0
      if (isClipped(v_viewPosition, v_clippingPlanes)) {
        discard;
      }
    #endif

    vec4 color = determineColor(v_color, appearance);
    vec3 normal = derivateNormal(v_viewPosition);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.InstancedMesh);
}
