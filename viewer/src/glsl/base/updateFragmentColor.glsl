#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')
#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;
const int RenderTypePackColorAndNormal = 4;
const int RenderTypeDepth = 5;

#include <packing>

vec3 packNormalToRgb( const in vec3 normal ) {
    return normalize( normal ) * 0.5 + 0.5;
}

void updateFragmentColor(int renderMode, vec3 color, float treeIndex, vec3 normal, float depth) {
    if (renderMode == RenderTypeColor) {
        vec3 hsv = rgb2hsv(color);
        float h = hsv.x;
        hsv.z = min(0.6 * hsv.z + 0.4, 1.0);
        color = hsv2rgb(hsv);
        float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
        gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), h);
    } else if (renderMode == RenderTypePackColorAndNormal) {
        vec3 hsv = rgb2hsv(color);
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
        color = packIntToColor(treeIndex);
        gl_FragColor = vec4(color, 1.0);
    } else if (renderMode == RenderTypeDepth) {
        gl_FragColor = packDepthToRGBA(depth);
    } else {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}

#pragma glslify: export(updateFragmentColor)
