#pragma glslify: rand2d = require('../math/rand2d.glsl')
#pragma glslify: isClipped = require('../base/isClipped.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)

in mediump vec3 v_color;
in lowp float v_coverageFactor;
in lowp float v_visible;
in lowp vec2 v_seed;
in vec3 v_viewPosition;
#if NUM_CLIPPING_PLANES > 0
  flat in vec4 v_clippingPlanes[NUM_CLIPPING_PLANES];
#endif

out vec4 outputColor;

void main() {
    if(v_visible != 1.0){
      discard;
    }
    #if NUM_CLIPPING_PLANES > 0
      if (isClipped(vViewPosition, v_clippingPlanes)) {
        discard;
      }
    #endif

    float v = rand2d(gl_FragCoord.xy + v_seed);
    if (v >= v_coverageFactor) {
        discard;
    }

    outputColor = vec4(v_color, 1.0);
}
