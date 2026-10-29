precision highp float;
precision highp int;

uniform vec3 diffuseColor;

#ifdef USE_DIFFUSE_TEXTURE
uniform sampler2D tDiffuse;
#endif

in vec2 vUv;
in vec3 vWorldPosition;
in vec3 vWorldNormal;

out vec4 fragColor;

// Included only while its define is set. The material sets CAD_SHADOW only for draws that have a
// shadow map, so the shadow needs no runtime switch.
#if defined(CAD_SHADOW)
#include cadShadow.glsl;
#endif
#if defined(USE_DIFFUSE_TEXTURE) && (defined(HEX_TILING_TEXTURE_VARIATION) || defined(WATER_TILING_TEXTURE_VARIATION))
#include hexGrid.glsl;
#endif
#if defined(USE_DIFFUSE_TEXTURE) && defined(HEX_TILING_TEXTURE_VARIATION)
#include hexTiling.glsl;
#endif
#if defined(USE_DIFFUSE_TEXTURE) && defined(WATER_TILING_TEXTURE_VARIATION)
#include waterTiling.glsl;
#endif

vec3 customObjectBaseColor() {
    vec3 color = diffuseColor;
#if defined(USE_DIFFUSE_TEXTURE) && defined(HEX_TILING_TEXTURE_VARIATION)
    color *= hexTileAlbedo(tDiffuse, vUv);
#elif defined(USE_DIFFUSE_TEXTURE) && defined(WATER_TILING_TEXTURE_VARIATION)
    color *= waterTileAlbedo(tDiffuse, vUv);
#elif defined(USE_DIFFUSE_TEXTURE)
    color *= texture(tDiffuse, vUv).rgb;
#endif
    return color;
}

void main() {
    vec3 color = customObjectBaseColor();
#if defined(CAD_SHADOW)
    float occlusion = cadShadowShapeEdge(cadShadowOcclusion(vWorldPosition, normalize(vWorldNormal), 1.0));
    color *= 1.0 - occlusion * cadShadowStrength;
#endif
    fragColor = vec4(color, 1.0);
}
