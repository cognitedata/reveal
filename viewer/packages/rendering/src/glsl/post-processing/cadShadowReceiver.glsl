#include cadShadow.glsl;

varying vec3 vCadReceiverWorldPosition;

float cadReceiverLit() {
    vec3 worldNormal = normalize(cross(dFdx(vCadReceiverWorldPosition), dFdy(vCadReceiverWorldPosition)));
    // Offset towards the light on either side of a double-sided receiver.
    if (dot(worldNormal, cadShadowLightDirection) < 0.0) worldNormal = -worldNormal;

    if (!receiveShadow || cadShadowEnabled < 0.5) return 1.0;

    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(vCadReceiverWorldPosition, worldNormal));
    return 1.0 - occlusion * cadShadowStrength;
}
