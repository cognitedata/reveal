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

const int CAD_SHADOW_TAPS = 16;
const float CAD_SHADOW_PENUMBRA_TEXELS = 3.0;
const float CAD_SHADOW_GOLDEN_ANGLE = 2.39996323;

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

// Percentage-closer filtering in light space. The kernel is measured in shadow-map
// texels, so the penumbra width is a property of the light, not of the screen.
float cadShadowOcclusion(vec3 worldPos, vec3 worldNormal) {
    // Normal offset bias: move the lookup off the surface instead of biasing depth only.
    // It has to clear the whole filter footprint, otherwise the kernel samples the
    // receiver itself and slanted faces get acne.
    vec3 offsetPos = worldPos + worldNormal * (cadShadowTexelWorld * (CAD_SHADOW_PENUMBRA_TEXELS + 1.0));

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
    vec2 penumbra = CAD_SHADOW_PENUMBRA_TEXELS / vec2(textureSize(tCadShadowMap, 0));
    float rotation = cadShadowKernelRotation();

    float visibility = 0.0;
    for (int i = 0; i < CAD_SHADOW_TAPS; i++) {
        vec2 tap = shadowUv + cadShadowDiskTap(i, rotation) * penumbra;
        visibility += texture(tCadShadowMap, vec3(tap, compareDepth));
    }

    return 1.0 - visibility / float(CAD_SHADOW_TAPS);
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

    return 1.0 - cadShadowOcclusion(worldPos, worldNormal) * cadShadowStrength;
}
