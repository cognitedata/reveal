precision highp float;
precision highp int;

uniform vec3 receiverColor;

#ifdef USE_MAP
uniform sampler2D tReceiver;
#endif

in vec2 vUv;
in vec3 vWorldPosition;
in vec3 vWorldNormal;

out vec4 fragColor;

// Each effect is included only while its define is set. CAD shadows also read the
// shadow map of this frame, so the included code still checks cadShadowApply.
#if defined(CAD_SHADOW)
uniform float cadShadowApply;
#include cadShadow.glsl;
#endif
#if defined(USE_MAP) && defined(HEX_TILING_TEXTURE_VARIATION)
#include hexTiling.glsl;
#endif

vec3 customObjectBaseColor() {
    vec3 color = receiverColor;
#if defined(USE_MAP) && defined(HEX_TILING_TEXTURE_VARIATION)
    color *= hexTileAlbedo(tReceiver, vUv);
#elif defined(USE_MAP)
    color *= texture(tReceiver, vUv).rgb;
#endif
    return color;
}

void main() {
    vec3 color = customObjectBaseColor();
#if defined(CAD_SHADOW)
    if (cadShadowApply > 0.5) {
        float occlusion = cadShadowShapeEdge(cadShadowOcclusion(vWorldPosition, normalize(vWorldNormal), 1.0));
        color *= 1.0 - occlusion * cadShadowStrength;
    }
#endif
    fragColor = vec4(color, 1.0);
}
