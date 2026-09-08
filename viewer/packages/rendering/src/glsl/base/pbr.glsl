#include ../math/constants.glsl;

/*
 * Physically based rendering (PBR) helpers.
 *
 * Reusable building blocks for a metallic/roughness Cook-Torrance BRDF.
 * Include this file in a fragment shader and call `pbrDirectLighting(...)`
 * for a single light, or use the individual terms to build a custom model:
 *
 *   #include ../../base/pbr.glsl;
 *   ...
 *   vec3 color = pbrDirectLighting(normal, viewDir, lightDir, lightColor,
 *                                  albedo, metallic, roughness);
 *
 * All vectors are expected to be normalized and in the same coordinate space
 * (typically view space).
 */

// Normal distribution function (Trowbridge-Reitz / GGX).
float pbrDistributionGGX(vec3 normal, vec3 halfVector, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float nDotH = max(dot(normal, halfVector), 0.0);
    float nDotH2 = nDotH * nDotH;

    float denom = nDotH2 * (a2 - 1.0) + 1.0;
    denom = PI * denom * denom;

    return a2 / max(denom, 1e-6);
}

// Schlick-GGX geometry term for a single direction.
float pbrGeometrySchlickGGX(float nDotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return nDotV / (nDotV * (1.0 - k) + k);
}

// Smith's method: geometry term accounting for both view and light directions.
float pbrGeometrySmith(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness) {
    float nDotV = max(dot(normal, viewDir), 0.0);
    float nDotL = max(dot(normal, lightDir), 0.0);
    return pbrGeometrySchlickGGX(nDotV, roughness) * pbrGeometrySchlickGGX(nDotL, roughness);
}

// Fresnel-Schlick approximation. `f0` is the surface reflectance at normal incidence.
vec3 pbrFresnelSchlick(float cosTheta, vec3 f0) {
    return f0 + (1.0 - f0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

/*
 * Evaluate the Cook-Torrance BRDF for a single directional/point light and
 * return the outgoing radiance contribution (diffuse + specular).
 *
 *   normal      surface normal
 *   viewDir     direction from the surface to the camera
 *   lightDir    direction from the surface to the light
 *   radiance    incoming light color (already attenuated)
 *   albedo      base color
 *   metallic    0 = dielectric, 1 = metal
 *   roughness   0 = mirror smooth, 1 = fully rough
 */
vec3 pbrDirectLighting(
    vec3 normal, vec3 viewDir, vec3 lightDir, vec3 radiance,
    vec3 albedo, float metallic, float roughness) {
    vec3 halfVector = normalize(viewDir + lightDir);

    // Base reflectance: 0.04 for dielectrics, tinted by albedo for metals.
    vec3 f0 = mix(vec3(0.04), albedo, metallic);

    float ndf = pbrDistributionGGX(normal, halfVector, roughness);
    float geo = pbrGeometrySmith(normal, viewDir, lightDir, roughness);
    vec3 fresnel = pbrFresnelSchlick(max(dot(halfVector, viewDir), 0.0), f0);

    float nDotL = max(dot(normal, lightDir), 0.0);
    float nDotV = max(dot(normal, viewDir), 0.0);

    vec3 specular = (ndf * geo * fresnel) / max(4.0 * nDotV * nDotL, 1e-6);

    // Energy conservation: metals have no diffuse component.
    vec3 kd = (vec3(1.0) - fresnel) * (1.0 - metallic);
    vec3 diffuse = kd * albedo / PI;

    return (diffuse + specular) * radiance * nDotL;
}
