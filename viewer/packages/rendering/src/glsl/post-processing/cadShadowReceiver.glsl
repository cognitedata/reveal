#include cadShadow.glsl;

varying vec3 vCadReceiverWorldPosition;

float cadReceiverLit() {
    if (!receiveShadow) return 1.0;

    vec3 worldNormal = normalize(cross(dFdx(vCadReceiverWorldPosition), dFdy(vCadReceiverWorldPosition)));
    worldNormal *= 2.0 * step(0.0, dot(worldNormal, cadShadowLightDirection)) - 1.0;

    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(vCadReceiverWorldPosition, worldNormal));
    return 1.0 - occlusion * cadShadowStrength;
}
