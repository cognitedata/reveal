precision highp float;

uniform vec3 receiverColor;
uniform float cadShadowApply;

#ifdef USE_MAP
uniform sampler2D tReceiver;
#endif

in vec2 vUv;
in vec3 vWorldPosition;
in vec3 vWorldNormal;

out vec4 fragColor;

#include cadShadow.glsl;

void main() {
    vec3 color = receiverColor;
#ifdef USE_MAP
    color *= texture(tReceiver, vUv).rgb;
#endif

    float occlusion = 0.0;
    if (cadShadowApply > 0.5) {
        occlusion = cadShadowShapeEdge(cadShadowOcclusion(vWorldPosition, normalize(vWorldNormal)));
    }
    fragColor = vec4(color * (1.0 - occlusion * cadShadowStrength), 1.0);
}
