#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')
#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;
const int RenderTypePackColorAndNormal = 4;
const int RenderTypeDepth = 5;
const int RenderTypeEffects = 6;

#include <packing>

vec3 packNormalToRgb( const in vec3 normal ) {
    return normalize( normal ) * 0.5 + 0.5;
}

void updateFragmentColor(int renderMode, vec4 color, float treeIndex, vec3 normal, float depth, sampler2D matCapTexture) {
    if (renderMode == RenderTypeColor || renderMode == RenderTypeEffects) {
        vec3 hsv = rgb2hsv(color.rgb);
        hsv.z = min(0.6 * hsv.z + 0.4, 1.0);
        vec3 colorRGB = hsv2rgb(hsv);
        float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
        
        vec4 albedo = vec4(colorRGB * (0.4 + 0.6 * amplitude), 1.0);

        vec2 cap = normal.xy * 0.5 + 0.5;

        vec4 mc = vec4(texture2D(matCapTexture, cap).rgb, 1.0);
        
        gl_FragColor = vec4(albedo.rgb * mc.rgb * 1.7, color.a);

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
        gl_FragColor = vec4(packNormalToRgb(normal.rgb), a);
    } else if (renderMode == RenderTypeNormal) {
        gl_FragColor = vec4(packNormalToRgb(normal), 1.0);
    } else if (renderMode == RenderTypeTreeIndex) {
        gl_FragColor = vec4(packIntToColor(treeIndex), 1.0);
    } else if (renderMode == RenderTypeDepth) {
        gl_FragColor = packDepthToRGBA(depth);
    } else {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}

#pragma glslify: export(updateFragmentColor)
