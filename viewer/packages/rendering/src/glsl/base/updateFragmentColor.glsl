#include ../color/rgb2hsv.glsl;
#include ../color/hsv2rgb.glsl;
#include ../color/packIntToColor.glsl;
#include geometryTypes.glsl;
#include renderModes.glsl;
// Exposes the g_world* lighting vectors (and computeWorldSpaceVectors) to every
// shader that includes updateFragmentColor, so they can be used below without
// changing this function's signature.
#include worldSpaceVectors.glsl;
#include pbr.glsl;
#include environment.glsl;
#include ibl.glsl;
#include tonemapping.glsl;
#include ../math/colorSpaceConversion.glsl;
#include dither.glsl;
#include ../sector/primitives/newMatCap.glsl

#include <packing>

// Runtime toggle/strength for the output dither (see below). 1.0 = on, 0.0 = off.
uniform float dithering;

// Runtime toggle between the new PBR lighting path (>0.5) and the original
// pre-hackathon albedo path (<=0.5), for easy A/B comparison.
uniform float usePbr;

out vec4 outputColor;

vec3 packNormalToRgb( const in vec3 normal ) {
    return normalize( normal ) * 0.5 + 0.5;
}

void updateFragmentColor(
    int renderMode, vec4 color, float treeIndex,
    vec3 normal, float depth, sampler2D matCapTexture,
    int geometryType) {
    if (renderMode == RenderTypeColor || renderMode == RenderTypeEffects) {
        #if defined(IS_TEXTURED)
            vec3 colorRGB = color.rgb;
        #else
            vec3 hsv = rgb2hsv(color.rgb);
            hsv.z = min(0.5 * hsv.z + 0.5, 1.0);
            vec3 colorRGB = hsv2rgb(hsv);
        #endif

        // Single toggle for the hackathon demo: the new PBR pipeline vs. the exact
        // pre-hackathon rendering. Shaders that don't compute world vectors also
        // fall back to the original path.
        if (usePbr > 0.5 && g_worldVectorsValid) {
            // --- New rendering (this branch) ---------------------------------
            // PBR shading, using the world-space vectors populated by the
            // fragment shader (via computeWorldSpaceVectors).
            // Placeholder lighting/material parameters - to be wired up properly later.
            // Lighting is done in Reveal model/sector space, where +Z is up.
            vec3 sunDirection = normalize(vec3(1.0, 0.0, 1.0));
            vec3 sunRadiance = vec3(3.0, 2.9, 2.7);
            float metallic = 0.0;
            float roughness = 0.3;

            // Shade in linear light: decode the sRGB base color to linear first.
            vec3 albedo = sRGBToLinear(colorRGB);
            vec3 N = normalize(g_worldNormal);
            vec3 viewDirection = -g_worldRayDirection;
            vec3 reflection = g_worldReflection; // reflect(view ray, N) in model space

            // Ambient / indirect via split-sum image-based lighting (diffuse
            // irradiance + prefiltered specular). Procedural environment by
            // default; drop-in textures under ENV_MAP_TEXTURES (environment.glsl).
            vec3 hdrColor = iblLighting(N, viewDirection, reflection, albedo, metallic, roughness);

            // >>> SUN DOUBLE-COUNT TOGGLE: DEFINE ENV_MAP_HAS_SUN WHEN THE <<<
            // >>> ENVIRONMENT MAP ALREADY CONTAINS THE SUN TO DROP THIS.  <<<
            // Analytic directional light: a sharp sun highlight the low-resolution
            // environment can't resolve. Skipped when the environment map already
            // bakes in the sun (ENV_MAP_HAS_SUN) to avoid double-counting it.
            #ifndef ENV_MAP_HAS_SUN
            hdrColor += pbrDirectLighting(N, viewDirection, sunDirection, sunRadiance, albedo, metallic, roughness);
            #endif

            // HDR linear radiance -> ACES filmic tone map (with cross-talk) -> sRGB encode.
            colorRGB = LinearTosRGB(acesFitted(hdrColor));

            // Break up 8-bit quantization banding on smooth gradients with a
            // sub-LSB triangular dither, applied in the sRGB output space just
            // before the value is written to the (8-bit) render target.
            colorRGB = ditherTriangularNoise(colorRGB, gl_FragCoord.xy, dithering);

            outputColor = vec4(colorRGB, color.a);
        } else {
            // --- Original pre-hackathon rendering (exactly as on master) ------
            // Camera-space cosine term + matcap, with no sRGB / tonemapping / dither.
            float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
            vec4 albedo = vec4(colorRGB * (0.4 + 0.6 * amplitude), 1.0);
            vec2 cap = normal.xy * 0.5 + 0.5;
            vec4 mc = vec4(texture(matCapTexture, cap).rgb, 1.0);

            outputColor = vec4(albedo.rgb * mc.rgb * 1.7, color.a);
        }
    } else if (renderMode == RenderTypeGhost) {
        float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
        float s = 0.4 + 0.6 * amplitude;
        outputColor = vec4(vec3(s), 0.3);
    } else if (renderMode == RenderTypeDepthBufferOnly) {
        outputColor = vec4(1.0, 0.0, 1.0, 1.0);
    } else if (renderMode == RenderTypePackColorAndNormal) {
        vec3 hsv = rgb2hsv(color.rgb);
        float a = 0.0;
        if (hsv.y > 0.01) {
            if (hsv.z > 0.5) {
                // light color
                a = (0.55 + hsv.x * 0.45);
            } else {
                // dark color
                a = (0.1 + hsv.x * 0.45);
            }
        } else {
            // no saturation - grayscale
            a = hsv.z * 0.09;
        }
        outputColor = vec4(packNormalToRgb(normal.rgb), color.a);
    } else if (renderMode == RenderTypeNormal) {
        outputColor = vec4(packNormalToRgb(normal), color.a);
    } else if (renderMode == RenderTypeTreeIndex) {
        outputColor = vec4(packIntToColor(treeIndex), color.a);
    } else if (renderMode == RenderTypeDepth) {
        outputColor = packDepthToRGBA(depth);
    } else if (renderMode == RenderTypeLOD) {
        bool isHighDetail = geometryType != GeometryType.Quad;
        vec2 cap = normal.xy * 0.5 + 0.5;
        vec3 mc = texture(matCapTexture, cap).rgb * 1.5;
        outputColor = isHighDetail ? vec4(vec3(0.0, 1.0, 0.0) * mc, color.a) : vec4(vec3(1.0, 1.0, 0.0) * mc, color.a);
    } else if (renderMode == RenderTypeGeometryType) {
        vec2 cap = normal.xy * 0.5 + 0.5;
        vec3 mc = texture(matCapTexture, cap).rgb;
        vec3 geometryColor =
            float(geometryType == 1) * vec3(1.0, 0.0, 0.0) + // Quads
            float(geometryType == 2) * vec3(0.0, 1.0, 0.0) + // Primitives
            float(geometryType == 3) * vec3(0.0, 0.0, 1.0) + // Triangle meshes
            float(geometryType == 4) * vec3(1.0, 1.0, 0.0);  // Instance meshes
        outputColor = vec4(geometryColor * mc, color.a);
    } else {
        // Unknown render mode - should not happen.
        outputColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
}
