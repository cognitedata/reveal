uniform mat4 inverseProjectionMatrix;
uniform mat4 cadCameraMatrixWorld;
uniform mat4 cadShadowMatrix;
uniform highp sampler2DShadow tCadShadowMap;
uniform vec3 cadShadowLightDirection;
uniform float cadShadowTexelWorld;
uniform float cadShadowDepthRange;
uniform float cadShadowStrength;
uniform float cadShadowEnabled;
// Controls the terminator fade for depth-reconstructed CAD surfaces.
uniform float cadShadowTerminatorFade;

const float CAD_SHADOW_EMPTY_DEPTH = 1.0;
const int CAD_SHADOW_TAPS = 16;
const float CAD_SHADOW_GOLDEN_ANGLE = 2.39996323;

// Distance changes penumbra width, not the intensity of fully occluded regions.
const float CAD_SHADOW_CONTACT_TEXELS = 1.25;
const float CAD_SHADOW_DISTANT_TEXELS = 8.0;

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

// The reconstructed view position varies smoothly across a quad, so screen space
// derivatives give the same geometric normal that sampling neighbouring depths gives,
// without the extra texture fetches and inverse projections. Must be called in uniform
// control flow, otherwise the neighbouring lanes hold undefined values.
vec3 cadShadowViewNormal(vec3 viewPos) {
    vec3 n = normalize(cross(dFdx(viewPos), dFdy(viewPos)));
    // Depth-derived normals can face away from the camera on silhouettes.
    return dot(n, vec3(0.0, 0.0, 1.0)) < 0.0 ? -n : n;
}

// Vogel disk: a golden-angle spiral spreads the taps evenly over a round footprint,
// which avoids the axis-aligned steps a square grid leaves behind.
//
// The rotation arrives as a cosine/sine pair and is applied as a complex multiply, so
// the spiral itself folds to literals at compile time and the whole kernel costs one
// sine and one cosine instead of one pair per tap.
vec2 cadShadowDiskTap(int index, vec2 rotation) {
    float radius = sqrt((float(index) + 0.5) / float(CAD_SHADOW_TAPS));
    float theta = float(index) * CAD_SHADOW_GOLDEN_ANGLE;
    vec2 spiral = vec2(cos(theta), sin(theta)) * radius;

    return vec2(
        spiral.x * rotation.x - spiral.y * rotation.y,
        spiral.x * rotation.y + spiral.y * rotation.x
    );
}

// Interleaved gradient noise. Rotating the kernel per pixel turns whatever texel
// stepping survives filtering into fine noise rather than visible blocks.
vec2 cadShadowKernelRotation() {
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float theta = 6.2831853 * n;
    return vec2(cos(theta), sin(theta));
}

float cadShadowVisibility(vec2 uv, float compareDepth) {
    // Taps outside the map are lit, rather than repeating the edge texel.
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
        return 1.0;
    }

    // The far plane bounds casters, not receivers. Beyond it, every stored caster
    // can block the light, but cleared depth (1.0) must remain lit with LEQUAL.
    return texture(tCadShadowMap, vec3(uv, min(compareDepth, 1.0)));
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
 * contact shadow does, and reading that as a near blocker makes the filter too narrow,
 * which draws a dark rim around every shadow.
 */
float cadShadowBlockerDistance(vec2 shadowUv, float compareDepth, vec2 searchRadius, vec2 rotation) {
    float blocked = 0.0;
    float distant = 0.0;
    float probe = CAD_SHADOW_PROBE_BASE;

    for (int i = 0; i < CAD_SHADOW_PROBES; i++) {
        // The search has to span the widest penumbra, otherwise a receiver just outside
        // a distant shadow never learns about the blocker and the soft edge gets cut off.
        vec2 tap = shadowUv + cadShadowDiskTap(i, rotation) * searchRadius;
        blocked += 1.0 - cadShadowVisibility(tap, compareDepth);
        distant += 1.0 - cadShadowVisibility(tap, compareDepth - probe);
        probe *= CAD_SHADOW_PROBE_GROWTH;
    }

    return blocked > 1.0e-3 ? clamp(distant / blocked, 0.0, 1.0) : 0.0;
}

/**
 * Contrast curve for the penumbra ramp.
 *
 * It has to keep 0.5 fixed. A PCF average puts the half occluded point exactly on the
 * geometric shadow edge, so any curve that moves 0.5 shifts the visible edge by a
 * fraction of the penumbra width. That width grows with blocker distance, so such a
 * shift bends an otherwise straight shadow inwards as it stretches away from its caster.
 * Smoothstep eases both ends of the ramp and leaves the midpoint where it belongs.
 */
float cadShadowShapeEdge(float occlusion) {
    return occlusion * occlusion * (3.0 - 2.0 * occlusion);
}

// Percentage-closer soft shadows. The kernel is measured in shadow-map texels and sized
// by blocker distance, so the penumbra is a property of the light and of the geometry,
// never of the screen: orbiting the camera cannot change it.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal) {
    // Normal offset bias: move the lookup off the surface instead of biasing depth only.
    // Sized for the contact footprint rather than the widest one, because the wide
    // kernel only comes into play deep inside a shadow, where acne cannot be seen.
    vec3 offsetPos = worldPos + worldNormal * (cadShadowTexelWorld * (CAD_SHADOW_CONTACT_TEXELS + 1.0));

    // Orthographic light rays keep the same UV beyond the caster frustum's far plane.
    // Receivers there still see valid caster depths. Only reject lateral misses and
    // points in front of the near plane, where no stored caster can block the light.
    vec3 lightNdc = (cadShadowMatrix * vec4(offsetPos, 1.0)).xyz;
    if (any(greaterThan(abs(lightNdc.xy), vec2(1.0))) || lightNdc.z < -1.0) {
        return 0.0;
    }

    vec2 shadowUv = lightNdc.xy * 0.5 + 0.5;
    float referenceDepth = lightNdc.z * 0.5 + 0.5;

    // Reconstructing the receiver from the camera depth buffer has an error that does not
    // shrink with shadow map resolution, hence the floor on top of the texel sized term.
    float depthBias = max((cadShadowTexelWorld * 2.5) / cadShadowDepthRange, 2.0e-4);
    float compareDepth = referenceDepth - depthBias;
    vec2 texel = 1.0 / vec2(textureSize(tCadShadowMap, 0));
    vec2 rotation = cadShadowKernelRotation();

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
        visibility += cadShadowVisibility(tap, compareDepth);
    }

    float occlusion = 1.0 - visibility / float(CAD_SHADOW_TAPS);
    return clamp(occlusion, 0.0, 1.0);
}

// Returns the lit factor in [1 - strength, 1].
float cadShadowLit(sampler2D depthTexture, vec2 uv) {
    if (cadShadowEnabled < 0.5) {
        return 1.0;
    }

    float depth = texture(depthTexture, uv).r;

    // Reconstructed unconditionally so the derivatives in cadShadowViewNormal see the
    // whole quad. Branching first would leave neighbouring lanes undefined.
    vec3 viewPos = cadShadowViewPosFromDepth(depth, uv);
    vec3 viewNormal = cadShadowViewNormal(viewPos);

    // Cleared depth has no receiving surface. Custom meshes receive shadows in their materials.
    if (depth >= CAD_SHADOW_EMPTY_DEPTH) {
        return 1.0;
    }

    vec3 worldPos = cadShadowWorldFromView(viewPos);
    vec3 worldNormal = mat3(cadCameraMatrixWorld) * viewNormal;

    // CAD materials already darken as they turn from the sun. Multiplying the shadow
    // map on top doubles that and, on curved primitives, aliases the terminator to
    // texel steps. Fading here hands the boundary back to the diffuse term.
    float facing = 1.0;
    if (cadShadowTerminatorFade > 0.0) {
        facing = smoothstep(0.0, cadShadowTerminatorFade, dot(worldNormal, cadShadowLightDirection));
        if (facing <= 0.0) {
            return 1.0;
        }
    }

    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(worldPos, worldNormal));
    return 1.0 - occlusion * facing * cadShadowStrength;
}
