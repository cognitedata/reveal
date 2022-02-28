#pragma glslify: rand2d = require('../math/rand2d.glsl')
#pragma glslify: isClipped = require('../base/isClipped.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: NodeAppearance = require('../base/nodeAppearance.glsl')

in mediump vec3 v_color;
in lowp float v_coverageFactor;
in lowp float v_visible;
in lowp vec2 v_seed;
in vec3 v_viewPosition;

out vec4 outputColor;
    
const NodeAppearance dummyNodeAppearance = NodeAppearance(vec4(0.0), false, false, false);

void main() {
    if(v_visible != 1.0 || isClipped(dummyNodeAppearance, v_viewPosition)){
      discard;
    }

    float v = rand2d(gl_FragCoord.xy + v_seed);
    if (v >= v_coverageFactor) {
        discard;
    }

    outputColor = vec4(v_color, 1.0);
}
