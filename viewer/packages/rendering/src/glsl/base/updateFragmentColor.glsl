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

#include <packing>

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

        // PBR shading, using the world-space vectors populated by the fragment
        // shader (via computeWorldSpaceVectors). Shaders that don't compute them
        // keep their unlit albedo output.
        if (g_worldVectorsValid) {
            // Placeholder lighting/material parameters - to be wired up properly later.
            // Lighting is done in Reveal model/sector space, where +Z is up, so the
            // sun points straight up to keep the horizon level (vertical ground normal).
            vec3 sunDirection = normalize(vec3(1.0, 0.0, 1.0));
            vec3 sunRadiance = vec3(3.0, 2.9, 2.7);
            float metallic = 0.0;
            float roughness = 0.3;

            vec3 albedo = colorRGB;
            vec3 N = normalize(g_worldNormal);
            vec3 viewDirection = -g_worldRayDirection;

            // Direct sun contribution.
            vec3 lit = pbrDirectLighting(N, viewDirection, sunDirection, sunRadiance, albedo, metallic, roughness);

            // Hemispheric ambient: sky above, horizon band, and a small ground/bounce
            // lift so downward-facing surfaces aren't completely black. This is a cheap
            // stand-in for a prefiltered environment map / skybox we may add later.
            vec3 ambient = ambientLight(N) * albedo * (1.0 - metallic);

            colorRGB = lit + ambient;
        }

        outputColor = vec4(colorRGB, color.a);
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
