uniform mat4 inverseProjectionMatrix;
uniform mat4 cadCameraMatrixWorld;
uniform mat4 cadShadowMatrix;
uniform highp sampler2DShadow tCadShadowMap;
uniform vec4 cadShadowPlane;
uniform float cadShadowTexelWorld;
uniform float cadShadowDepthRange;
uniform float cadShadowStrength;
uniform float cadShadowEnabled;

const float CAD_SHADOW_EMPTY_DEPTH = 0.999;
const int CAD_SHADOW_TAPS = 16;
const float CAD_SHADOW_GOLDEN_ANGLE = 2.39996323;
// Shapes the penumbra ramp. Above 1.0 the transition lightens while the fully occluded
// core keeps its weight, which reads softer than lowering the strength for everything.
const float CAD_SHADOW_EDGE_FALLOFF = 1.75;

// Penumbra width and weight are interpolated by how far the blocker sits from the
// receiver, so a shadow is tight and heavy where it meets its caster and turns wide
// and thin as it stretches away.
const float CAD_SHADOW_CONTACT_TEXELS = 1.25;
const float CAD_SHADOW_DISTANT_TEXELS = 8.0;
const float CAD_SHADOW_CONTACT_GAIN = 1.1;
const float CAD_SHADOW_DISTANT_GAIN = 0.75;

// Ladder of receiver to blocker distances used to classify the blocker, as a fraction
// of the light depth range. With a plant sized model this spans roughly 1 m to 20 m.
const int CAD_SHADOW_PROBES = 4;
const float CAD_SHADOW_PROBE_BASE = 0.01;
const float CAD_SHADOW_PROBE_GROWTH = 3.0;

vec3 cadShadowViewPosFromDepth(float depth, vec2 uv) {
    float z = depth * 2.0 - 1.0;
    vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, z, 1.0);
    vec4 viewSpacePosition = inverseProjectionMatrix * clipSpacePosition;
    return viewSpacePosition.xyz / viewSpacePosition.w;
}

vec3 cadShadowWorldFromView(vec3 viewPos) {
    return (cadCameraMatrixWorld * vec4(viewPos, 1.0)).xyz;
}

vec3 cadShadowViewNormal(sampler2D depthTexture, vec2 uv, float depth) {
    vec2 texel = 1.0 / vec2(textureSize(depthTexture, 0));
    vec3 p = cadShadowViewPosFromDepth(depth, uv);
    vec2 uvx = uv + vec2(texel.x, 0.0);
    vec2 uvy = uv + vec2(0.0, texel.y);
    vec3 px = cadShadowViewPosFromDepth(texture(depthTexture, uvx).r, uvx);
    vec3 py = cadShadowViewPosFromDepth(texture(depthTexture, uvy).r, uvy);
    vec3 n = normalize(cross(px - p, py - p));
    // Depth-derived normals can face away from the camera on silhouettes.
    return dot(n, vec3(0.0, 0.0, 1.0)) < 0.0 ? -n : n;
}

// Vogel disk: a golden-angle spiral spreads the taps evenly over a round footprint,
// which avoids the axis-aligned steps a square grid leaves behind.
vec2 cadShadowDiskTap(int index, float rotation) {
    float radius = sqrt((float(index) + 0.5) / float(CAD_SHADOW_TAPS));
    float theta = float(index) * CAD_SHADOW_GOLDEN_ANGLE + rotation;
    return vec2(cos(theta), sin(theta)) * radius;
}

// Interleaved gradient noise. Rotating the kernel per pixel turns whatever texel
// stepping survives filtering into fine noise rather than visible blocks.
float cadShadowKernelRotation() {
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    return 6.2831853 * n;
}

/**
 * Estimates how far in front of the receiver the blocker sits, normalised to [0, 1].
 *
 * A hardware shadow sampler only reports the comparison, never the stored depth, so
 * there is no blocker depth to read. Instead each probe pushes the reference towards
 * the light by a known distance and asks whether anything still blocks it: a probe
 * only fails once the blocker is farther away than that distance. Orthographic light
 * depth is linear, so a probe expressed as a fraction of the depth range is a fixed
 * distance in metres.
 *
 * The result must be conditional on being blocked at all, hence the division by
 * coverage. A partially covered penumbra blocks few probes for the same reason a
 * contact shadow does, and reading that as a near blocker gives the whole penumbra the
 * tight, heavy contact treatment, which draws a dark rim around every shadow.
 */
float cadShadowBlockerDistance(vec2 shadowUv, float compareDepth, vec2 searchRadius, float rotation) {
    float blocked = 0.0;
    float distant = 0.0;
    float probe = CAD_SHADOW_PROBE_BASE;

    for (int i = 0; i < CAD_SHADOW_PROBES; i++) {
        // The search has to span the widest penumbra, otherwise a receiver just outside
        // a distant shadow never learns about the blocker and the soft edge gets cut off.
        vec2 tap = shadowUv + cadShadowDiskTap(i, rotation) * searchRadius;
        blocked += 1.0 - texture(tCadShadowMap, vec3(tap, compareDepth));
        distant += 1.0 - texture(tCadShadowMap, vec3(tap, compareDepth - probe));
        probe *= CAD_SHADOW_PROBE_GROWTH;
    }

    return blocked > 1.0e-3 ? clamp(distant / blocked, 0.0, 1.0) : 0.0;
}

// Percentage-closer soft shadows. The kernel is measured in shadow-map texels and sized
// by blocker distance, so the penumbra is a property of the light and of the geometry,
// never of the screen: orbiting the camera cannot change it.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal) {
    // Normal offset bias: move the lookup off the surface instead of biasing depth only.
    // Sized for the contact footprint rather than the widest one, because the wide
    // kernel only comes into play deep inside a shadow, where acne cannot be seen.
    vec3 offsetPos = worldPos + worldNormal * (cadShadowTexelWorld * (CAD_SHADOW_CONTACT_TEXELS + 1.0));

    vec4 lightClip = cadShadowMatrix * vec4(offsetPos, 1.0);
    if (lightClip.w <= 0.0) {
        return 0.0;
    }

    vec3 lightNdc = lightClip.xyz / lightClip.w;
    vec2 shadowUv = lightNdc.xy * 0.5 + 0.5;
    if (any(lessThan(shadowUv, vec2(0.0))) || any(greaterThan(shadowUv, vec2(1.0)))) {
        return 0.0;
    }

    float referenceDepth = lightNdc.z * 0.5 + 0.5;
    if (referenceDepth <= 0.0 || referenceDepth >= 1.0) {
        return 0.0;
    }

    // Reconstructing the receiver from the camera depth buffer has an error that does not
    // shrink with shadow map resolution, hence the floor on top of the texel sized term.
    float depthBias = max((cadShadowTexelWorld * 2.5) / cadShadowDepthRange, 2.0e-4);
    float compareDepth = referenceDepth - depthBias;
    vec2 texel = 1.0 / vec2(textureSize(tCadShadowMap, 0));
    float rotation = cadShadowKernelRotation();

    float blockerDistance = cadShadowBlockerDistance(
        shadowUv,
        compareDepth,
        texel * CAD_SHADOW_DISTANT_TEXELS,
        rotation
    );
    vec2 penumbra = texel * mix(CAD_SHADOW_CONTACT_TEXELS, CAD_SHADOW_DISTANT_TEXELS, blockerDistance);

    float visibility = 0.0;
    for (int i = 0; i < CAD_SHADOW_TAPS; i++) {
        vec2 tap = shadowUv + cadShadowDiskTap(i, rotation) * penumbra;
        visibility += texture(tCadShadowMap, vec3(tap, compareDepth));
    }

    float occlusion = 1.0 - visibility / float(CAD_SHADOW_TAPS);
    float gain = mix(CAD_SHADOW_CONTACT_GAIN, CAD_SHADOW_DISTANT_GAIN, blockerDistance);
    return clamp(occlusion * gain, 0.0, 1.0);
}

bool cadShadowGroundHit(vec2 uv, out vec3 worldPos) {
    vec4 clip = vec4(uv * 2.0 - 1.0, -1.0, 1.0);
    vec4 view = inverseProjectionMatrix * clip;
    vec3 viewDir = normalize(view.xyz / view.w);

    vec3 worldOrigin = cadCameraMatrixWorld[3].xyz;
    vec3 worldDir = normalize(mat3(cadCameraMatrixWorld) * viewDir);

    float denom = dot(worldDir, cadShadowPlane.xyz);
    if (abs(denom) < 1e-4) {
        return false;
    }

    float t = -(dot(worldOrigin, cadShadowPlane.xyz) + cadShadowPlane.w) / denom;
    if (t < 0.0) {
        return false;
    }

    worldPos = worldOrigin + worldDir * t;
    return true;
}

// Returns the lit factor in [1 - strength, 1].
float cadShadowLit(sampler2D depthTexture, vec2 uv) {
    if (cadShadowEnabled < 0.5) {
        return 1.0;
    }

    float depth = texture(depthTexture, uv).r;
    vec3 worldPos;
    vec3 worldNormal;

    if (depth < CAD_SHADOW_EMPTY_DEPTH) {
        vec3 viewPos = cadShadowViewPosFromDepth(depth, uv);
        worldPos = cadShadowWorldFromView(viewPos);
        worldNormal = normalize(mat3(cadCameraMatrixWorld) * cadShadowViewNormal(depthTexture, uv, depth));
    } else if (cadShadowGroundHit(uv, worldPos)) {
        worldNormal = cadShadowPlane.xyz;
    } else {
        return 1.0;
    }

    float occlusion = pow(cadShadowOcclusion(worldPos, worldNormal), CAD_SHADOW_EDGE_FALLOFF);
    return 1.0 - occlusion * cadShadowStrength;
}
