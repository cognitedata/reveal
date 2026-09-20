uniform mat4 inverseProjectionMatrix;
uniform mat4 cadCameraMatrixWorld;
uniform mat4 cadShadowMatrix;
uniform highp sampler2DShadow tCadShadowMap;
uniform vec3 cadShadowLightDirection;
uniform float cadShadowTexelWorld;
uniform float cadShadowDepthRange;
uniform float cadShadowStrength;
uniform float cadShadowEnabled;
// Reduces extra shadow darkening on CAD faces that already turn away from the light.
// Set to 0 to disable this adjustment.
uniform float cadShadowTerminatorFade;

const float CAD_SHADOW_EMPTY_DEPTH = 1.0;
const int CAD_SHADOW_TAPS = 16;
const float CAD_SHADOW_GOLDEN_ANGLE = 2.39996323;

// Nearby blockers give sharper edges; distant blockers give softer edges.
// These filter radii are in shadow-map pixels and do not change full-shadow darkness.
const float CAD_SHADOW_CONTACT_TEXELS = 1.25;
const float CAD_SHADOW_DISTANT_TEXELS = 8.0;

// Four depth offsets help estimate how far the blocker is from the receiving surface.
// Start at 1% of the light's depth range and multiply by 3 each time, not fixed meters.
const int CAD_SHADOW_PROBES = 4;
const float CAD_SHADOW_PROBE_BASE = 0.01;
const float CAD_SHADOW_PROBE_GROWTH = 3.0;

// "Where is this screen pixel in 3D, relative to the camera?"
// Undo the camera projection using the pixel's screen coordinates and depth.
vec3 cadShadowViewPosFromDepth(float depth, vec2 uv) {
    float z = depth * 2.0 - 1.0;
    vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, z, 1.0);
    vec4 viewSpacePosition = inverseProjectionMatrix * clipSpacePosition;
    return viewSpacePosition.xyz / viewSpacePosition.w;
}

// Convert a camera-relative position into the scene's world coordinates.
// This lets us compare the same point with the light, regardless of the user's view.
vec3 cadShadowWorldFromView(vec3 viewPos) {
    return (cadCameraMatrixWorld * vec4(viewPos, 1.0)).xyz;
}

// "Which way does this surface face?"
// Changes in position across neighboring pixels give us a perpendicular direction.
// Calculate this before depth-based early returns: derivatives need neighboring pixels.
vec3 cadShadowViewNormal(vec3 viewPos) {
    vec3 n = normalize(cross(dFdx(viewPos), dFdy(viewPos)));
    // Flip the normal if it points away from the camera.
    return dot(n, vec3(0.0, 0.0, 1.0)) < 0.0 ? -n : n;
}

// Pick the offset of one sample in a disk around the shadow lookup.
// A golden-angle spiral avoids the visible grid patterns of square sampling.
// rotation contains a cosine/sine pair shared by all samples for this pixel.
// This only chooses where to sample; it does not read the shadow map.
vec2 cadShadowDiskTap(int index, vec2 rotation) {
    float radius = sqrt((float(index) + 0.5) / float(CAD_SHADOW_TAPS));
    float theta = float(index) * CAD_SHADOW_GOLDEN_ANGLE;
    vec2 spiral = vec2(cos(theta), sin(theta)) * radius;

    return vec2(
        spiral.x * rotation.x - spiral.y * rotation.y,
        spiral.x * rotation.y + spiral.y * rotation.x
    );
}

// Give each screen pixel a repeatable rotation for its sample disk.
// This breaks up repeated sampling patterns without needing a noise texture.
vec2 cadShadowKernelRotation() {
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    float theta = 6.2831853 * n;
    return vec2(cos(theta), sin(theta));
}

// "Can light reach this point?" Compare its depth with the shadow map.
// Returns 1 for lit, 0 for blocked, or a filtered value between them near an edge.
float cadShadowVisibility(vec2 uv, float compareDepth) {
    // Outside the map, assume light rather than repeating shadows from its edge.
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
        return 1.0;
    }

    // Receivers can lie beyond the depth range used to render the casters.
    // Cap the comparison at 1 so stored objects still block light, but empty pixels do not.
    return texture(tCadShadowMap, vec3(uv, min(compareDepth, 1.0)));
}

// "Is the object blocking the light close to this surface or far away?"
// Compare visibility before and after shifting the reference depth toward the light.
// If it stays blocked after a large shift, the blocker is likely farther away.
// Returns a rough 0-to-1 indicator for choosing softness, not a distance in meters.
float cadShadowBlockerDistance(vec2 shadowUv, float compareDepth, vec2 searchRadius, vec2 rotation) {
    float blocked = 0.0;
    float distant = 0.0;
    float probe = CAD_SHADOW_PROBE_BASE;

    for (int i = 0; i < CAD_SHADOW_PROBES; i++) {
        // Probe nearby positions too, so the estimate accounts for shadow edges.
        vec2 tap = shadowUv + cadShadowDiskTap(i, rotation) * searchRadius;
        blocked += 1.0 - cadShadowVisibility(tap, compareDepth);
        distant += 1.0 - cadShadowVisibility(tap, compareDepth - probe);
        probe *= CAD_SHADOW_PROBE_GROWTH;
    }

    // Normalize by blocked coverage so a partly lit edge is not mistaken for a near blocker.
    return blocked > 1.0e-3 ? clamp(distant / blocked, 0.0, 1.0) : 0.0;
}

// Adjust the edge's contrast: low occlusion gets lower and high occlusion gets higher.
// Keep 0, 0.5 and 1 unchanged so the half-shadow boundary does not shift.
// This reshapes one value; it does not read more samples or run another blur.
float cadShadowShapeEdge(float occlusion) {
    return occlusion * occlusion * (3.0 - 2.0 * occlusion);
}

// "How much light is blocked at this world-space point?"
// Locate it in the shadow map, choose a filter radius, and average nearby visibility samples.
// Returns 0 for no blocking and 1 for full blocking. The radius uses shadow-map pixels.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal) {
    // Move the lookup slightly off the surface to avoid false self-shadowing.
    // Keep this offset tied to the small contact radius, not the wider soft-edge radius.
    vec3 offsetPos = worldPos + worldNormal * (cadShadowTexelWorld * (CAD_SHADOW_CONTACT_TEXELS + 1.0));

    // Look at the point from the light's camera.
    // Reject points outside the map's sides or in front of its near plane.
    // Do not reject points beyond the far plane: they can still receive shadows.
    vec3 lightNdc = (cadShadowMatrix * vec4(offsetPos, 1.0)).xyz;
    if (any(greaterThan(abs(lightNdc.xy), vec2(1.0))) || lightNdc.z < -1.0) {
        return 0.0;
    }

    vec2 shadowUv = lightNdc.xy * 0.5 + 0.5;
    float referenceDepth = lightNdc.z * 0.5 + 0.5;

    // Also move the comparison depth slightly toward the light to hide precision errors.
    // Keep a minimum bias because a larger shadow map does not fix camera-depth errors.
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
    // A farther blocker widens the soft edge without changing full-shadow darkness.
    vec2 penumbra = texel * mix(CAD_SHADOW_CONTACT_TEXELS, CAD_SHADOW_DISTANT_TEXELS, blockerDistance);

    // Average light visibility around the point instead of making one hard yes/no decision.
    float visibility = 0.0;
    for (int i = 0; i < CAD_SHADOW_TAPS; i++) {
        vec2 tap = shadowUv + cadShadowDiskTap(i, rotation) * penumbra;
        visibility += cadShadowVisibility(tap, compareDepth);
    }

    float occlusion = 1.0 - visibility / float(CAD_SHADOW_TAPS);
    return clamp(occlusion, 0.0, 1.0);
}

// "How much of this CAD pixel's color should remain after applying the shadow?"
// Reconstruct the surface, calculate blocking, and convert it into a color multiplier.
// Returns 1 for no darkening, down to 1 - cadShadowStrength for the strongest shadow.
float cadShadowLit(sampler2D depthTexture, vec2 uv) {
    if (cadShadowEnabled < 0.5) {
        return 1.0;
    }

    float depth = texture(depthTexture, uv).r;

    // Calculate position and normal before skipping empty pixels.
    // The normal calculation needs position changes across neighboring pixels.
    vec3 viewPos = cadShadowViewPosFromDepth(depth, uv);
    vec3 viewNormal = cadShadowViewNormal(viewPos);

    // No surface means no shadow here. Custom meshes are shaded in their own materials.
    if (depth >= CAD_SHADOW_EMPTY_DEPTH) {
        return 1.0;
    }

    vec3 worldPos = cadShadowWorldFromView(viewPos);
    vec3 worldNormal = mat3(cadCameraMatrixWorld) * viewNormal;

    // CAD lighting already darkens faces that turn away from the light.
    // Reduce the extra shadow there to avoid overly dark shading and rough edges.
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
