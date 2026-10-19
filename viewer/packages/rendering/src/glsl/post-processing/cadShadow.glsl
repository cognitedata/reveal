uniform mat4 inverseProjectionMatrix;
uniform mat4 cadCameraMatrixWorld;
uniform mat4 cadShadowMatrix;
uniform highp sampler2D tCadShadowMap;
uniform vec3 cadShadowLightDirection;
uniform float cadShadowTexelWorld;
uniform float cadShadowStableTexelWorld;
uniform float cadShadowDepthRange;
uniform float cadShadowStrength;
uniform float cadShadowTerminatorFade;

const float CAD_SHADOW_EMPTY_DEPTH = 1.0;
const int CAD_SHADOW_TAPS = 16;
const float CAD_SHADOW_CONTACT_TEXELS = 1.25;
const float CAD_SHADOW_CONTACT_STABLE_FRACTION = 0.12;
const float CAD_SHADOW_LIGHT_SPREAD = 0.018;
const float CAD_SHADOW_MAX_PENUMBRA_WORLD = 0.2;
const float CAD_SHADOW_MAX_PENUMBRA_TEXELS = 28.0;
const float CAD_SHADOW_BORDER_FADE = 0.08;
const int CAD_SHADOW_BLOCKER_PROBES = 8;

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
// reliable is 0 at a grazing view, where the normal tilts with the camera.
vec3 cadShadowViewNormal(sampler2D depthTexture, vec2 uv, float depth, vec3 viewPos, out float reliable) {
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
    float horizontalLength = length(horizontal);
    float verticalLength = length(vertical);
    float longest = max(horizontalLength, verticalLength);
    reliable = smoothstep(0.55, 0.92, min(horizontalLength, verticalLength) / max(longest, 1.0e-5));
    vec3 n = normalize(cross(first, second));
    return n * (1.0 - 2.0 * step(0.0, dot(n, viewPos)));
}

// Hashed rotation of the sample disk, seeded by the world position.
mat2 cadShadowKernelRotation(vec3 worldPos) {
    vec2 seed = floor(worldPos.xz * 1000.0) + floor(worldPos.y * 1000.0) * vec2(0.7548777, 0.5698403);
    float n = fract(52.9829189 * fract(dot(seed, vec2(0.06711056, 0.00583715))));
    float theta = 6.2831853 * n;
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, s, -s, c);
}

// 1 when this texel is not a caster. An empty texel is never a caster.
float cadShadowTexelLit(ivec2 coord, ivec2 maxCoord, vec2 receiverTexelPos, float receiverDepth, vec2 gradPerTexel, float tolerance) {
    coord = clamp(coord, ivec2(0), maxCoord);
    float stored = texelFetch(tCadShadowMap, coord, 0).r;
    if (stored >= CAD_SHADOW_EMPTY_DEPTH) {
        return 1.0;
    }
    float predicted = receiverDepth + dot(gradPerTexel, vec2(coord) + 0.5 - receiverTexelPos);
    return step(predicted - tolerance, stored);
}

// Lit fraction of the 2x2 texels around texelPos, 1 when lit or outside the map.
float cadShadowPlaneVisibility(vec2 texelPos, ivec2 maxCoord, vec2 receiverTexelPos, float receiverDepth, vec2 gradPerTexel, float tolerance) {
    if (any(lessThan(texelPos, vec2(0.0))) || any(greaterThan(texelPos, vec2(maxCoord) + 1.0))) {
        return 1.0;
    }
    vec2 centered = texelPos - 0.5;
    vec2 fraction = fract(centered);
    ivec2 origin = ivec2(floor(centered));
    float litRow0 = mix(
        cadShadowTexelLit(origin, maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance),
        cadShadowTexelLit(origin + ivec2(1, 0), maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance),
        fraction.x
    );
    float litRow1 = mix(
        cadShadowTexelLit(origin + ivec2(0, 1), maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance),
        cadShadowTexelLit(origin + ivec2(1, 1), maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance),
        fraction.x
    );
    return mix(litRow0, litRow1, fraction.y);
}

// Depth gap between the receiver plane and the caster at texelPos, in the
// normalized depth of the map. Negative when lit or outside.
float cadShadowBlockerGap(vec2 texelPos, ivec2 maxCoord, vec2 receiverTexelPos, float receiverDepth, vec2 gradPerTexel, float tolerance) {
    if (any(lessThan(texelPos, vec2(0.0))) || any(greaterThan(texelPos, vec2(maxCoord) + 1.0))) {
        return -1.0;
    }
    ivec2 coord = clamp(ivec2(texelPos), ivec2(0), maxCoord);
    float stored = texelFetch(tCadShadowMap, coord, 0).r;
    if (stored >= CAD_SHADOW_EMPTY_DEPTH) {
        return -1.0;
    }
    float gap = receiverDepth + dot(gradPerTexel, vec2(coord) + 0.5 - receiverTexelPos) - stored;
    return gap > tolerance ? gap : -1.0;
}

// Blocker search. x is the mean separation in world units, or -1 when no caster
// was found. y is the fraction of probes that are blocked.
vec2 cadShadowBlockerSearch(
    vec2 sampleTexelPos,
    ivec2 maxCoord,
    vec2 receiverTexelPos,
    float receiverDepth,
    vec2 gradPerTexel,
    float tolerance,
    float searchTexels,
    mat2 rotation
) {
    float gapSum = 0.0;
    float count = 0.0;
    float gap = cadShadowBlockerGap(sampleTexelPos, maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance);
    if (gap > 0.0) {
        gapSum += gap;
        count += 1.0;
    }
    for (int i = 0; i < CAD_SHADOW_BLOCKER_PROBES; i++) {
        vec2 offset = rotation * CAD_SHADOW_DISK[i * (CAD_SHADOW_TAPS / CAD_SHADOW_BLOCKER_PROBES)];
        gap = cadShadowBlockerGap(sampleTexelPos + offset * searchTexels, maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance);
        if (gap > 0.0) {
            gapSum += gap;
            count += 1.0;
        }
    }
    float probes = float(CAD_SHADOW_BLOCKER_PROBES + 1);
    float separation = count > 0.5 ? (gapSum / count) * cadShadowDepthRange : -1.0;
    return vec2(separation, count / probes);
}

// Sharpens the soft edge while keeping 0, 0.5 and 1 fixed.
float cadShadowShapeEdge(float occlusion) {
    return occlusion * occlusion * (3.0 - 2.0 * occlusion);
}

// Depth change per unit of shadow UV along a flat receiver.
vec2 cadShadowDepthGradient(vec3 N) {
    vec3 T = cross(N, cadShadowLightDirection);
    float tLen2 = dot(T, T);
    if (tLen2 < 1.0e-8) {
        T = cross(N, vec3(0.0, 0.0, 1.0));
        tLen2 = dot(T, T);
    }
    T *= inversesqrt(max(tLen2, 1.0e-12));
    vec3 B = cross(N, T);

    vec3 rowX = vec3(cadShadowMatrix[0].x, cadShadowMatrix[1].x, cadShadowMatrix[2].x);
    vec3 rowY = vec3(cadShadowMatrix[0].y, cadShadowMatrix[1].y, cadShadowMatrix[2].y);
    vec3 rowZ = vec3(cadShadowMatrix[0].z, cadShadowMatrix[1].z, cadShadowMatrix[2].z);
    vec2 duT = 0.5 * vec2(dot(rowX, T), dot(rowY, T));
    vec2 duB = 0.5 * vec2(dot(rowX, B), dot(rowY, B));
    float dzT = 0.5 * dot(rowZ, T);
    float dzB = 0.5 * dot(rowZ, B);
    float det = duT.x * duB.y - duT.y * duB.x;
    float valid = step(1.0e-12, abs(det));
    float invDet = valid * sign(det) / max(abs(det), 1.0e-12);
    return vec2(
        (dzT * duB.y - dzB * duT.y) * invDet,
        (duT.x * dzB - duB.x * dzT) * invDet
    );
}

// Occlusion of a world-space point, 0 when lit and 1 when fully blocked.
// planeTrust, from 0 to 1, limits how far the receiver plane is extrapolated.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal, float planeTrust) {
    vec3 lightNdc = (cadShadowMatrix * vec4(worldPos, 1.0)).xyz;
    if (any(greaterThan(abs(lightNdc.xy), vec2(1.0))) || lightNdc.z < -1.0) {
        return 0.0;
    }

    float border = max(abs(lightNdc.x), abs(lightNdc.y));
    float borderFade = 1.0 - smoothstep(1.0 - CAD_SHADOW_BORDER_FADE, 1.0, border);

    ivec2 size = textureSize(tCadShadowMap, 0);
    ivec2 maxCoord = size - ivec2(1);
    vec2 receiverTexelPos = (lightNdc.xy * 0.5 + 0.5) * vec2(size);
    float receiverDepth = lightNdc.z * 0.5 + 0.5;
    float normalLen2 = dot(worldNormal, worldNormal);
    vec3 N = normalLen2 > 1.0e-8 ? worldNormal * inversesqrt(normalLen2) : vec3(0.0, 1.0, 0.0);
    vec2 gradPerTexel = cadShadowDepthGradient(N) / vec2(size);
    float slope = length(gradPerTexel);
    float texelDepth = max(cadShadowTexelWorld / max(cadShadowDepthRange, 1.0e-6), 1.0e-8);
    float tolerance = slope * 0.9 + texelDepth * 0.15;
    float shiftTexels = clamp(0.45 * tolerance / max(slope, texelDepth * 0.25), 0.0, 0.7);
    vec2 towardCaster = slope > 1.0e-8 ? -gradPerTexel / slope : vec2(0.0);
    vec2 sampleTexelPos = receiverTexelPos + towardCaster * shiftTexels;

    float invTexelWorld = 1.0 / max(cadShadowTexelWorld, 1.0e-8);
    float contactTexels = max(CAD_SHADOW_CONTACT_TEXELS, cadShadowStableTexelWorld * invTexelWorld * CAD_SHADOW_CONTACT_STABLE_FRACTION);
    float maxPenumbraTexels = clamp(CAD_SHADOW_MAX_PENUMBRA_WORLD * invTexelWorld, contactTexels, CAD_SHADOW_MAX_PENUMBRA_TEXELS);
    maxPenumbraTexels = mix(contactTexels, maxPenumbraTexels, clamp(planeTrust, 0.0, 1.0));
    mat2 rotation = cadShadowKernelRotation(worldPos);

    vec2 blocker = cadShadowBlockerSearch(
        sampleTexelPos, maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance, maxPenumbraTexels, rotation
    );
    if (blocker.y >= 1.0) {
        return borderFade;
    }
    float penumbraTexels = contactTexels;
    if (blocker.x > 0.0) {
        penumbraTexels = clamp(blocker.x * CAD_SHADOW_LIGHT_SPREAD * invTexelWorld, contactTexels, maxPenumbraTexels);
    }

    float visibility = 0.0;
    for (int i = 0; i < CAD_SHADOW_TAPS; i++) {
        visibility += cadShadowPlaneVisibility(
            sampleTexelPos + rotation * CAD_SHADOW_DISK[i] * penumbraTexels,
            maxCoord, receiverTexelPos, receiverDepth, gradPerTexel, tolerance
        );
    }
    return clamp(1.0 - visibility / float(CAD_SHADOW_TAPS), 0.0, 1.0) * borderFade;
}

// Lit factor of a CAD pixel, from 1 down to 1 - cadShadowStrength.
float cadShadowLit(sampler2D depthTexture, vec2 uv) {
    float depth = texture(depthTexture, uv).r;
    // Background never receives a shadow, so skip the neighbor fetches and the normal.
    if (depth >= CAD_SHADOW_EMPTY_DEPTH) {
        return 1.0;
    }

    if (cadShadowTerminatorFade < 0.0) {
        return 1.0;
    }

    vec3 viewPos = cadShadowViewPosFromDepth(depth, uv);
    vec3 worldPos = cadShadowWorldFromView(viewPos);
    vec3 lightNdc = (cadShadowMatrix * vec4(worldPos, 1.0)).xyz;
    if (any(greaterThan(abs(lightNdc.xy), vec2(1.0))) || lightNdc.z < -1.0) {
        return 1.0;
    }

    float normalReliable = 0.0;
    vec3 viewNormal = cadShadowViewNormal(depthTexture, uv, depth, viewPos, normalReliable);
    vec3 rawNormal = mat3(cadCameraMatrixWorld) * viewNormal;
    float rawLen2 = dot(rawNormal, rawNormal);
    vec3 surfaceNormal = rawLen2 > 1.0e-8 ? rawNormal * inversesqrt(rawLen2) : vec3(0.0, 1.0, 0.0);
    float upAmount = dot(surfaceNormal, vec3(0.0, 1.0, 0.0));
    float floorWeight = smoothstep(0.4, 0.8, upAmount);
    if (normalReliable < 0.35 && upAmount > 0.15) {
        floorWeight = 1.0;
    }
    vec3 worldNormal = normalize(mix(surfaceNormal, vec3(0.0, 1.0, 0.0), floorWeight));

    float planeTrust = max(floorWeight, normalReliable);
    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(worldPos, worldNormal, planeTrust));
    return 1.0 - occlusion * cadShadowStrength;
}
