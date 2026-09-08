#include ../math/constants.glsl;

/*
 * Procedural environment map contributions.
 *
 * A cheap analytic environment used for image-based-lighting style
 * contributions: a sky/horizon/ground gradient plus a roughness-aware
 * (blurred) lookup for glossy reflections and a hemispheric ambient term.
 *
 * Pure functions of direction only - no raymarching, shadows or normals.
 * Provide the surface normal / reflection vector from the calling shader.
 *
 *   #include ../../base/environment.glsl;
 *   ...
 *   vec3 reflection = roughEnvironment(reflect(-viewDir, normal), roughness);
 *   vec3 ambient    = ambientLight(normal);
 *
 * Directions are expected in Reveal model/sector space, where +Z is up (the
 * gradient is oriented along +Z).
 */

// Number of ring samples used to approximate a pre-filtered environment.
#define ENV_BLUR_SAMPLES 7

// Base environment radiance for a direction: a simple sky / horizon / ground
// gradient. This is the procedural "environment map".
vec3 surfaceEnvironment(vec3 rd) {
    float up = clamp(rd.z, -1.0, 1.0);

    vec3 sky = vec3(0.035, 0.075, 0.16);
    vec3 horizon = vec3(0.13, 0.15, 0.18);
    vec3 ground = vec3(0.025, 0.023, 0.022);

    if (up >= 0.0) {
        return mix(horizon, sky, pow(up, 0.55));
    }
    return mix(ground, horizon, smoothstep(-1.0, 0.0, up));
}

// Environment as seen directly by the camera (i.e. the background), with a
// bright sun disk added along `sunDirection`.
vec3 backgroundEnvironment(vec3 rd, vec3 sunDirection) {
    vec3 c = surfaceEnvironment(rd);
    float s = max(dot(rd, sunDirection), 0.0);
    c += vec3(5.0, 4.3, 3.2) * pow(s, 900.0);
    return c;
}

// Build an orthonormal tangent basis around `n`.
void envBasis(vec3 n, out vec3 t, out vec3 b) {
    t = normalize(cross(abs(n.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0), n));
    b = cross(n, t);
}

// Roughness-aware environment lookup: jitters the reflection direction `R` in a
// ring to approximate a pre-filtered (blurred) environment for glossy surfaces.
vec3 roughEnvironment(vec3 R, float roughness) {
    if (roughness <= 0.02) {
        return surfaceEnvironment(R);
    }

    vec3 T, B;
    envBasis(R, T, B);

    float spread = roughness * roughness * 0.75;

    vec3 sum = surfaceEnvironment(R);
    float weight = 1.0;

    for (int i = 0; i < ENV_BLUR_SAMPLES; i++) {
        float a = PI2 * float(i) / float(ENV_BLUR_SAMPLES);
        vec2 d = vec2(cos(a), sin(a));
        vec3 dir = normalize(R + spread * (T * d.x + B * d.y));
        sum += 0.75 * surfaceEnvironment(dir);
        weight += 0.75;
    }

    return sum / weight;
}

// Hemispheric ambient irradiance for a surface normal `N`.
vec3 ambientLight(vec3 N) {
    float up = max(N.z, 0.0);
    float horizon = 1.0 - abs(N.z);
    float down = max(-N.z, 0.0);

    return vec3(0.08, 0.12, 0.20) * up +
           vec3(0.045, 0.050, 0.060) * horizon +
           vec3(0.015, 0.014, 0.013) * down;
}
