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
const float CAD_SHADOW_BLOCKER_EPSILON = 1.0e-3;
const float CAD_SHADOW_MIN_DEPTH_BIAS = 2.0e-4;
const float CAD_SHADOW_MIN_TERMINATOR_FADE = 1.0e-4;

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

// Screen-space normal facing the camera. Picks the neighbor with the smaller depth
// jump on each axis so a horizon or silhouette pixel does not tilt the normal.
vec3 cadShadowViewNormal(sampler2D depthTexture, vec2 uv, float depth, vec3 viewPos) {
    ivec2 size = textureSize(depthTexture, 0);
    ivec2 coord = ivec2(uv * vec2(size));
    ivec2 maxCoord = size - ivec2(1);
    float depthRight = texelFetch(depthTexture, clamp(coord + ivec2(1, 0), ivec2(0), maxCoord), 0).r;
    float depthLeft = texelFetch(depthTexture, clamp(coord + ivec2(-1, 0), ivec2(0), maxCoord), 0).r;
    float depthUp = texelFetch(depthTexture, clamp(coord + ivec2(0, 1), ivec2(0), maxCoord), 0).r;
    float depthDown = texelFetch(depthTexture, clamp(coord + ivec2(0, -1), ivec2(0), maxCoord), 0).r;
    vec2 texel = 1.0 / vec2(size);

    bool useRight = abs(depthRight - depth) < abs(depthLeft - depth);
    bool useUp = abs(depthUp - depth) < abs(depthDown - depth);
    vec3 horizontal = cadShadowViewPosFromDepth(useRight ? depthRight : depthLeft, uv + vec2(useRight ? texel.x : -texel.x, 0.0)) - viewPos;
    vec3 vertical = cadShadowViewPosFromDepth(useUp ? depthUp : depthDown, uv + vec2(0.0, useUp ? texel.y : -texel.y)) - viewPos;
    vec3 first = (useRight == useUp) ? horizontal : vertical;
    vec3 second = (useRight == useUp) ? vertical : horizontal;
    vec3 n = normalize(cross(first, second));
    return n * (1.0 - 2.0 * step(0.0, dot(n, viewPos)));
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

    return clamp(distant / max(blocked, CAD_SHADOW_BLOCKER_EPSILON), 0.0, 1.0) * step(CAD_SHADOW_BLOCKER_EPSILON, blocked);
}

// Sharpens the soft edge while keeping 0, 0.5 and 1 fixed.
float cadShadowShapeEdge(float occlusion) {
    return occlusion * occlusion * (3.0 - 2.0 * occlusion);
}

float cadShadowDepthBias() {
    return max((cadShadowTexelWorld * 2.5) / cadShadowDepthRange, CAD_SHADOW_MIN_DEPTH_BIAS);
}

// Occlusion of a world-space point, 0 when lit and 1 when fully blocked.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal, float depthBias) {
    vec3 offsetPos = worldPos + worldNormal * (cadShadowTexelWorld * (CAD_SHADOW_CONTACT_TEXELS + 1.0));
    vec3 lightNdc = (cadShadowMatrix * vec4(offsetPos, 1.0)).xyz;
    float receiverDepth = lightNdc.z * 0.5 + 0.5;

    // Coherent early-out: skips every tap for regions outside the light frustum.
    if (any(greaterThan(abs(lightNdc.xy), vec2(1.0))) || lightNdc.z < -1.0) {
        return 0.0;
    }

    vec2 shadowUv = lightNdc.xy * 0.5 + 0.5;
    float compareDepth = receiverDepth - depthBias;
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
    // Background never receives a shadow, so skip the neighbor fetches and the normal.
    if (depth >= CAD_SHADOW_EMPTY_DEPTH) {
        return 1.0;
    }

    vec3 viewPos = cadShadowViewPosFromDepth(depth, uv);
    vec3 viewNormal = cadShadowViewNormal(depthTexture, uv, depth, viewPos);
    vec3 worldNormal = mat3(cadCameraMatrixWorld) * viewNormal;
    // A grazing view ray turns a small depth error into a long slide along the surface.
    float cosView = max(abs(dot(viewNormal, normalize(viewPos))), 0.05);
    float depthBias = cadShadowDepthBias() / cosView;

    float lightFacing = dot(worldNormal, cadShadowLightDirection);
    float facing = cadShadowTerminatorFade > 0.0
        ? smoothstep(0.0, max(cadShadowTerminatorFade, CAD_SHADOW_MIN_TERMINATOR_FADE), lightFacing)
        : 1.0;

    // Faces turned away from the light stay fully lit.
    if (facing <= 0.0) {
        return 1.0;
    }

    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(cadShadowWorldFromView(viewPos), worldNormal, depthBias));
    return 1.0 - occlusion * facing * cadShadowStrength;
}
