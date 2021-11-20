#pragma glslify: rand2d = require('../math/rand2d.glsl')
#pragma glslify: isClipped = require('../base/isClipped.glsl', NUM_CLIPPING_PLANES=NUM_CLIPPING_PLANES, UNION_CLIPPING_PLANES=UNION_CLIPPING_PLANES)
#pragma glslify: NodeAppearance = require('../base/nodeAppearance.glsl')

varying mediump vec3 v_color;
varying lowp float v_coverageFactor;
varying lowp float v_visible;
varying lowp vec2 v_seed;


varying vec3 v_viewPosition;
    
const NodeAppearance noIgnoreClippingAppearance = NodeAppearance(vec4(0.0), false, false, false, false);

void main() {
    if(v_visible != 1.0 || isClipped(noIgnoreClippingAppearance, v_viewPosition)){
      discard;
    }

    float v = rand2d(gl_FragCoord.xy + v_seed);
    if (v >= v_coverageFactor) {
        discard;
    }

    gl_FragColor = vec4(v_color, 1.0);
}
