#include ../math/rand2d.glsl;

uniform mat4 projectionMatrix;
uniform mat4 inverseProjectionMatrix;
uniform vec3 cadLightDirection;
uniform vec4 cadShadowPlane;

vec3 contactViewPosFromDepth(float depth, vec2 uv) {
    float z = depth * 2.0 - 1.0;
    vec4 clipSpacePosition = vec4(uv * 2.0 - 1.0, z, 1.0);
    vec4 viewSpacePosition = inverseProjectionMatrix * clipSpacePosition;
    return viewSpacePosition.xyz / viewSpacePosition.w;
}

vec3 contactViewNormalFromDepth(sampler2D depthTexture, vec2 uv, float depth) {
    vec2 texel = 1.0 / vec2(textureSize(depthTexture, 0));
    vec3 p = contactViewPosFromDepth(depth, uv);
    vec3 px = contactViewPosFromDepth(texture(depthTexture, uv + vec2(texel.x, 0.0)).r, uv + vec2(texel.x, 0.0));
    vec3 py = contactViewPosFromDepth(texture(depthTexture, uv + vec2(0.0, texel.y)).r, uv + vec2(0.0, texel.y));
    return normalize(cross(px - p, py - p));
}

float marchTowardLight(sampler2D depthTexture, vec3 origin) {
    vec3 rayDir = normalize(cadLightDirection);
    float viewDistance = max(length(origin), 0.25);
    float rayLength = viewDistance * 0.7;
    float bias = viewDistance * 0.003;

    const int STEPS = 32;
    float stepLen = rayLength / float(STEPS);
    float dither = rand2d(origin.xy * 0.13) * stepLen;
    // Skip the first steps so we project the silhouette instead of a contact blob at the feet.
    origin += rayDir * (bias + dither + stepLen * 3.0);

    for (int i = 1; i <= STEPS; i++) {
        float travelled = stepLen * float(i);
        vec3 samplePos = origin + rayDir * travelled;
        vec4 clip = projectionMatrix * vec4(samplePos, 1.0);
        if (clip.w <= 0.0) {
            break;
        }

        vec3 ndc = clip.xyz / clip.w;
        vec2 sampleUv = ndc.xy * 0.5 + 0.5;
        if (sampleUv.x < 0.0 || sampleUv.x > 1.0 || sampleUv.y < 0.0 || sampleUv.y > 1.0) {
            break;
        }

        float sceneDepth = texture(depthTexture, sampleUv).r;
        if (sceneDepth >= 0.999) {
            continue;
        }

        vec3 scenePos = contactViewPosFromDepth(sceneDepth, sampleUv);
        float delta = scenePos.z - samplePos.z;
        float thickness = mix(viewDistance * 0.02, viewDistance * 0.55, travelled / rayLength);
        if (delta > bias && delta < thickness) {
            float t = travelled / rayLength;
            return 1.0 - smoothstep(0.75, 1.0, t);
        }
    }

    return 0.0;
}

bool groundPlaneHit(vec2 uv, out vec3 origin) {
    vec4 clip = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
    vec4 view = inverseProjectionMatrix * clip;
    vec3 rayDir = normalize(view.xyz / view.w);
    float denom = dot(rayDir, cadShadowPlane.xyz);
    if (abs(denom) < 1e-4) {
        return false;
    }

    float t = -cadShadowPlane.w / denom;
    if (t < 0.5) {
        return false;
    }

    origin = rayDir * t;
    return true;
}

// Screen-space march toward the CAD sun. Uses the existing CAD depth buffer.
// Empty pixels fall back to the model ground plane so silhouettes project onto the floor.
float contactShadow(sampler2D depthTexture, vec2 uv) {
    float depth = texture(depthTexture, uv).r;
    vec3 origin;

    if (depth < 0.999) {
        origin = contactViewPosFromDepth(depth, uv);
        vec3 rayDir = normalize(cadLightDirection);
        vec3 normal = contactViewNormalFromDepth(depthTexture, uv, depth);
        if (dot(normal, vec3(0.0, 0.0, 1.0)) < 0.0) {
            normal = -normal;
        }
        if (dot(normal, rayDir) <= 0.05) {
            return 1.0;
        }
    } else if (!groundPlaneHit(uv, origin)) {
        return 1.0;
    }

    return 1.0 - marchTowardLight(depthTexture, origin) * 0.7;
}
