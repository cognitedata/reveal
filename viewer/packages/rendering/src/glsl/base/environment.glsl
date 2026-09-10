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

// ###########################################################################
// ###########################################################################
// ##                                                                       ##
// ##   >>>>>  PLUG IN THE ENVIRONMENT MAP / IBL TEXTURES HERE  <<<<<        ##
// ##                                                                       ##
// ##   This block is the PRIMARY DROP-IN POINT. Bind the sampler uniforms  ##
// ##   below, define ENV_MAP_TEXTURES, and implement sampleEnvMap(). No     ##
// ##   other call sites need to change.                                    ##
// ##                                                                       ##
// ###########################################################################
// ###########################################################################
//
// TEXTURE-BACKED ENVIRONMENT (DROP-IN).
//
// Define ENV_MAP_TEXTURES (and provide the uniforms below) to source lighting
// from real textures instead of the procedural sky. Two equirectangular maps,
// both expected LINEAR (sRGB-decoded) at sample time, in Reveal model/sector
// space (+Z up):
//   tEnvSpecular    - prefiltered / "sharper" radiance, used for reflections.
//   tEnvIrradiance  - heavily blurred, ~cosine irradiance, used for diffuse.
// Optional controls:
//   envMapIntensity - linear multiplier applied to both maps.
//   envLdrToHdr     - > 0 expands an LDR map into pseudo-HDR (lifts highlights)
//                     so bright sky / sun reads as a light source in reflections.
// Also define ENV_MAP_HAS_SUN when the environment already contains the sun, so
// the analytic directional light is dropped (see updateFragmentColor.glsl) to
// avoid double-counting it.
// ---------------------------------------------------------------------------
#define ENV_MAP_TEXTURES

#ifdef ENV_MAP_TEXTURES
uniform sampler2D skyboxTexture;
uniform sampler2D skyboxLowPassTexture;
uniform float envMapIntensity;
uniform float envLdrToHdr;


#include ../sector/primitives/newMatCap.glsl;

// >>> ADJUST HERE: EQUIRECTANGULAR MAPPING CONVENTION <<<
// Equirectangular UV for a direction in model/sector space (+Z up). ADJUST TO
// MATCH THE TEXTURE'S OWN CONVENTION if it differs (e.g. Y-up or a flipped V).
vec2 equirectUv(vec3 dir) {
    vec3 d = normalize(dir);
    float u = atan(d.y, d.x) / PI2 + 0.5;
    float v = asin(clamp(d.z, -1.0, 1.0)) / PI + 0.5;
    return vec2(u, v);
}

// Optional pseudo-HDR expansion: lift near-white pixels well above 1.0 so an LDR
// environment still produces bright highlights / a meaningful specular response.
vec3 envLdrToHdrExpand(vec3 c) {
    float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float boost = 1.0 + envLdrToHdr * 8.0 * pow(smoothstep(0.75, 1.0, luma), 3.0);
    return c * boost;
}

// >>> DROP-IN: THIS IS THE FUNCTION THAT ACTUALLY SAMPLES THE IBL TEXTURES <<<
vec3 sampleEnvMap(sampler2D tex, vec3 dir) {
	return sampleDirection(tex, dir);

	// return texture(tex, equirectUv(dir)).rgb;
    vec3 c = texture(tex, equirectUv(dir)).rgb;
    if (envLdrToHdr > 0.0) {
        c = envLdrToHdrExpand(c);
    }
    return c * envMapIntensity;
}
#endif

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

// >>> SINGLE SWAP POINT: PROCEDURAL SKY vs ENVIRONMENT TEXTURE <<<
// Specular environment radiance in a direction: the procedural sky by default,
// or the prefiltered specular texture when ENV_MAP_TEXTURES is defined. This is
// the single point that decides "procedural vs texture" for reflections; the
// roughness blur below is layered on top of it.
vec3 envRadiance(vec3 rd) {
#ifdef ENV_MAP_TEXTURES
    return sampleEnvMap(skyboxTexture, rd);
#else
    return surfaceEnvironment(rd);
#endif
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
// Works on whichever radiance source `envRadiance` provides (procedural sky or
// the specular texture). NOTE: this in-shader ring blur is a stand-in for a
// proper prefiltered mip chain - once a mip chain is available, replace the body
// with a single textureLod(skyboxTexture, ..., roughness * maxMip).
vec3 roughEnvironment(vec3 R, float roughness) {
    if (roughness <= 0.02) {
        return envRadiance(R);
    }

    vec3 T, B;
    envBasis(R, T, B);

    float spread = roughness * roughness * 0.75;

    vec3 sum = envRadiance(R);
    float weight = 1.0;

    for (int i = 0; i < ENV_BLUR_SAMPLES; i++) {
        float a = PI2 * float(i) / float(ENV_BLUR_SAMPLES);
        vec2 d = vec2(cos(a), sin(a));
        vec3 dir = normalize(R + spread * (T * d.x + B * d.y));
        sum += 0.75 * envRadiance(dir);
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

// ###########################################################################
// ##   >>>>>  IBL SOURCES: THE TWO FUNCTIONS TO EDIT FOR TEXTURES  <<<<<     ##
// ##                                                                       ##
// ##   ibl.glsl calls ONLY these two. Everything above is implementation.  ##
// ##   When real maps arrive, this is where you route them in.             ##
// ###########################################################################

// >>> DIFFUSE IBL DROP-IN: sample the IRRADIANCE map by the normal N here. <<<
// Diffuse irradiance for a surface normal `N` (cosine-convolved environment).
// Procedural hemisphere by default; the irradiance texture when available.
vec3 environmentIrradiance(vec3 N) {
#ifdef ENV_MAP_TEXTURES
    return sampleEnvMap(skyboxLowPassTexture, N);
#else
    return ambientLight(N);
#endif
}

// >>> SPECULAR IBL DROP-IN: sample the PREFILTERED map by reflection R here. <<<
// Prefiltered specular radiance for a reflection vector `R` at a given
// roughness. With no prefiltered mip chain yet, the roughness blur is
// approximated in-shader (roughEnvironment). WHEN A PREFILTERED MIP CHAIN
// EXISTS, REPLACE THE BODY WITH e.g.:
//     return textureLod(skyboxTexture, equirectUv(R), roughness * MAX_ENV_MIP).rgb * envMapIntensity;
vec3 environmentSpecular(vec3 R, float roughness) {
    return roughEnvironment(R, roughness);
}
