#include ../math/constants.glsl;
#include environment.glsl;

/*
 * Image-based lighting (split-sum approximation).
 *
 * Ambient / indirect lighting from an environment, split into a diffuse
 * (irradiance) term and a specular (prefiltered radiance) term, following the
 * Karis/UE4 split-sum approximation:
 *
 *   L_o ~= diffuse:  kD * albedo * irradiance(N)
 *        + specular: prefiltered(R, roughness) * (F0 * A + B)
 *
 * The (A, B) environment-BRDF integral is normally read from a precomputed 2D
 * LUT indexed by (NdotV, roughness). Here we use Brian Karis' analytic
 * approximation instead ("Physically Based Shading on Mobile", Epic 2014), so no
 * LUT texture is needed for the scaffolding - it can be swapped for a real LUT
 * later without touching the call sites.
 *
 * The environment itself (irradiance + prefiltered radiance) comes from
 * environment.glsl, which is procedural by default and becomes texture-backed
 * when ENV_MAP_TEXTURES is defined. All vectors are in Reveal model/sector
 * space (+Z up) and lighting is done in linear space.
 */

// ===========================================================================
// AMBIENT / ENVIRONMENT / IBL BRIGHTNESS KNOB
// Global linear multiplier on the whole image-based lighting term (diffuse +
// specular, procedural or texture-backed). Raise if the ambient looks too dark,
// lower if it looks too bright. This is the single dial to tune overall IBL
// exposure; for texture-only scaling there's also envMapIntensity in
// environment.glsl.
// ===========================================================================
#ifndef IBL_INTENSITY
#define IBL_INTENSITY 1.0
#endif

// Fresnel-Schlick with a roughness term, so grazing reflections on rough
// surfaces don't blow out (Sebastien Lagarde). Used for the IBL split between
// diffuse and specular energy.
vec3 fresnelSchlickRoughness(float cosTheta, vec3 f0, float roughness) {
    vec3 fr = max(vec3(1.0 - roughness), f0);
    return f0 + (fr - f0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// >>> OPTIONAL DROP-IN: REPLACE WITH A REAL BRDF INTEGRATION LUT <<<
// Analytic approximation of the environment-BRDF LUT (the split-sum second
// term). Returns the specular scale/bias applied to the prefiltered radiance:
//   specular = prefilteredColor * envBRDFApprox(F0, roughness, NoV)
// Brian Karis, "Physically Based Shading on Mobile" (Epic Games, 2014).
// TO USE A PRECOMPUTED LUT INSTEAD: sample a 2D LUT at (NoV, roughness) and
// return f0 * lut.x + lut.y (bind the LUT as a uniform sampler2D).
vec3 envBRDFApprox(vec3 f0, float roughness, float NoV) {
    const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
    const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
    vec4 r = roughness * c0 + c1;
    float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    vec2 ab = vec2(-1.04, 1.04) * a004 + r.zw;
    return f0 * ab.x + ab.y;
}

/*
 * Evaluate ambient/indirect (image-based) lighting for a surface.
 *
 *   N          surface normal (model/sector space, +Z up)
 *   V          direction from surface to camera
 *   R          reflection of the view ray about N (i.e. g_worldReflection)
 *   albedo     base color (linear)
 *   metallic   0 = dielectric, 1 = metal
 *   roughness  0 = mirror, 1 = fully rough
 */
vec3 iblLighting(vec3 N, vec3 V, vec3 R, vec3 albedo, float metallic, float roughness) {
    float NoV = max(dot(N, V), 1e-4);

    // Base reflectance: 0.04 for dielectrics, albedo-tinted for metals.
    vec3 f0 = mix(vec3(0.04), albedo, metallic);

    vec3 F = fresnelSchlickRoughness(NoV, f0, roughness);
    // Energy conservation: what isn't reflected (specular) is diffused, and
    // metals have no diffuse component.
    vec3 kd = (vec3(1.0) - F) * (1.0 - metallic);

    // Diffuse: cosine-convolved irradiance sampled by the normal.
    vec3 diffuse = kd * albedo * environmentIrradiance(N);

    // Specular: prefiltered radiance sampled by the reflection vector, weighted
    // by the (approximated) environment BRDF.
    vec3 prefiltered = environmentSpecular(R, roughness);
    vec3 specular = prefiltered * envBRDFApprox(f0, roughness, NoV);

    return (diffuse + specular) * IBL_INTENSITY;
}
