uniform mat4 inverseProjectionMatrix;
uniform mat4 cadCameraMatrixWorld;
uniform mat4 cadShadowMatrix;
uniform highp sampler2DShadow tCadShadowMap;
uniform vec3 cadShadowLightDirection;
uniform float cadShadowTexelWorld;
uniform float cadShadowDepthRange;
uniform float cadShadowStrength;
uniform float cadShadowTerminatorFade;

const float CAD_SHADOW_EMPTY_DEPTH = 1.0;
const int CAD_SHADOW_TAPS = 16;
const float CAD_SHADOW_CONTACT_TEXELS = 1.25;
const float CAD_SHADOW_DISTANT_TEXELS = 8.0;
const int CAD_SHADOW_PROBES = 4;
const float CAD_SHADOW_PROBE_BASE = 0.01;
const float CAD_SHADOW_PROBE_GROWTH = 3.0;

// Golden-angle spiral: radius sqrt((i + 0.5) / TAPS), angle i * 2.39996323.
const vec2 CAD_SHADOW_DISK[CAD_SHADOW_TAPS] = vec2[](
    vec2(0.1767767, 0.0000000),
    vec2(-0.2257722, 0.2068258),
    vec2(0.0345581, -0.3937712),
    vec2(0.2845712, 0.3711728),
    vec2(-0.5222232, -0.0923739),
    vec2(0.4946954, -0.3146847),
    vec2(-0.1654659, 0.6155250),
    vec2(-0.3155615, -0.6075944),
    vec2(0.6846422, 0.2500302),
    vec2(-0.7122561, 0.2940090),
    vec2(0.3433545, -0.7337286),
    vec2(0.2537302, 0.8089320),
    vec2(-0.7647459, -0.4431859),
    vec2(0.8971340, -0.1972324),
    vec2(-0.5475069, 0.7787722),
    vec2(-0.1264868, -0.9760897)
);

// Reconstructs the view-space position of a screen pixel from its depth.
vec3 cadShadowViewPosFromDepth(float depth, vec2 uv) {
    float z = depth * 2.0 - 1.0;
    vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, z, 1.0);
    vec4 viewSpacePosition = inverseProjectionMatrix * clipSpacePosition;
    return viewSpacePosition.xyz / viewSpacePosition.w;
}

// Transforms a view-space position into world space.
vec3 cadShadowWorldFromView(vec3 viewPos) {
    return (cadCameraMatrixWorld * vec4(viewPos, 1.0)).xyz;
}

// Screen-space normal facing the camera; derivatives require uniform control flow.
vec3 cadShadowViewNormal(vec3 viewPos) {
    vec3 n = normalize(cross(dFdx(viewPos), dFdy(viewPos)));
    return n * (2.0 * step(0.0, n.z) - 1.0);
}

// Per-pixel hashed rotation of the sample disk.
mat2 cadShadowKernelRotation() {
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float theta = 6.2831853 * n;
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, s, -s, c);
}

// Hardware PCF lookup: 1 when lit or outside the map, 0 when blocked.
float cadShadowVisibility(vec2 uv, float compareDepth) {
    vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    float visibility = textureLod(tCadShadowMap, vec3(uv, min(compareDepth, 1.0)), 0.0);
    return mix(1.0, visibility, inside.x * inside.y);
}

// Rough 0..1 estimate of how far the blocker is from the receiver.
float cadShadowBlockerDistance(vec2 shadowUv, float compareDepth, vec2 searchRadius, mat2 rotation) {
    float blocked = 0.0;
    float distant = 0.0;
    float probe = CAD_SHADOW_PROBE_BASE;

    for (int i = 0; i < CAD_SHADOW_PROBES; i++) {
        vec2 tap = shadowUv + rotation * CAD_SHADOW_DISK[i] * searchRadius;
        blocked += 1.0 - cadShadowVisibility(tap, compareDepth);
        distant += 1.0 - cadShadowVisibility(tap, compareDepth - probe);
        probe *= CAD_SHADOW_PROBE_GROWTH;
    }

    return clamp(distant / max(blocked, 1.0e-3), 0.0, 1.0) * step(1.0e-3, blocked);
}

// Sharpens the soft edge while keeping 0, 0.5 and 1 fixed.
float cadShadowShapeEdge(float occlusion) {
    return occlusion * occlusion * (3.0 - 2.0 * occlusion);
}

// Occlusion of a world-space point, 0 when lit and 1 when fully blocked.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal) {
    vec3 offsetPos = worldPos + worldNormal * (cadShadowTexelWorld * (CAD_SHADOW_CONTACT_TEXELS + 1.0));
    vec3 lightNdc = (cadShadowMatrix * vec4(offsetPos, 1.0)).xyz;

    // Coherent early-out: skips every tap for regions outside the light frustum.
    if (any(greaterThan(abs(lightNdc.xy), vec2(1.0))) || lightNdc.z < -1.0) {
        return 0.0;
    }

    vec2 shadowUv = lightNdc.xy * 0.5 + 0.5;
    float depthBias = max((cadShadowTexelWorld * 2.5) / cadShadowDepthRange, 2.0e-4);
    float compareDepth = lightNdc.z * 0.5 + 0.5 - depthBias;
    vec2 texel = 1.0 / vec2(textureSize(tCadShadowMap, 0));
    mat2 rotation = cadShadowKernelRotation();

    float blockerDistance = cadShadowBlockerDistance(
        shadowUv,
        compareDepth,
        texel * CAD_SHADOW_DISTANT_TEXELS,
        rotation
    );
    vec2 penumbra = texel * mix(CAD_SHADOW_CONTACT_TEXELS, CAD_SHADOW_DISTANT_TEXELS, blockerDistance);

    float visibility = 0.0;
    for (int i = 0; i < CAD_SHADOW_TAPS; i++) {
        visibility += cadShadowVisibility(shadowUv + rotation * CAD_SHADOW_DISK[i] * penumbra, compareDepth);
    }

    return clamp(1.0 - visibility / float(CAD_SHADOW_TAPS), 0.0, 1.0);
}

// Lit factor of a CAD pixel, from 1 down to 1 - cadShadowStrength.
float cadShadowLit(sampler2D depthTexture, vec2 uv) {
    float depth = texture(depthTexture, uv).r;
    vec3 viewPos = cadShadowViewPosFromDepth(depth, uv);
    vec3 worldNormal = mat3(cadCameraMatrixWorld) * cadShadowViewNormal(viewPos);

    float lightFacing = dot(worldNormal, cadShadowLightDirection);
    float facing = cadShadowTerminatorFade > 0.0
        ? smoothstep(0.0, max(cadShadowTerminatorFade, 1.0e-4), lightFacing)
        : 1.0;

    // Coherent early-out for background and faces turned away from the light.
    if (depth >= CAD_SHADOW_EMPTY_DEPTH || facing <= 0.0) {
        return 1.0;
    }

    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(cadShadowWorldFromView(viewPos), worldNormal));
    return 1.0 - occlusion * facing * cadShadowStrength;
}
